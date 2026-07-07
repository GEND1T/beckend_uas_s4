import { storeRepository } from '../repositories/store.repository';
import { Store, Prisma } from '@prisma/client';

export class StoreService {
  async getAllStores(): Promise<Store[]> {
    return storeRepository.findAll();
  }

  async getActiveStores(): Promise<Store[]> {
    return storeRepository.findActive();
  }

  async getStoreById(id: number): Promise<Store> {
    const store = await storeRepository.findById(id);
    if (!store) {
      throw new Error(`Store with ID ${id} not found.`);
    }
    return store;
  }

  async createStore(data: Prisma.StoreCreateInput): Promise<Store> {
    const existing = await storeRepository.findByPhone(data.phone);
    if (existing) {
      throw new Error(`Store with phone number '${data.phone}' already exists.`);
    }
    return storeRepository.create(data);
  }

  async updateStore(id: number, data: Prisma.StoreUpdateInput): Promise<Store> {
    await this.getStoreById(id);
    if (data.phone && typeof data.phone === 'string') {
      const existing = await storeRepository.findByPhone(data.phone);
      if (existing && existing.id !== id) {
        throw new Error(`Store with phone number '${data.phone}' already exists.`);
      }
    }
    return storeRepository.update(id, data);
  }

  async deleteStore(id: number): Promise<Store> {
    await this.getStoreById(id);
    return storeRepository.delete(id);
  }
}

export const storeService = new StoreService();
