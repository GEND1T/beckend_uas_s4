import { prisma } from '../config/db';
import { ProductCriteria, Prisma } from '@prisma/client';

export class ProductCriteriaRepository {
  async findAll(): Promise<ProductCriteria[]> {
    return prisma.productCriteria.findMany({
      include: {
        product: true,
        subCriteria: {
          include: { criteria: true }
        }
      }
    });
  }

  async findById(id: number): Promise<ProductCriteria | null> {
    return prisma.productCriteria.findUnique({
      where: { id },
      include: {
        product: true,
        subCriteria: {
          include: { criteria: true }
        }
      }
    });
  }

  async findByProductId(productId: number): Promise<ProductCriteria[]> {
    return prisma.productCriteria.findMany({
      where: { productId },
      include: {
        subCriteria: {
          include: { criteria: true }
        }
      }
    });
  }

  async create(data: Prisma.ProductCriteriaUncheckedCreateInput): Promise<ProductCriteria> {
    return prisma.productCriteria.create({
      data
    });
  }

  async createMany(data: Prisma.ProductCriteriaUncheckedCreateInput[]): Promise<Prisma.BatchPayload> {
    return prisma.productCriteria.createMany({
      data
    });
  }

  async deleteByProductId(productId: number): Promise<Prisma.BatchPayload> {
    return prisma.productCriteria.deleteMany({
      where: { productId }
    });
  }

  async delete(id: number): Promise<ProductCriteria> {
    return prisma.productCriteria.delete({
      where: { id }
    });
  }
}

export const productCriteriaRepository = new ProductCriteriaRepository();
