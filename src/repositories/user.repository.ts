import { prisma } from '../config/db';
import { User, Prisma } from '@prisma/client';

export class UserRepository {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      include: { store: true },
      orderBy: { id: 'asc' }
    });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { store: true }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { store: true }
    });
  }

  async findByStoreId(storeId: number): Promise<User[]> {
    return prisma.user.findMany({
      where: { storeId },
      include: { store: true }
    });
  }

  async create(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    return prisma.user.create({
      data
    });
  }

  async update(id: number, data: Prisma.UserUncheckedUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  async delete(id: number): Promise<User> {
    return prisma.user.delete({
      where: { id }
    });
  }
}

export const userRepository = new UserRepository();
