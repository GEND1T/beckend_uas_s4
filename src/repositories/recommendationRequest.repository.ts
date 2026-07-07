import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export class RecommendationRequestRepository {
  async findAll(): Promise<any[]> {
    return prisma.recommendationRequest.findMany({
      include: {
        customer: true,
        recommendationWeights: {
          include: {
            subCriteria: {
              include: { criteria: true }
            }
          }
        },
        recommendationResults: {
          include: {
            productStore: {
              include: {
                product: { include: { brand: true } },
                store: true
              }
            }
          },
          orderBy: { ranking: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: number): Promise<any | null> {
    return prisma.recommendationRequest.findUnique({
      where: { id },
      include: {
        customer: true,
        recommendationWeights: {
          include: {
            subCriteria: {
              include: { criteria: true }
            }
          }
        },
        recommendationResults: {
          include: {
            productStore: {
              include: {
                product: { include: { brand: true } },
                store: true
              }
            }
          },
          orderBy: { ranking: 'asc' }
        }
      }
    });
  }

  async findByCustomerId(customerId: number): Promise<any[]> {
    return prisma.recommendationRequest.findMany({
      where: { customerId },
      include: {
        customer: true,
        recommendationWeights: {
          include: {
            subCriteria: {
              include: { criteria: true }
            }
          }
        },
        recommendationResults: {
          include: {
            productStore: {
              include: {
                product: { include: { brand: true } },
                store: true
              }
            }
          },
          orderBy: { ranking: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: Prisma.RecommendationRequestUncheckedCreateInput): Promise<any> {
    return prisma.recommendationRequest.create({
      data
    });
  }

  async update(id: number, data: Prisma.RecommendationRequestUncheckedUpdateInput): Promise<any> {
    return prisma.recommendationRequest.update({
      where: { id },
      data
    });
  }

  async delete(id: number): Promise<any> {
    return prisma.recommendationRequest.delete({
      where: { id }
    });
  }
}

export const recommendationRequestRepository = new RecommendationRequestRepository();
