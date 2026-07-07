import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { reportService } from '../../services/report.service';

export class ReportController {
  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(400).json({ success: false, message: 'Store ID not found in user context.' });
      }

      const summary = await reportService.getStoreReportSummary(storeId);
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
