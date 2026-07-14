import { subCriteriaRepository } from '../repositories/subCriteria.repository';
import { criteriaRepository } from '../repositories/criteria.repository';
import { SubCriteria, Prisma } from '@prisma/client';

export class SubCriteriaService {
  async getAllSubCriteria(): Promise<SubCriteria[]> {
    return subCriteriaRepository.findAll();
  }

  async getSubCriteriaById(id: number): Promise<SubCriteria> {
    const subCriteria = await subCriteriaRepository.findById(id);
    if (!subCriteria) {
      throw new Error(`SubCriteria with ID ${id} not found.`);
    }
    return subCriteria;
  }

  async getSubCriteriaByCriteriaId(criteriaId: number): Promise<SubCriteria[]> {
    const criteria = await criteriaRepository.findById(criteriaId);
    if (!criteria) {
      throw new Error(`Criteria with ID ${criteriaId} not found.`);
    }
    return subCriteriaRepository.findByCriteriaId(criteriaId);
  }

  async createSubCriteria(data: Prisma.SubCriteriaUncheckedCreateInput): Promise<SubCriteria> {
    // Verify criteria exists
    const criteria = await criteriaRepository.findById(data.criteriaId);
    if (!criteria) {
      throw new Error(`Criteria with ID ${data.criteriaId} not found.`);
    }
    return subCriteriaRepository.create(data);
  }

  async updateSubCriteria(id: number, data: Prisma.SubCriteriaUncheckedUpdateInput): Promise<SubCriteria> {
    await this.getSubCriteriaById(id);
    if (data.criteriaId && typeof data.criteriaId === 'number') {
      const criteria = await criteriaRepository.findById(data.criteriaId);
      if (!criteria) {
        throw new Error(`Criteria with ID ${data.criteriaId} not found.`);
      }
    }
    return subCriteriaRepository.update(id, data);
  }

  async deleteSubCriteria(id: number): Promise<SubCriteria> {
    await this.getSubCriteriaById(id);
    return subCriteriaRepository.delete(id);
  }
}

export const subCriteriaService = new SubCriteriaService();
