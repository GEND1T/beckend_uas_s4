import { prisma } from '../config/db';
import { recommendationRequestRepository } from '../repositories/recommendationRequest.repository';
import { spkService } from './spk.service';
import { calculateDistanceInKm } from '../utils/geo';

export interface CreateSpkRequestInput {
  customerId: number;
  kebutuhan: string;
  budgetMin: number;
  budgetMax: number;
  userLat?: number | null;
  userLng?: number | null;
  weights: {
    criteriaId: number;
    weight: number;
  }[];
}

export class SpkRequestService {
  private groupRecommendationResults(results: any[]): any[] {
    const methods = ['SAW', 'WP', 'TOPSIS'];
    
    return methods.map(method => {
      const methodResults = results.filter(r => r.methodUsed === method);
      
      // Group by product using a Map to maintain insertion order
      const productMap = new Map<number, any>();
      
      for (const row of methodResults) {
        if (!row.productStore) continue;
        
        const productId = row.productStore.productId;
        const score = row.score ? parseFloat(row.score.toString()) : 0;
        
        const storeVariant = {
          store_name: row.productStore.store?.name ?? 'Unknown Store',
          price: row.productStore.price,
          score: score,
          distanceInKm: row.productStore.distanceInKm ?? null,
          storeId: row.productStore.storeId,
          productStoreId: row.productStore.id,
          stock: row.productStore.stock,
          isAvailable: row.productStore.isAvailable
        };
        
        if (!productMap.has(productId)) {
          const brandName = row.productStore.product?.brand?.name ?? '';
          const modelName = row.productStore.product?.modelName ?? 'Unknown Product';
          const productName = brandName ? `${brandName} ${modelName}` : modelName;
          
          productMap.set(productId, {
            rank: row.ranking,
            product_name: productName,
            available_stores: [storeVariant]
          });
        } else {
          productMap.get(productId).available_stores.push(storeVariant);
        }
      }
      
      const recommendations = Array.from(productMap.values()).map(p => {
        const best_score = Math.max(...p.available_stores.map((s: any) => s.score));
        return {
          rank: p.rank,
          product_name: p.product_name,
          best_score: best_score,
          available_stores: p.available_stores
        };
      });
      
      return {
        method: method,
        recommendations: recommendations
      };
    });
  }

  // Helper to map request results and calculate store distances with fallback
  private attachDistanceToRequest(request: any): any {
    if (!request) return request;

    const customer = request.customer;
    const userLat = request.userLat ?? customer?.latitude;
    const userLng = request.userLng ?? customer?.longitude;

    if (request.recommendationResults) {
      request.recommendationResults = request.recommendationResults.map((result: any) => {
        let distanceInKm: number | null = null;

        // Fallback: only calculate if both coordinates are fully present
        if (
          userLat !== null &&
          userLat !== undefined &&
          userLng !== null &&
          userLng !== undefined &&
          result.productStore?.store?.latitude !== null &&
          result.productStore?.store?.longitude !== null &&
          result.productStore?.store?.latitude !== undefined &&
          result.productStore?.store?.longitude !== undefined
        ) {
          distanceInKm = calculateDistanceInKm(
            Number(userLat),
            Number(userLng),
            Number(result.productStore.store.latitude),
            Number(result.productStore.store.longitude)
          );
        }

        return {
          ...result,
          productStore: {
            ...result.productStore,
            distanceInKm,
            store: {
              ...result.productStore.store,
              distanceInKm
            }
          }
        };
      });

      // Group the results into the nested structure after calculating distances
      request.recommendationResults = this.groupRecommendationResults(request.recommendationResults);
    }

    return request;
  }

  async createRequest(input: CreateSpkRequestInput) {
    // 1. Validate criteria exist
    for (const w of input.weights) {
      const c = await prisma.criteria.findUnique({
        where: { id: w.criteriaId }
      });
      if (!c) {
        throw new Error(`Criteria with ID ${w.criteriaId} not found.`);
      }
    }

    // Fetch customer's coordinates from profile if not passed explicitly in payload
    let lat = input.userLat;
    let lng = input.userLng;

    if (lat === undefined || lng === undefined || lat === null || lng === null) {
      const customer = await prisma.customer.findUnique({
        where: { id: input.customerId },
        select: { latitude: true, longitude: true }
      });
      if (customer) {
        lat = lat ?? (customer.latitude ? Number(customer.latitude) : null);
        lng = lng ?? (customer.longitude ? Number(customer.longitude) : null);
      }
    }

    // 2. Perform all insertion and CTE calculation inside a single database transaction in spkService
    let newRequest;
    try {
      newRequest = await spkService.calculateRecommendationInTransaction(
        {
          customerId: input.customerId,
          kebutuhan: input.kebutuhan,
          budgetMin: input.budgetMin,
          budgetMax: input.budgetMax,
          weights: input.weights
        },
        lat,
        lng
      );
    } catch (error: any) {
      throw new Error(`SPK Engine transaction error: ${error.message}`);
    }

    // 3. Return complete request with calculations
    const result = await recommendationRequestRepository.findById(newRequest.id);
    const requestWithDistance = this.attachDistanceToRequest(result);
    if (requestWithDistance) {
      requestWithDistance.calculationDetails = await this.fetchCalculationDetails(newRequest.id);
    }
    return requestWithDistance;
  }

  async getCustomerRequests(customerId: number) {
    const list = await recommendationRequestRepository.findByCustomerId(customerId);
    return list.map(item => this.attachDistanceToRequest(item));
  }

  async getRequestDetails(id: number, customerId: number) {
    const request = await recommendationRequestRepository.findById(id);
    if (!request) {
      throw new Error(`Recommendation request with ID ${id} not found.`);
    }

    if (request.customerId !== customerId) {
      throw new Error("Unauthorized to access this recommendation request.");
    }

    const requestWithDistance = this.attachDistanceToRequest(request);
    if (requestWithDistance) {
      requestWithDistance.calculationDetails = await this.fetchCalculationDetails(id);
    }
    return requestWithDistance;
  }

  private sanitizeBigInt(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeBigInt(item));
    }
    if (typeof obj === 'object') {
      const newObj: any = {};
      for (const key of Object.keys(obj)) {
        newObj[key] = this.sanitizeBigInt(obj[key]);
      }
      return newObj;
    }
    return obj;
  }

  async fetchCalculationDetails(requestId: number) {
    const sawAggregates = await prisma.$queryRaw<any[]>`
      SELECT 
        MIN(nilai_c1) as min_c1, 
        MAX(nilai_c2) as max_c2, 
        MAX(nilai_c3) as max_c3, 
        MAX(nilai_c4) as max_c4, 
        MIN(nilai_c5) as min_c5, 
        MAX(nilai_c6) as max_c6, 
        MAX(nilai_c7) as max_c7, 
        MAX(nilai_c8) as max_c8
      FROM v_matriks 
      WHERE id_recommendation_request = ${requestId}
    `;
    const saw = sawAggregates[0] || null;

    const wpAggregates = await prisma.$queryRaw<any[]>`
      SELECT SUM(skor_s) as total_s 
      FROM v_wp 
      WHERE id_recommendation_request = ${requestId}
    `;
    const wp = wpAggregates[0] || null;

    const topsisPembagi = await prisma.$queryRaw<any[]>`
      SELECT 
        bagi_c1, bagi_c2, bagi_c3, bagi_c4, 
        bagi_c5, bagi_c6, bagi_c7, bagi_c8
      FROM v_topsis_pembagi 
      WHERE id_recommendation_request = ${requestId}
    `;
    const topsis = topsisPembagi[0] || null;

    return this.sanitizeBigInt({
      saw,
      wp,
      topsis
    });
  }
}

export const spkRequestService = new SpkRequestService();

