import { productStoreRepository } from '../repositories/productStore.repository';
import { productRepository } from '../repositories/product.repository';
import { storeRepository } from '../repositories/store.repository';
import { ProductStore, Prisma } from '@prisma/client';

export class InventoryService {
  async getGlobalProducts() {
    return productRepository.findAll();
  }

  async getStoreInventory(storeId: number): Promise<ProductStore[]> {
    return productStoreRepository.findByStoreId(storeId);
  }

  async getInventoryItemById(id: number): Promise<ProductStore> {
    const item = await productStoreRepository.findById(id);
    if (!item) {
      throw new Error(`Inventory item with ID ${id} not found.`);
    }
    return item;
  }

  async addProductToStore(data: Prisma.ProductStoreUncheckedCreateInput): Promise<ProductStore> {
    // 1. Verify store exists
    const store = await storeRepository.findById(data.storeId);
    if (!store) {
      throw new Error(`Store with ID ${data.storeId} not found.`);
    }

    // 2. Verify product exists
    const product = await productRepository.findById(data.productId);
    if (!product) {
      throw new Error(`Product with ID ${data.productId} not found.`);
    }

    // 3. Check if already added
    const existing = await productStoreRepository.findByStoreAndProduct(data.storeId, data.productId);
    if (existing) {
      throw new Error(`Product is already added to store inventory. Modify its stock/price instead.`);
    }

    return productStoreRepository.create(data);
  }

  async updateInventoryItem(id: number, storeId: number, data: { price?: number; stock?: number; isAvailable?: number }): Promise<ProductStore> {
    const item = await this.getInventoryItemById(id);
    
    // Ensure store admin owns this product store
    if (item.storeId !== storeId) {
      throw new Error("Unauthorized to modify inventory of another store.");
    }

    return productStoreRepository.update(id, data);
  }

  async deleteInventoryItem(id: number, storeId: number): Promise<ProductStore> {
    const item = await this.getInventoryItemById(id);

    if (item.storeId !== storeId) {
      throw new Error("Unauthorized to delete inventory of another store.");
    }

    return productStoreRepository.delete(id);
  }
}

export const inventoryService = new InventoryService();
