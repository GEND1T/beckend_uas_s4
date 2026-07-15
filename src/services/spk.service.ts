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

        // STEP B: Insert user weights mapped directly to all criteria currently in the database
        const criteriaList = await tx.criteria.findMany({
          select: { id: true }
        });

        const weightData = criteriaList.map(c => {
          const w = input.weights.find(iw => iw.criteriaId === c.id);
          return {
            requestId: req_id,
            criteriaId: c.id,
            weight: w ? w.weight : 0.0
          };
        });

        await tx.recommendationWeight.createMany({
          data: weightData
        });

        // STEP C: Execute SPK Calculations via Raw SQL (CTE)
        
        // SQL FOR SAW
        const sawQuery = `
          INSERT INTO recommendation_result (recommendation_requests_id_recommendation_request, product_store_id_product_store, method_used, score, ranking)
          WITH request_weights AS (
              SELECT criteria_id_criteria AS criteria_id, weight
              FROM recommendation_weight
              WHERE recommendation_requests_id_recommendation_request = ?
          ),
          filtered_dm AS (
              SELECT product_id, store_id, criteria_id, criteria_type, raw_value, price
              FROM v_decision_matrix
              WHERE price BETWEEN ? AND ?
          ),
          criteria_minmax AS (
              SELECT 
                  criteria_id,
                  MAX(raw_value) AS max_value,
                  MIN(raw_value) AS min_value
              FROM filtered_dm
              GROUP BY criteria_id
          ),
          saw_normalized AS (
              SELECT 
                  fdm.product_id,
                  fdm.store_id,
                  fdm.criteria_id,
                  CASE 
                      WHEN fdm.criteria_type = 'benefit' AND mm.max_value > 0 THEN (fdm.raw_value / mm.max_value)
                      WHEN fdm.criteria_type = 'cost' AND fdm.raw_value > 0 THEN (mm.min_value / fdm.raw_value)
                      ELSE 0 
                  END AS normalized_value
              FROM filtered_dm fdm
              JOIN criteria_minmax mm ON fdm.criteria_id = mm.criteria_id
          ),
          saw_calc AS (
              SELECT sn.product_id, sn.store_id,
                  SUM(sn.normalized_value * w.weight) AS final_score
              FROM saw_normalized sn
              JOIN request_weights w ON w.criteria_id = sn.criteria_id
              GROUP BY sn.product_id, sn.store_id
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
          ORDER BY rp.product_rank ASC, ps.price ASC;
        `;

        // SQL FOR WP
        const wpQuery = `
          INSERT INTO recommendation_result (recommendation_requests_id_recommendation_request, product_store_id_product_store, method_used, score, ranking)
          WITH request_weights AS (
              SELECT criteria_id_criteria AS criteria_id, weight
              FROM recommendation_weight
              WHERE recommendation_requests_id_recommendation_request = ?
          ),
          total_weight AS (
              SELECT SUM(weight) AS sum_w FROM request_weights
          ),
          normalized_weights AS (
              SELECT rw.criteria_id,
                  CASE WHEN tw.sum_w > 0 THEN (rw.weight / tw.sum_w) ELSE 0 END AS norm_weight
              FROM request_weights rw
              CROSS JOIN total_weight tw
          ),
          filtered_dm AS (
              SELECT product_id, store_id, criteria_id, criteria_type, raw_value, price
              FROM v_decision_matrix
              WHERE price BETWEEN ? AND ?
          ),
          wp_s AS (
              SELECT 
                  fdm.product_id,
                  fdm.store_id,
                  EXP(SUM(
                      (CASE WHEN fdm.criteria_type = 'cost' THEN -nw.norm_weight ELSE nw.norm_weight END) 
                      * LOG(GREATEST(fdm.raw_value, 0.0001))
                  )) AS s_value
              FROM filtered_dm fdm
              JOIN normalized_weights nw ON fdm.criteria_id = nw.criteria_id
              GROUP BY fdm.product_id, fdm.store_id
          ),
          sum_s AS (
              SELECT SUM(s_value) AS total_s FROM wp_s
          ),
          wp_calc AS (
              SELECT 
                  ws.product_id,
                  ws.store_id,
                  CASE WHEN ss.total_s > 0 THEN (ws.s_value / ss.total_s) ELSE 0 END AS final_score
              FROM wp_s ws
              CROSS JOIN sum_s ss
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
          ORDER BY rp.product_rank ASC, ps.price ASC;
        `;

        // SQL FOR TOPSIS
        const topsisQuery = `
          INSERT INTO recommendation_result (recommendation_requests_id_recommendation_request, product_store_id_product_store, method_used, score, ranking)
          WITH request_weights AS (
              SELECT criteria_id_criteria AS criteria_id, weight
              FROM recommendation_weight
              WHERE recommendation_requests_id_recommendation_request = ?
          ),
          filtered_dm AS (
              SELECT product_id, store_id, criteria_id, criteria_type, raw_value, price
              FROM v_decision_matrix
              WHERE price BETWEEN ? AND ?
          ),
          t_pembagi AS (
              SELECT 
                  criteria_id,
                  SQRT(SUM(POW(raw_value, 2))) AS pembagi
              FROM filtered_dm
              GROUP BY criteria_id
          ),
          t_normalized AS (
              SELECT 
                  fdm.product_id,
                  fdm.store_id,
                  fdm.criteria_id,
                  fdm.criteria_type,
                  CASE WHEN tp.pembagi > 0 THEN (fdm.raw_value / tp.pembagi) ELSE 0 END AS normalized_value
              FROM filtered_dm fdm
              JOIN t_pembagi tp ON fdm.criteria_id = tp.criteria_id
          ),
          t_weighted AS (
              SELECT 
                  tn.product_id,
                  tn.store_id,
                  tn.criteria_id,
                  tn.criteria_type,
                  (tn.normalized_value * w.weight) AS weighted_value
              FROM t_normalized tn
              JOIN request_weights w ON w.criteria_id = tn.criteria_id
          ),
          t_ideal AS (
              SELECT 
                  criteria_id,
                  CASE WHEN criteria_type = 'benefit' THEN MAX(weighted_value) ELSE MIN(weighted_value) END AS ideal_pos,
                  CASE WHEN criteria_type = 'benefit' THEN MIN(weighted_value) ELSE MAX(weighted_value) END AS ideal_neg
              FROM t_weighted
              GROUP BY criteria_id, criteria_type
          ),
          t_dist AS (
              SELECT 
                  tw.product_id,
                  tw.store_id,
                  SQRT(SUM(POW(tw.weighted_value - idl.ideal_pos, 2))) AS d_pos,
                  SQRT(SUM(POW(tw.weighted_value - idl.ideal_neg, 2))) AS d_neg
              FROM t_weighted tw
              JOIN t_ideal idl ON tw.criteria_id = idl.criteria_id
              GROUP BY tw.product_id, tw.store_id
          ),
          t_calc AS (
              SELECT 
                  product_id,
                  store_id,
                  CASE WHEN (d_pos + d_neg) > 0 THEN (d_neg / (d_pos + d_neg)) ELSE 0 END AS final_score
              FROM t_dist
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
          ORDER BY rp.product_rank ASC, ps.price ASC;
        `;

        // Execute 3 INSERT queries using tx.$executeRawUnsafe
        await tx.$executeRawUnsafe(sawQuery, req_id, input.budgetMin, input.budgetMax, req_id);
        await tx.$executeRawUnsafe(wpQuery, req_id, input.budgetMin, input.budgetMax, req_id);
        await tx.$executeRawUnsafe(topsisQuery, req_id, input.budgetMin, input.budgetMax, req_id);

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
