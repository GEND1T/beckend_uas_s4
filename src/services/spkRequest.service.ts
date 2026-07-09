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
    return this.attachDistanceToRequest(result);
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

    return this.attachDistanceToRequest(request);
  }
}

export const spkRequestService = new SpkRequestService();
