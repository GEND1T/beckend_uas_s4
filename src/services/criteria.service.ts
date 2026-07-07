import { criteriaRepository } from '../repositories/criteria.repository';
import { Criteria, Prisma } from '@prisma/client';

export class CriteriaService {
  async getAllCriteria(): Promise<Criteria[]> {
    return criteriaRepository.findAll();
  }

  async getCriteriaById(id: number): Promise<Criteria> {
    const criteria = await criteriaRepository.findById(id);
    if (!criteria) {
      throw new Error(`Criteria with ID ${id} not found.`);
    }
    return criteria;
  }

  async createCriteria(data: Prisma.CriteriaCreateInput): Promise<Criteria> {
    const existing = await criteriaRepository.findByCode(data.code);
    if (existing) {
      throw new Error(`Criteria with code '${data.code}' already exists.`);
    }
    return criteriaRepository.create(data);
  }

  async updateCriteria(id: number, data: Prisma.CriteriaUpdateInput): Promise<Criteria> {
    await this.getCriteriaById(id);
    if (data.code && typeof data.code === 'string') {
      const existing = await criteriaRepository.findByCode(data.code);
      if (existing && existing.id !== id) {
        throw new Error(`Criteria with code '${data.code}' already exists.`);
      }
    }
    return criteriaRepository.update(id, data);
  }

  async deleteCriteria(id: number): Promise<Criteria> {
    await this.getCriteriaById(id);
    return criteriaRepository.delete(id);
  }
}

export const criteriaService = new CriteriaService();
