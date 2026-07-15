import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { recommendationRequestRepository } from '../../repositories/recommendationRequest.repository';
import { spkRequestService } from '../../services/spkRequest.service';

export class RecommendationController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let list;
      if (req.user?.role === 'admin' && req.user.storeId) {
        list = await recommendationRequestRepository.findAllByStoreId(req.user.storeId);
      } else {
        list = await recommendationRequestRepository.findAll();
      }
      res.status(200).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const detail = await recommendationRequestRepository.findById(id);
      if (!detail) {
        return res.status(404).json({ success: false, message: 'Recommendation request not found.' });
      }

      // If store admin, check if this recommendation request has any product from their store
      if (req.user?.role === 'admin' && req.user.storeId) {
        const results = detail.recommendationResults || [];
        const hasStoreProduct = results.some(
          (r: any) => r.productStore?.storeId === req.user?.storeId
        );
        if (!hasStoreProduct) {
          return res.status(403).json({ success: false, message: 'Forbidden: Access to this recommendation request is restricted to your store.' });
        }
      }

      detail.calculationDetails = await spkRequestService.fetchCalculationDetails(id);

      res.status(200).json({ success: true, data: detail });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await recommendationRequestRepository.delete(id);
      res.status(200).json({ success: true, message: 'Recommendation request deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

export const recommendationController = new RecommendationController();
