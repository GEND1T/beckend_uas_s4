import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { brandService } from '../../services/brand.service';

export class BrandController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const brands = await brandService.getAllBrands();
      res.status(200).json({ success: true, data: brands });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const brand = await brandService.getBrandById(id);
      res.status(200).json({ success: true, data: brand });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Brand name is required.' });
      }
      const newBrand = await brandService.createBrand({ name });
      res.status(201).json({ success: true, message: 'Brand created successfully.', data: newBrand });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Brand name is required.' });
      }
      const updated = await brandService.updateBrand(id, { name });
      res.status(200).json({ success: true, message: 'Brand updated successfully.', data: updated });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await brandService.deleteBrand(id);
      res.status(200).json({ success: true, message: 'Brand deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

export const brandController = new BrandController();
