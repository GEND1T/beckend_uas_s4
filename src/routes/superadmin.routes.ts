import { Router } from 'express';
import { authMiddleware, requireRole } from '../middlewares/auth';
import { brandController } from '../controllers/superadmin/brand.controller';
import { storeController } from '../controllers/superadmin/store.controller';
import { userController } from '../controllers/superadmin/user.controller';
import { criteriaController } from '../controllers/superadmin/criteria.controller';
import { productController } from '../controllers/superadmin/product.controller';

const router = Router();

// Apply auth middleware to all superadmin routes
router.use(authMiddleware);
router.use(requireRole(['superadmin']));

// Brands CRUD
router.get('/brands', brandController.getAll);
router.get('/brands/:id', brandController.getById);
router.post('/brands', brandController.create);
router.put('/brands/:id', brandController.update);
router.delete('/brands/:id', brandController.delete);

// Stores CRUD
router.get('/stores', storeController.getAll);
router.get('/stores/:id', storeController.getById);
router.post('/stores', storeController.create);
router.put('/stores/:id', storeController.update);
router.delete('/stores/:id', storeController.delete);

// Users CRUD (Store Admins management)
router.get('/users', userController.getAll);
router.get('/users/:id', userController.getById);
router.post('/users', userController.create);
router.put('/users/:id', userController.update);
router.delete('/users/:id', userController.delete);

// Criteria CRUD
router.get('/criteria', criteriaController.getAll);
router.get('/criteria/:id', criteriaController.getById);
router.post('/criteria', criteriaController.create);
router.put('/criteria/:id', criteriaController.update);
router.delete('/criteria/:id', criteriaController.delete);

// SubCriteria CRUD
router.get('/sub-criteria/criteria/:criteriaId', criteriaController.getSubCriteriaByCriteria);
router.get('/sub-criteria/:id', criteriaController.getSubCriteriaById);
router.post('/sub-criteria', criteriaController.createSubCriteria);
router.put('/sub-criteria/:id', criteriaController.updateSubCriteria);
router.delete('/sub-criteria/:id', criteriaController.deleteSubCriteria);

// Products CRUD
router.get('/products', productController.getAll);
router.get('/products/:id', productController.getById);
router.post('/products', productController.create);
router.put('/products/:id', productController.update);
router.delete('/products/:id', productController.delete);

export default router;
