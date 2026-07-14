import { prisma } from '../config/db';
import { Criteria, Prisma } from '@prisma/client';

export class CriteriaRepository {
  async findAll(): Promise<Criteria[]> {
    return prisma.criteria.findMany({
      include: { subCriteria: true },
      orderBy: { code: 'asc' }
    });
  }

  async findById(id: number): Promise<Criteria | null> {
    return prisma.criteria.findUnique({
      where: { id },
      include: { subCriteria: true }
    });
  }

  async findByCode(code: string): Promise<Criteria | null> {
    return prisma.criteria.findFirst({
      where: { code },
      include: { subCriteria: true }
    });
  }

  async create(data: Prisma.CriteriaCreateInput): Promise<Criteria> {
    return prisma.criteria.create({
      data
    });
  }

  async update(id: number, data: Prisma.CriteriaUpdateInput): Promise<Criteria> {
    return prisma.criteria.update({
      where: { id },
      data
    });
  }

  async delete(id: number): Promise<Criteria> {
    return prisma.criteria.delete({
      where: { id }
    });
  }
}

export const criteriaRepository = new CriteriaRepository();
