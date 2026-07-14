import { prisma } from '../config/db';
import { Store, Prisma } from '@prisma/client';

export class StoreRepository {
  async findAll(): Promise<Store[]> {
    return prisma.store.findMany({
      orderBy: { id: 'asc' }
    });
  }

  async findActive(): Promise<Store[]> {
    return prisma.store.findMany({
      where: { isActive: 1 },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: number): Promise<Store | null> {
    return prisma.store.findUnique({
      where: { id }
    });
  }

  async findByPhone(phone: string): Promise<Store | null> {
    return prisma.store.findUnique({
      where: { phone }
    });
  }

  async create(data: Prisma.StoreCreateInput): Promise<Store> {
    return prisma.store.create({
      data
    });
  }

  async update(id: number, data: Prisma.StoreUpdateInput): Promise<Store> {
    return prisma.store.update({
      where: { id },
      data
    });
  }

  async delete(id: number): Promise<Store> {
    return prisma.store.delete({
      where: { id }
    });
  }
}

export const storeRepository = new StoreRepository();
