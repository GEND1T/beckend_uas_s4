import { prisma } from '../config/db';
import { ProductStore, Prisma } from '@prisma/client';

export class ProductStoreRepository {
  async findAll(): Promise<ProductStore[]> {
    return prisma.productStore.findMany({
      include: {
        product: {
          include: { brand: true }
        },
        store: true
      },
      orderBy: { id: 'asc' }
    });
  }

  async findById(id: number): Promise<ProductStore | null> {
    return prisma.productStore.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            brand: true,
            productCriteria: {
              include: {
                subCriteria: {
                  include: {
                    criteria: true
                  }
                }
              }
            }
          }
        },
        store: true
      }
    });
  }

  async findByStoreAndProduct(storeId: number, productId: number): Promise<ProductStore | null> {
    return prisma.productStore.findFirst({
      where: { storeId, productId }
    });
  }

  async findByStoreId(storeId: number): Promise<ProductStore[]> {
    return prisma.productStore.findMany({
      where: { storeId },
      include: {
        product: {
          include: { brand: true }
        }
      },
      orderBy: { id: 'asc' }
    });
  }

  async findAvailableByProductId(productId: number): Promise<ProductStore[]> {
    return prisma.productStore.findMany({
      where: {
        productId,
        isAvailable: 1,
        store: {
          isActive: 1
        }
      },
      include: {
        store: true
      }
    });
  }

  async create(data: Prisma.ProductStoreUncheckedCreateInput): Promise<ProductStore> {
    return prisma.productStore.create({
      data
    });
  }

  async update(id: number, data: Prisma.ProductStoreUncheckedUpdateInput): Promise<ProductStore> {
    return prisma.productStore.update({
      where: { id },
      data
    });
  }

  async delete(id: number): Promise<ProductStore> {
    return prisma.productStore.delete({
      where: { id }
    });
  }
}

export const productStoreRepository = new ProductStoreRepository();
