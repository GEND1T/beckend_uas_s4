import { Router } from 'express';
import { sharedAuthController } from '../controllers/shared/auth.controller';

const router = Router();

// Staff Login (Superadmin / Store Admin)
router.post('/auth/login', sharedAuthController.login);

export default router;
