import { prisma } from '../config/db';

export interface CreateSpkRequestInput {
  customerId: number;
  kebutuhan: string;
  budgetMin: number;
  budgetMax: number;
  weights: {
    criteriaId: number;
    weight: number;
  }[];
}

export class SpkService {
  async calculateRecommendationInTransaction(
    input: CreateSpkRequestInput,
    lat: number | null | undefined,
    lng: number | null | undefined
  ): Promise<any> {
    return prisma.$transaction(
      async (tx) => {
        // STEP A: Insert recommendation request
        const req = await tx.recommendationRequest.create({
          data: {
            customerId: input.customerId,
            kebutuhan: input.kebutuhan,
            budgetMin: input.budgetMin,
            budgetMax: input.budgetMax,
            status: 'PENDING',
            userLat: lat,
            userLng: lng
          }
        });

        const req_id = req.id;

        // STEP B: Insert user weights mapped directly to criteriaId (1 to 5)
        const w1 = input.weights.find(w => w.criteriaId === 1)?.weight ?? 0;
        const w2 = input.weights.find(w => w.criteriaId === 2)?.weight ?? 0;
        const w3 = input.weights.find(w => w.criteriaId === 3)?.weight ?? 0;
        const w4 = input.weights.find(w => w.criteriaId === 4)?.weight ?? 0;
        const w5 = input.weights.find(w => w.criteriaId === 5)?.weight ?? 0;

        const weightData = [
          { requestId: req_id, criteriaId: 1, weight: w1 },
          { requestId: req_id, criteriaId: 2, weight: w2 },
          { requestId: req_id, criteriaId: 3, weight: w3 },
          { requestId: req_id, criteriaId: 4, weight: w4 },
          { requestId: req_id, criteriaId: 5, weight: w5 }
        ];

        await tx.recommendationWeight.createMany({
          data: weightData
        });

        // STEP C: Execute SPK Calculations via Raw SQL (CTE)
        
        // SQL FOR SAW
        const sawQuery = `
          INSERT INTO recommendation_result (recommendation_requests_id_recommendation_request, product_store_id_product_store, method_used, score, ranking)
          WITH saw_calc AS (
              SELECT dm.product_id, dm.store_id, dm.price,
                  SUM(saw.normalized_value * CASE saw.criteria_id WHEN 1 THEN ? WHEN 2 THEN ? WHEN 3 THEN ? WHEN 4 THEN ? WHEN 5 THEN ? ELSE 0 END) AS final_score
              FROM v_saw_normalized_matrix saw
              JOIN v_decision_matrix dm ON saw.product_id = dm.product_id AND saw.store_id = dm.store_id AND saw.criteria_id = dm.criteria_id
              WHERE dm.price BETWEEN ? AND ?
              GROUP BY dm.product_id, dm.store_id, dm.price
          ),
          best_product_scores AS (
              SELECT product_id, MAX(final_score) as best_score FROM saw_calc GROUP BY product_id
          ),
          ranked_products AS (
              SELECT product_id, DENSE_RANK() OVER(ORDER BY best_score DESC) as product_rank FROM best_product_scores
          )
          SELECT ?, ps.id_product_store, 'SAW', c.final_score, rp.product_rank AS ranking
          FROM saw_calc c
          JOIN ranked_products rp ON c.product_id = rp.product_id
          JOIN product_store ps ON c.product_id = ps.products_id_product AND c.store_id = ps.stores_id_store
          WHERE rp.product_rank <= 3
          ORDER BY rp.product_rank ASC, c.price ASC;
        `;

        // SQL FOR WP
        const wpQuery = `
          INSERT INTO recommendation_result (recommendation_requests_id_recommendation_request, product_store_id_product_store, method_used, score, ranking)
          WITH wp_step1 AS (
              SELECT product_id, store_id, raw_value, price,
                  CASE WHEN criteria_type = 'cost' THEN CASE criteria_id WHEN 1 THEN -? WHEN 2 THEN -? WHEN 3 THEN -? WHEN 4 THEN -? WHEN 5 THEN -? ELSE 0 END
                  ELSE CASE criteria_id WHEN 1 THEN ? WHEN 2 THEN ? WHEN 3 THEN ? WHEN 4 THEN ? WHEN 5 THEN ? ELSE 0 END END AS weight_power
              FROM v_decision_matrix WHERE price BETWEEN ? AND ?
          ),
          wp_calc AS (
              SELECT product_id, store_id, price, EXP(SUM(LOG(POW(raw_value, weight_power)))) AS final_score
              FROM wp_step1 GROUP BY product_id, store_id, price
          ),
          best_product_scores AS (
              SELECT product_id, MAX(final_score) as best_score FROM wp_calc GROUP BY product_id
          ),
          ranked_products AS (
              SELECT product_id, DENSE_RANK() OVER(ORDER BY best_score DESC) as product_rank FROM best_product_scores
          )
          SELECT ?, ps.id_product_store, 'WP', c.final_score, rp.product_rank AS ranking
          FROM wp_calc c
          JOIN ranked_products rp ON c.product_id = rp.product_id
          JOIN product_store ps ON c.product_id = ps.products_id_product AND c.store_id = ps.stores_id_store
          WHERE rp.product_rank <= 3
          ORDER BY rp.product_rank ASC, c.price ASC;
        `;

        // SQL FOR TOPSIS
        const topsisQuery = `
          INSERT INTO recommendation_result (recommendation_requests_id_recommendation_request, product_store_id_product_store, method_used, score, ranking)
          WITH t_step1 AS (
              SELECT tn.product_id, tn.store_id, tn.criteria_id, tn.criteria_type, dm.price,
                  tn.normalized_value * CASE tn.criteria_id WHEN 1 THEN ? WHEN 2 THEN ? WHEN 3 THEN ? WHEN 4 THEN ? WHEN 5 THEN ? ELSE 0 END AS weighted_value
              FROM v_topsis_normalisasi tn
              JOIN v_decision_matrix dm ON tn.product_id = dm.product_id AND tn.store_id = dm.store_id AND tn.criteria_id = dm.criteria_id
              WHERE dm.price BETWEEN ? AND ?
          ),
          t_ideal AS (
              SELECT criteria_id,
                  CASE WHEN criteria_type = 'benefit' THEN MAX(weighted_value) ELSE MIN(weighted_value) END AS ideal_pos,
                  CASE WHEN criteria_type = 'benefit' THEN MIN(weighted_value) ELSE MAX(weighted_value) END AS ideal_neg
              FROM t_step1 GROUP BY criteria_id, criteria_type
          ),
          t_dist AS (
              SELECT s1.product_id, s1.store_id, s1.price,
                  SQRT(SUM(POW(s1.weighted_value - idl.ideal_pos, 2))) AS d_pos,
                  SQRT(SUM(POW(s1.weighted_value - idl.ideal_neg, 2))) AS d_neg
              FROM t_step1 s1 JOIN t_ideal idl ON s1.criteria_id = idl.criteria_id GROUP BY s1.product_id, s1.store_id, s1.price
          ),
          t_calc AS (
              SELECT product_id, store_id, price, (d_neg / (d_pos + d_neg)) AS final_score
              FROM t_dist WHERE (d_pos + d_neg) > 0
          ),
          best_product_scores AS (
              SELECT product_id, MAX(final_score) as best_score FROM t_calc GROUP BY product_id
          ),
          ranked_products AS (
              SELECT product_id, DENSE_RANK() OVER(ORDER BY best_score DESC) as product_rank FROM best_product_scores
          )
          SELECT ?, ps.id_product_store, 'TOPSIS', c.final_score, rp.product_rank AS ranking
          FROM t_calc c
          JOIN ranked_products rp ON c.product_id = rp.product_id
          JOIN product_store ps ON c.product_id = ps.products_id_product AND c.store_id = ps.stores_id_store
          WHERE rp.product_rank <= 3
          ORDER BY rp.product_rank ASC, c.price ASC;
        `;

        // Execute 3 INSERT queries using tx.$executeRawUnsafe
        await tx.$executeRawUnsafe(sawQuery, w1, w2, w3, w4, w5, input.budgetMin, input.budgetMax, req_id);
        await tx.$executeRawUnsafe(wpQuery, w1, w2, w3, w4, w5, w1, w2, w3, w4, w5, input.budgetMin, input.budgetMax, req_id);
        await tx.$executeRawUnsafe(topsisQuery, w1, w2, w3, w4, w5, input.budgetMin, input.budgetMax, req_id);

        // Update status to SUCCESS
        const updatedReq = await tx.recommendationRequest.update({
          where: { id: req_id },
          data: { status: 'SUCCESS' }
        });

        return updatedReq;
      },
      {
        maxWait: 10000, // 10 seconds to wait for a connection
        timeout: 30000, // 30 seconds limit for the transaction to finish
      }
    );
  }
}

export const spkService = new SpkService();
