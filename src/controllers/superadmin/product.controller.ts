import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { productService } from '../../services/product.service';

export class ProductController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const products = await productService.getAllProducts();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const product = await productService.getProductById(id);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const {
        brandId,
        modelName,
        screenSize,
        processor,
        ram,
        storage,
        battery,
        weight,
        releaseYear,
        subCriteriaIds
      } = req.body;

      if (!brandId || !modelName || !processor || !ram || !storage || weight === undefined || !releaseYear) {
        return res.status(400).json({
          success: false,
          message: 'Required product specification fields (brandId, modelName, processor, ram, storage, weight, releaseYear) are missing.'
        });
      }

      const productInput = {
        brandId: parseInt(brandId),
        modelName,
        screenSize: screenSize !== undefined && screenSize !== null ? parseFloat(screenSize) : null,
        processor,
        ram,
        storage,
        battery: battery !== undefined && battery !== null ? String(battery) : null,
        weight: String(weight),
        releaseYear: String(releaseYear),
        subCriteriaIds: Array.isArray(subCriteriaIds) ? subCriteriaIds.map((id: any) => parseInt(id)) : []
      };

      const newProduct = await productService.createProduct(productInput);
      res.status(201).json({ success: true, message: 'Product created successfully.', data: newProduct });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const {
        brandId,
        modelName,
        screenSize,
        processor,
        ram,
        storage,
        battery,
        weight,
        releaseYear,
        subCriteriaIds
      } = req.body;

      const productInput = {
        brandId: brandId ? parseInt(brandId) : undefined,
        modelName,
        screenSize: screenSize !== undefined ? (screenSize !== null ? parseFloat(screenSize) : null) : undefined,
        processor,
        ram,
        storage,
        battery: battery !== undefined ? (battery !== null ? String(battery) : null) : undefined,
        weight: weight !== undefined ? String(weight) : undefined,
        releaseYear: releaseYear !== undefined ? String(releaseYear) : undefined,
        subCriteriaIds: Array.isArray(subCriteriaIds) ? subCriteriaIds.map((id: any) => parseInt(id)) : undefined
      };

      const updated = await productService.updateProduct(id, productInput);
      res.status(200).json({ success: true, message: 'Product updated successfully.', data: updated });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await productService.deleteProduct(id);
      res.status(200).json({ success: true, message: 'Product deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
