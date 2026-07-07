import { prisma } from '../config/db';
import { SubCriteria, Prisma } from '@prisma/client';

export class SubCriteriaRepository {
  async findAll(): Promise<SubCriteria[]> {
    return prisma.subCriteria.findMany({
      include: { criteria: true },
      orderBy: { id: 'asc' }
    });
  }

  async findById(id: number): Promise<SubCriteria | null> {
    return prisma.subCriteria.findUnique({
      where: { id },
      include: { criteria: true }
    });
  }

  async findByCriteriaId(criteriaId: number): Promise<SubCriteria[]> {
    return prisma.subCriteria.findMany({
      where: { criteriaId },
      orderBy: { valueNumeric: 'asc' }
    });
  }

  async create(data: Prisma.SubCriteriaUncheckedCreateInput): Promise<SubCriteria> {
    return prisma.subCriteria.create({
      data
    });
  }

  async update(id: number, data: Prisma.SubCriteriaUncheckedUpdateInput): Promise<SubCriteria> {
    return prisma.subCriteria.update({
      where: { id },
      data
    });
  }

  async delete(id: number): Promise<SubCriteria> {
    return prisma.subCriteria.delete({
      where: { id }
    });
  }
}

export const subCriteriaRepository = new SubCriteriaRepository();
