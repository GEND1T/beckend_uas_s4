import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { inventoryService } from '../../services/inventory.service';

export class InventoryController {
  async getGlobalProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const products = await inventoryService.getGlobalProducts();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async getMyStoreInventory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(400).json({ success: false, message: 'Store ID not found in user context.' });
      }
      const inventory = await inventoryService.getStoreInventory(storeId);
      res.status(200).json({ success: true, data: inventory });
    } catch (error) {
      next(error);
    }
  }

  async addProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(400).json({ success: false, message: 'Store ID not found in user context.' });
      }

      const { productId, price, stock, isAvailable } = req.body;
      if (!productId || price === undefined || stock === undefined || isAvailable === undefined) {
        return res.status(400).json({
          success: false,
          message: 'productId, price, stock, and isAvailable are required.'
        });
      }

      const newItem = await inventoryService.addProductToStore({
        storeId,
        productId: parseInt(productId),
        price: parseInt(price),
        stock: parseInt(stock),
        isAvailable: parseInt(isAvailable)
      });

      res.status(201).json({ success: true, message: 'Product added to store inventory.', data: newItem });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(400).json({ success: false, message: 'Store ID not found in user context.' });
      }

      const id = parseInt(req.params.id); // productStoreId
      const { price, stock, isAvailable } = req.body;

      const updated = await inventoryService.updateInventoryItem(id, storeId, {
        price: price !== undefined ? parseInt(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        isAvailable: isAvailable !== undefined ? parseInt(isAvailable) : undefined
      });

      res.status(200).json({ success: true, message: 'Inventory item updated successfully.', data: updated });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(400).json({ success: false, message: 'Store ID not found in user context.' });
      }

      const id = parseInt(req.params.id); // productStoreId
      await inventoryService.deleteInventoryItem(id, storeId);
      res.status(200).json({ success: true, message: 'Inventory item removed successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryController = new InventoryController();
