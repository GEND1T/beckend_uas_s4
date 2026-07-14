import { Request, Response, NextFunction } from 'express';
import { catalogService } from '../../services/catalog.service';

export class CatalogController {
  async getCatalog(req: Request, res: Response, next: NextFunction) {
    try {
      const brandId = req.query.brandId ? parseInt(req.query.brandId as string) : undefined;
      const search = req.query.search as string | undefined;
      const userLat = req.query.userLat ? parseFloat(req.query.userLat as string) : undefined;
      const userLng = req.query.userLng ? parseFloat(req.query.userLng as string) : undefined;

      const catalog = await catalogService.getCatalog({ brandId, search }, userLat, userLng);
      res.status(200).json({ success: true, data: catalog });
    } catch (error) {
      next(error);
    }
  }

  async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.id);
      const userLat = req.query.userLat ? parseFloat(req.query.userLat as string) : undefined;
      const userLng = req.query.userLng ? parseFloat(req.query.userLng as string) : undefined;

      const product = await catalogService.getProductDetails(productId, userLat, userLng);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }
}

export const catalogController = new CatalogController();
