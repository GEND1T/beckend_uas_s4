import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { recommendationRequestRepository } from '../../repositories/recommendationRequest.repository';

export class RecommendationController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await recommendationRequestRepository.findAll();
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
