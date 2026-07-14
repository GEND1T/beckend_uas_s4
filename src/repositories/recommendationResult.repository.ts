import { prisma } from '../config/db';
import { RecommendationResult, Prisma } from '@prisma/client';

export class RecommendationResultRepository {
  async findAll(): Promise<RecommendationResult[]> {
    return prisma.recommendationResult.findMany({
      include: {
        productStore: {
          include: {
            product: { include: { brand: true } },
            store: true
          }
        }
      },
      orderBy: { ranking: 'asc' }
    });
  }

  async findById(id: number): Promise<RecommendationResult | null> {
    return prisma.recommendationResult.findUnique({
      where: { id },
      include: {
        productStore: {
          include: {
            product: { include: { brand: true } },
            store: true
          }
        }
      }
    });
  }

  async findByRequestId(requestId: number): Promise<RecommendationResult[]> {
    return prisma.recommendationResult.findMany({
      where: { requestId },
      include: {
        productStore: {
          include: {
            product: { include: { brand: true } },
            store: true
          }
        }
      },
      orderBy: [
        { methodUsed: 'asc' },
        { ranking: 'asc' }
      ]
    });
  }

  async create(data: Prisma.RecommendationResultUncheckedCreateInput): Promise<RecommendationResult> {
    return prisma.recommendationResult.create({
      data
    });
  }

  async createMany(data: Prisma.RecommendationResultUncheckedCreateInput[]): Promise<Prisma.BatchPayload> {
    return prisma.recommendationResult.createMany({
      data
    });
  }

  async deleteByRequestId(requestId: number): Promise<Prisma.BatchPayload> {
    return prisma.recommendationResult.deleteMany({
      where: { requestId }
    });
  }

  async delete(id: number): Promise<RecommendationResult> {
    return prisma.recommendationResult.delete({
      where: { id }
    });
  }
}

export const recommendationResultRepository = new RecommendationResultRepository();
