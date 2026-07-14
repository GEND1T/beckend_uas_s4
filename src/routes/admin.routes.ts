import { Router } from 'express';
import { authMiddleware, requireRole } from '../middlewares/auth';
import { inventoryController } from '../controllers/admin/inventory.controller';
import { storeProfileController } from '../controllers/admin/store-profile.controller';
import { reportController } from '../controllers/admin/report.controller';

const router = Router();

// Apply auth middleware to all admin routes
router.use(authMiddleware);
router.use(requireRole(['admin']));

// Inventory Management
router.get('/inventory/global-products', inventoryController.getGlobalProducts);
router.get('/inventory/my-store', inventoryController.getMyStoreInventory);
router.post('/inventory/add', inventoryController.addProduct);
router.put('/inventory/:id', inventoryController.updateProduct);
router.delete('/inventory/:id', inventoryController.deleteProduct);

// Store Profile Management
router.get('/store-profile', storeProfileController.getProfile);
router.put('/store-profile', storeProfileController.updateProfile);

// Reports
router.get('/reports/summary', reportController.getSummary);

export default router;
