import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { storeService } from '../../services/store.service';

export class StoreProfileController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(400).json({ success: false, message: 'Store ID not found in user context.' });
      }
      const store = await storeService.getStoreById(storeId);
      res.status(200).json({ success: true, data: store });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(400).json({ success: false, message: 'Store ID not found in user context.' });
      }

      const { name, address, city, phone, latitude, longitude } = req.body;
      const updated = await storeService.updateStore(storeId, {
        name,
        address,
        city,
        phone,
        latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
        longitude: longitude !== undefined ? parseFloat(longitude) : undefined
      });

      res.status(200).json({ success: true, message: 'Store profile updated successfully.', data: updated });
    } catch (error) {
      next(error);
    }
  }
}

export const storeProfileController = new StoreProfileController();
