import { prisma } from '../config/db';
import { Brand, Prisma } from '@prisma/client';

export class BrandRepository {
  async findAll(): Promise<Brand[]> {
    return prisma.brand.findMany({
      orderBy: { id: 'asc' }
    });
  }

  async findById(id: number): Promise<Brand | null> {
    return prisma.brand.findUnique({
      where: { id }
    });
  }

  async findByName(name: string): Promise<Brand | null> {
    return prisma.brand.findUnique({
      where: { name }
    });
  }

  async create(data: Prisma.BrandCreateInput): Promise<Brand> {
    return prisma.brand.create({
      data
    });
  }

  async update(id: number, data: Prisma.BrandUpdateInput): Promise<Brand> {
    return prisma.brand.update({
      where: { id },
      data
    });
  }

  async delete(id: number): Promise<Brand> {
    return prisma.brand.delete({
      where: { id }
    });
  }
}

export const brandRepository = new BrandRepository();
