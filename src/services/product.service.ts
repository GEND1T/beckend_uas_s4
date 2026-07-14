import { prisma } from '../config/db';
import { productRepository } from '../repositories/product.repository';
import { brandRepository } from '../repositories/brand.repository';
import { subCriteriaRepository } from '../repositories/subCriteria.repository';
import { Product } from '@prisma/client';
import { mapSpecsToSubCriteria } from '../utils/specsMapper';
import { deleteImage } from '../utils/cloudinary';

export interface CreateProductInput {
  brandId: number;
  modelName: string;
  imageUrl?: string | null;
  screenSize: number | null;
  processor: string;
  ram: string;
  storage: string;
  battery: string | null;
  weight: string;
  releaseYear: string;
  subCriteriaIds: number[];
}

export class ProductService {
  async getAllProducts(): Promise<Product[]> {
    return productRepository.findAll();
  }

  async getProductById(id: number): Promise<Product> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found.`);
    }
    return product;
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    // 1. Verify brand exists
    const brand = await brandRepository.findById(input.brandId);
    if (!brand) {
      throw new Error(`Brand with ID ${input.brandId} not found.`);
    }

    // 2. Verify sub-criteria exist
    for (const scId of input.subCriteriaIds) {
      const sc = await subCriteriaRepository.findById(scId);
      if (!sc) {
        throw new Error(`SubCriteria with ID ${scId} not found.`);
      }
    }

    // 3. Perform creation in a transaction
    return prisma.$transaction(async (tx) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          brandId: input.brandId,
          modelName: input.modelName,
          imageUrl: input.imageUrl,
          screenSize: input.screenSize,
          processor: input.processor,
          ram: input.ram,
          storage: input.storage,
          battery: input.battery,
          weight: input.weight,
          releaseYear: input.releaseYear
        }
      });

      // Map criteria mappings
      if (input.subCriteriaIds.length > 0) {
        await tx.productCriteria.createMany({
          data: input.subCriteriaIds.map(scId => ({
            productId: newProduct.id,
            subCriteriaId: scId
          }))
        });
      }

      // Fetch newly created product with its mappings
      return tx.product.findUnique({
        where: { id: newProduct.id },
        include: {
          brand: true,
          productCriteria: {
            include: {
              subCriteria: {
                include: { criteria: true }
              }
            }
          }
        }
      }) as unknown as Product;
    });
  }

  async createProductWithCriteria(input: Omit<CreateProductInput, 'subCriteriaIds'>): Promise<Product> {
    // 1. Verify brand exists
    const brand = await brandRepository.findById(input.brandId);
    if (!brand) {
      throw new Error(`Brand with ID ${input.brandId} not found.`);
    }

    // 2. Perform creation in a transaction to ensure atomicity
    try {
      return await prisma.$transaction(async (tx) => {
        // STEP A: Insert the raw data into the products table and retrieve the newly created id_product
        const newProduct = await tx.product.create({
          data: {
            brandId: input.brandId,
            modelName: input.modelName,
            imageUrl: input.imageUrl,
            screenSize: input.screenSize,
            processor: input.processor,
            ram: input.ram,
            storage: input.storage,
            battery: input.battery,
            weight: input.weight,
            releaseYear: input.releaseYear
          }
        });

        // STEP B: Pass the inputData to mapSpecsToSubCriteria helper to get matched id_sub_criteria
        const matchedSubCriteriaIds = await mapSpecsToSubCriteria(tx, {
          ram: input.ram,
          storage: input.storage,
          processor: input.processor,
          battery: input.battery,
          weight: input.weight,
          screenSize: input.screenSize,
          releaseYear: input.releaseYear
        });

        // STEP C: Execute a Prisma createMany on the product_criteria junction table
        if (matchedSubCriteriaIds.length > 0) {
          await tx.productCriteria.createMany({
            data: matchedSubCriteriaIds.map(scId => ({
              productId: newProduct.id,
              subCriteriaId: scId
            }))
          });
        }

        // Fetch newly created product with its mappings
        return tx.product.findUnique({
          where: { id: newProduct.id },
          include: {
            brand: true,
            productCriteria: {
              include: {
                subCriteria: {
                  include: { criteria: true }
                }
              }
            }
          }
        }) as unknown as Product;
      });
    } catch (error) {
      console.error(`[ProductService] Failed to create product with criteria:`, error);
      throw error;
    }
  }

  async updateProduct(id: number, input: Partial<CreateProductInput>): Promise<Product> {
    await this.getProductById(id);

    if (input.brandId) {
      const brand = await brandRepository.findById(input.brandId);
      if (!brand) {
        throw new Error(`Brand with ID ${input.brandId} not found.`);
      }
    }

    return prisma.$transaction(async (tx) => {
      // Prepare update fields
      const updateData: any = {};
      if (input.brandId !== undefined) updateData.brandId = input.brandId;
      if (input.modelName !== undefined) updateData.modelName = input.modelName;
      if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
      if (input.screenSize !== undefined) updateData.screenSize = input.screenSize;
      if (input.processor !== undefined) updateData.processor = input.processor;
      if (input.ram !== undefined) updateData.ram = input.ram;
      if (input.storage !== undefined) updateData.storage = input.storage;
      if (input.battery !== undefined) updateData.battery = input.battery;
      if (input.weight !== undefined) updateData.weight = input.weight;
      if (input.releaseYear !== undefined) updateData.releaseYear = input.releaseYear;

      // Update product basics
      await tx.product.update({
        where: { id },
        data: updateData
      });

      // Update criteria mappings if provided
      if (input.subCriteriaIds !== undefined) {
        // Delete old mappings
        await tx.productCriteria.deleteMany({
          where: { productId: id }
        });

        // Insert new mappings
        if (input.subCriteriaIds.length > 0) {
          await tx.productCriteria.createMany({
            data: input.subCriteriaIds.map(scId => ({
              productId: id,
              subCriteriaId: scId
            }))
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          brand: true,
          productCriteria: {
            include: {
              subCriteria: {
                include: { criteria: true }
              }
            }
          }
        }
      }) as unknown as Product;
    });
  }

  async deleteProduct(id: number): Promise<Product> {
    const product = await this.getProductById(id);

    // If it has an imageUrl, delete it from Cloudinary
    if (product.imageUrl) {
      await deleteImage(product.imageUrl);
    }

    return prisma.$transaction(async (tx) => {
      // Delete child relations first
      await tx.productCriteria.deleteMany({
        where: { productId: id }
      });
      await tx.productStore.deleteMany({
        where: { productId: id }
      });

      // Delete parent product
      return tx.product.delete({
        where: { id }
      });
    });
  }
}

export const productService = new ProductService();
