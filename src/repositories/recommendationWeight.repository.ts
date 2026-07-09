import { prisma } from '../config/db';
import { RecommendationWeight, Prisma } from '@prisma/client';

export class RecommendationWeightRepository {
  async findAll(): Promise<RecommendationWeight[]> {
    return prisma.recommendationWeight.findMany({
      include: {
        criteria: true
      }
    });
  }

  async findById(id: number): Promise<RecommendationWeight | null> {
    return prisma.recommendationWeight.findUnique({
      where: { id },
      include: {
        criteria: true
      }
    });
  }

  async findByRequestId(requestId: number): Promise<RecommendationWeight[]> {
    return prisma.recommendationWeight.findMany({
      where: { requestId },
      include: {
        criteria: true
      }
    });
  }

  async create(data: Prisma.RecommendationWeightUncheckedCreateInput): Promise<RecommendationWeight> {
    return prisma.recommendationWeight.create({
      data
    });
  }

  async createMany(data: Prisma.RecommendationWeightUncheckedCreateInput[]): Promise<Prisma.BatchPayload> {
    return prisma.recommendationWeight.createMany({
      data
    });
  }

  async deleteByRequestId(requestId: number): Promise<Prisma.BatchPayload> {
    return prisma.recommendationWeight.deleteMany({
      where: { requestId }
    });
  }

  async delete(id: number): Promise<RecommendationWeight> {
    return prisma.recommendationWeight.delete({
      where: { id }
    });
  }
}

export const recommendationWeightRepository = new RecommendationWeightRepository();
