import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { customerAuthService } from '../../services/customerAuth.service';

export class CustomerProfileController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.id;
      if (!customerId) {
        return res.status(401).json({ success: false, message: 'Authentication context missing.' });
      }

      const profile = await customerAuthService.getProfile(customerId);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.id;
      if (!customerId) {
        return res.status(401).json({ success: false, message: 'Authentication context missing.' });
      }

      const { name, email, password, latitude, longitude } = req.body;
      const updated = await customerAuthService.updateProfile(customerId, {
        name,
        email,
        password,
        latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
        longitude: longitude !== undefined ? parseFloat(longitude) : undefined
      });

      res.status(200).json({ success: true, message: 'Profile updated successfully.', data: updated });
    } catch (error) {
      next(error);
    }
  }
}

export const customerProfileController = new CustomerProfileController();
