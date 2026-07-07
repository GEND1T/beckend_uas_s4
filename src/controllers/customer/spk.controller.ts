import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { spkRequestService } from '../../services/spkRequest.service';

export class SpkController {
  async createRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.id;
      if (!customerId) {
        return res.status(401).json({ success: false, message: 'Authentication context missing.' });
      }

      const { kebutuhan, budgetMin, budgetMax, weights } = req.body;
      if (!kebutuhan || budgetMin === undefined || budgetMax === undefined || !Array.isArray(weights) || weights.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'kebutuhan, budgetMin, budgetMax, and a non-empty weights array are required.'
        });
      }

      const parsedWeights = weights.map((w: any) => ({
        subCriteriaId: parseInt(w.subCriteriaId),
        weight: parseFloat(w.weight)
      }));

      const newRequest = await spkRequestService.createRequest({
        customerId,
        kebutuhan,
        budgetMin: parseInt(budgetMin),
        budgetMax: parseInt(budgetMax),
        weights: parsedWeights
      });

      res.status(201).json({
        success: true,
        message: 'Recommendation calculated successfully.',
        data: newRequest
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.id;
      if (!customerId) {
        return res.status(401).json({ success: false, message: 'Authentication context missing.' });
      }

      const history = await spkRequestService.getCustomerRequests(customerId);
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async getRequestDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.id;
      if (!customerId) {
        return res.status(401).json({ success: false, message: 'Authentication context missing.' });
      }

      const id = parseInt(req.params.id);
      const details = await spkRequestService.getRequestDetails(id, customerId);
      res.status(200).json({ success: true, data: details });
    } catch (error) {
      next(error);
    }
  }
}

export const spkController = new SpkController();
