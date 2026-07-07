import { brandRepository } from '../repositories/brand.repository';
import { Brand, Prisma } from '@prisma/client';

export class BrandService {
  async getAllBrands(): Promise<Brand[]> {
    return brandRepository.findAll();
  }

  async getBrandById(id: number): Promise<Brand> {
    const brand = await brandRepository.findById(id);
    if (!brand) {
      throw new Error(`Brand with ID ${id} not found.`);
    }
    return brand;
  }

  async createBrand(data: Prisma.BrandCreateInput): Promise<Brand> {
    const existing = await brandRepository.findByName(data.name);
    if (existing) {
      throw new Error(`Brand with name '${data.name}' already exists.`);
    }
    return brandRepository.create(data);
  }

  async updateBrand(id: number, data: Prisma.BrandUpdateInput): Promise<Brand> {
    await this.getBrandById(id);
    if (data.name && typeof data.name === 'string') {
      const existing = await brandRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new Error(`Brand with name '${data.name}' already exists.`);
      }
    }
    return brandRepository.update(id, data);
  }

  async deleteBrand(id: number): Promise<Brand> {
    await this.getBrandById(id);
    return brandRepository.delete(id);
  }
}

export const brandService = new BrandService();
