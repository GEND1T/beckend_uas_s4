import { prisma } from '../config/db';
import { recommendationRequestRepository } from '../repositories/recommendationRequest.repository';
import { recommendationResultRepository } from '../repositories/recommendationResult.repository';
import { criteriaRepository } from '../repositories/criteria.repository';

export class SpkService {
  async calculateRecommendation(requestId: number): Promise<void> {
    // 1. Fetch the request
    const request = await recommendationRequestRepository.findById(requestId);
    if (!request) {
      throw new Error(`Recommendation request with ID ${requestId} not found.`);
    }

    const { budgetMin, budgetMax, recommendationWeights } = request;

    // 2. Fetch all criteria
    const allCriteria = await criteriaRepository.findAll();
    if (allCriteria.length === 0) {
      throw new Error("No criteria configured in the system.");
    }

    // 3. Fetch alternatives matching budget constraints
    const alternatives = await prisma.productStore.findMany({
      where: {
        price: {
          gte: budgetMin,
          lte: budgetMax
        },
        isAvailable: 1,
        store: {
          isActive: 1
        }
      },
      include: {
        product: {
          include: {
            productCriteria: {
              include: {
                subCriteria: true
              }
            }
          }
        },
        store: true
      }
    });

    // If no alternatives are found, we clear old results and mark status as SUCCESS or FAILED with no results.
    if (alternatives.length === 0) {
      await recommendationResultRepository.deleteByRequestId(requestId);
      await recommendationRequestRepository.update(requestId, { status: 'SUCCESS' });
      return;
    }

    // 4. Map criteria weights and normalize them so they sum to 1
    const weightMap = new Map<number, number>();
    for (const rw of recommendationWeights) {
      const criteriaId = rw.subCriteria.criteriaId;
      weightMap.set(criteriaId, Number(rw.weight));
    }

    const normalizedWeights = new Map<number, number>();
    let totalWeight = 0;
    for (const crit of allCriteria) {
      const w = weightMap.get(crit.id) || 0;
      totalWeight += w;
    }

    if (totalWeight > 0) {
      for (const crit of allCriteria) {
        const w = weightMap.get(crit.id) || 0;
        normalizedWeights.set(crit.id, w / totalWeight);
      }
    } else {
      const equalWeight = 1 / allCriteria.length;
      for (const crit of allCriteria) {
        normalizedWeights.set(crit.id, equalWeight);
      }
    }

    // 5. Construct Decision Matrix
    const decisionMatrix = alternatives.map(alt => {
      const criteriaValues = new Map<number, number>();
      
      // Default to 0 if criteria not set on product
      for (const crit of allCriteria) {
        criteriaValues.set(crit.id, 0);
      }

      // Override with actual values
      for (const pc of alt.product.productCriteria) {
        criteriaValues.set(pc.subCriteria.criteriaId, pc.subCriteria.valueNumeric);
      }

      return {
        productStoreId: alt.id,
        values: criteriaValues
      };
    });

    // Min and Max values per criteria (needed for SAW and checking)
    const minValues = new Map<number, number>();
    const maxValues = new Map<number, number>();
    for (const crit of allCriteria) {
      const values = decisionMatrix.map(row => row.values.get(crit.id) || 0);
      minValues.set(crit.id, Math.min(...values));
      maxValues.set(crit.id, Math.max(...values));
    }

    // --- METHOD 1: SAW (Simple Additive Weighting) ---
    const sawRaw = decisionMatrix.map(row => {
      let score = 0;
      for (const crit of allCriteria) {
        const x = row.values.get(crit.id) || 0;
        const w = normalizedWeights.get(crit.id) || 0;
        const max = maxValues.get(crit.id) || 0;
        const min = minValues.get(crit.id) || 0;

        let r = 0;
        if (crit.type.toLowerCase() === 'benefit') {
          r = max > 0 ? x / max : 0;
        } else { // cost
          r = x > 0 ? min / x : 0;
        }
        score += w * r;
      }
      return { productStoreId: row.productStoreId, score };
    });

    // --- METHOD 2: WP (Weighted Product) ---
    const wpRawS = decisionMatrix.map(row => {
      let s = 1;
      for (const crit of allCriteria) {
        const x = row.values.get(crit.id) || 0;
        const w = normalizedWeights.get(crit.id) || 0;
        const isBenefit = crit.type.toLowerCase() === 'benefit';

        const exponent = isBenefit ? w : -w;
        const base = x > 0 ? x : 1; // avoid 0 base to negative exponents
        s *= Math.pow(base, exponent);
      }
      return { productStoreId: row.productStoreId, sValue: s };
    });

    const sumSValue = wpRawS.reduce((sum, item) => sum + item.sValue, 0);
    const wpRaw = wpRawS.map(item => ({
      productStoreId: item.productStoreId,
      score: sumSValue > 0 ? item.sValue / sumSValue : 0
    }));

    // --- METHOD 3: TOPSIS ---
    // Vector normalization denominator: sqrt(sum(x_ij^2))
    const sumOfSquares = new Map<number, number>();
    for (const crit of allCriteria) {
      const sumSq = decisionMatrix.reduce((sum, row) => {
        const val = row.values.get(crit.id) || 0;
        return sum + (val * val);
      }, 0);
      sumOfSquares.set(crit.id, sumSq);
    }

    const weightedNormalized = decisionMatrix.map(row => {
      const vValues = new Map<number, number>();
      for (const crit of allCriteria) {
        const x = row.values.get(crit.id) || 0;
        const w = normalizedWeights.get(crit.id) || 0;
        const sumSq = sumOfSquares.get(crit.id) || 0;
        const r = sumSq > 0 ? x / Math.sqrt(sumSq) : 0;
        vValues.set(crit.id, w * r);
      }
      return { productStoreId: row.productStoreId, vValues };
    });

    const idealPositive = new Map<number, number>();
    const idealNegative = new Map<number, number>();
    for (const crit of allCriteria) {
      const vVals = weightedNormalized.map(row => row.vValues.get(crit.id) || 0);
      const maxV = Math.max(...vVals);
      const minV = Math.min(...vVals);

      if (crit.type.toLowerCase() === 'benefit') {
        idealPositive.set(crit.id, maxV);
        idealNegative.set(crit.id, minV);
      } else { // cost
        idealPositive.set(crit.id, minV);
        idealNegative.set(crit.id, maxV);
      }
    }

    const topsisRaw = weightedNormalized.map(row => {
      let sumSqPos = 0;
      let sumSqNeg = 0;
      for (const crit of allCriteria) {
        const v = row.vValues.get(crit.id) || 0;
        const posIdeal = idealPositive.get(crit.id) || 0;
        const negIdeal = idealNegative.get(crit.id) || 0;

        sumSqPos += Math.pow(v - posIdeal, 2);
        sumSqNeg += Math.pow(v - negIdeal, 2);
      }
      const dPos = Math.sqrt(sumSqPos);
      const dNeg = Math.sqrt(sumSqNeg);
      const score = (dPos + dNeg) > 0 ? dNeg / (dPos + dNeg) : 0;
      return { productStoreId: row.productStoreId, score };
    });

    // --- Reranking & Persisting ---
    const rank = (results: { productStoreId: number; score: number }[]) => {
      const sorted = [...results].sort((a, b) => b.score - a.score);
      return results.map(item => {
        const ranking = sorted.findIndex(s => s.productStoreId === item.productStoreId) + 1;
        return {
          productStoreId: item.productStoreId,
          score: item.score,
          ranking
        };
      });
    };

    const sawRanked = rank(sawRaw);
    const wpRanked = rank(wpRaw);
    const topsisRanked = rank(topsisRaw);

    // Prepare insert list
    const resultsToInsert: any[] = [];

    sawRanked.forEach(item => {
      resultsToInsert.push({
        requestId,
        productStoreId: item.productStoreId,
        methodUsed: 'SAW',
        score: item.score,
        ranking: item.ranking
      });
    });

    wpRanked.forEach(item => {
      resultsToInsert.push({
        requestId,
        productStoreId: item.productStoreId,
        methodUsed: 'WP',
        score: item.score,
        ranking: item.ranking
      });
    });

    topsisRanked.forEach(item => {
      resultsToInsert.push({
        requestId,
        productStoreId: item.productStoreId,
        methodUsed: 'TOPSIS',
        score: item.score,
        ranking: item.ranking
      });
    });

    // Delete existing results first (to keep idempotency)
    await recommendationResultRepository.deleteByRequestId(requestId);

    // Bulk save
    await recommendationResultRepository.createMany(resultsToInsert);

    // Update status
    await recommendationRequestRepository.update(requestId, { status: 'SUCCESS' });
  }
}

export const spkService = new SpkService();
