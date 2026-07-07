import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { storeService } from '../../services/store.service';

export class StoreController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stores = await storeService.getAllStores();
      res.status(200).json({ success: true, data: stores });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const store = await storeService.getStoreById(id);
      res.status(200).json({ success: true, data: store });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, address, city, phone, isActive, latitude, longitude } = req.body;
      if (!name || !address || !city || !phone || isActive === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Store name, address, city, phone, and isActive (0 or 1) are required.'
        });
      }
      const newStore = await storeService.createStore({
        name,
        address,
        city,
        phone,
        isActive: parseInt(isActive),
        latitude: latitude !== undefined ? parseFloat(latitude) : null,
        longitude: longitude !== undefined ? parseFloat(longitude) : null
      });
      res.status(201).json({ success: true, message: 'Store created successfully.', data: newStore });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { name, address, city, phone, isActive, latitude, longitude } = req.body;
      const updated = await storeService.updateStore(id, {
        name,
        address,
        city,
        phone,
        isActive: isActive !== undefined ? parseInt(isActive) : undefined,
        latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
        longitude: longitude !== undefined ? parseFloat(longitude) : undefined
      });
      res.status(200).json({ success: true, message: 'Store updated successfully.', data: updated });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await storeService.deleteStore(id);
      res.status(200).json({ success: true, message: 'Store deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

export const storeController = new StoreController();
