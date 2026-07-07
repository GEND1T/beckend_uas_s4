import { prisma } from '../config/db';
import { Product, Prisma } from '@prisma/client';

export class ProductRepository {
  async findAll(): Promise<Product[]> {
    return prisma.product.findMany({
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
      },
      orderBy: { id: 'asc' }
    });
  }

  async findById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
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
    });
  }

  async create(data: Prisma.ProductUncheckedCreateInput): Promise<Product> {
    return prisma.product.create({
      data
    });
  }

  async update(id: number, data: Prisma.ProductUncheckedUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data
    });
  }

  async delete(id: number): Promise<Product> {
    // Delete associated criteria first or handle cascading if necessary
    // Prisma will respect database constraints or we can handle it at service layer.
    return prisma.product.delete({
      where: { id }
    });
  }
}

export const productRepository = new ProductRepository();
