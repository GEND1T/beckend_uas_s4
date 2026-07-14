import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { productService } from '../../services/product.service';
import { uploadImage, deleteImage } from '../../utils/cloudinary';

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
        releaseYear
      } = req.body;

      if (!brandId || !modelName || !processor || !ram || !storage || weight === undefined || !releaseYear) {
        return res.status(400).json({
          success: false,
          message: 'Required product specification fields (brandId, modelName, processor, ram, storage, weight, releaseYear) are missing.'
        });
      }

      let imageUrl: string | null = null;
      if (req.file) {
        const uploadResult = await uploadImage(req.file.buffer, 'spk_laptops');
        imageUrl = uploadResult.secure_url;
      }

      try {
        const productInput = {
          brandId: parseInt(brandId),
          modelName,
          imageUrl,
          screenSize: screenSize !== undefined && screenSize !== '' && screenSize !== null ? parseFloat(screenSize) : null,
          processor,
          ram,
          storage,
          battery: battery !== undefined && battery !== '' && battery !== null ? String(battery) : null,
          weight: String(weight),
          releaseYear: String(releaseYear)
        };

        const newProduct = await productService.createProductWithCriteria(productInput);
        res.status(201).json({ success: true, message: 'Product created successfully.', data: newProduct });
      } catch (dbError) {
        // If image was uploaded to Cloudinary, clean it up upon database failure
        if (imageUrl) {
          try {
            await deleteImage(imageUrl);
          } catch (deleteError) {
            console.error('Failed to cleanup Cloudinary image after DB failure:', deleteError);
          }
        }
        throw dbError;
      }
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

      // Fetch existing product
      const existingProduct = await productService.getProductById(id);

      let imageUrl: string | undefined;
      let oldImageUrlToDelete: string | null = null;

      if (req.file) {
        // Upload new image to Cloudinary
        const uploadResult = await uploadImage(req.file.buffer, 'spk_laptops');
        imageUrl = uploadResult.secure_url;
        
        if (existingProduct.imageUrl) {
          oldImageUrlToDelete = existingProduct.imageUrl;
        }
      }

      try {
        let parsedSubCriteriaIds: number[] | undefined;
        if (subCriteriaIds !== undefined) {
          if (Array.isArray(subCriteriaIds)) {
            parsedSubCriteriaIds = subCriteriaIds.map((id: any) => parseInt(id));
          } else if (typeof subCriteriaIds === 'string') {
            try {
              const parsed = JSON.parse(subCriteriaIds);
              parsedSubCriteriaIds = Array.isArray(parsed) ? parsed.map((id: any) => parseInt(id)) : [parseInt(parsed)];
            } catch {
              parsedSubCriteriaIds = subCriteriaIds.split(',').map((id: any) => parseInt(id.trim())).filter(id => !isNaN(id));
            }
          }
        }

        const productInput = {
          brandId: brandId ? parseInt(brandId) : undefined,
          modelName,
          imageUrl,
          screenSize: screenSize !== undefined ? (screenSize !== null && screenSize !== '' ? parseFloat(screenSize) : null) : undefined,
          processor,
          ram,
          storage,
          battery: battery !== undefined ? (battery !== null && battery !== '' ? String(battery) : null) : undefined,
          weight: weight !== undefined ? String(weight) : undefined,
          releaseYear: releaseYear !== undefined ? String(releaseYear) : undefined,
          subCriteriaIds: parsedSubCriteriaIds
        };

        const updated = await productService.updateProduct(id, productInput);

        // Delete old image from Cloudinary since DB update succeeded
        if (oldImageUrlToDelete) {
          try {
            await deleteImage(oldImageUrlToDelete);
          } catch (deleteError) {
            console.error('Failed to delete old image from Cloudinary:', deleteError);
          }
        }

        res.status(200).json({ success: true, message: 'Product updated successfully.', data: updated });
      } catch (dbError) {
        // Clean up newly uploaded image on database update failure
        if (imageUrl) {
          try {
            await deleteImage(imageUrl);
          } catch (deleteError) {
            console.error('Failed to cleanup newly uploaded Cloudinary image after DB update failure:', deleteError);
          }
        }
        throw dbError;
      }
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

