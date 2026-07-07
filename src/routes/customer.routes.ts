import { Router } from 'express';
import { authMiddleware, requireRole } from '../middlewares/auth';
import { customerAuthController } from '../controllers/customer/auth.controller';
import { customerProfileController } from '../controllers/customer/profile.controller';
import { catalogController } from '../controllers/customer/catalog.controller';
import { spkController } from '../controllers/customer/spk.controller';

const router = Router();

// --- Public Customer Endpoints ---
router.post('/auth/register', customerAuthController.register);
router.post('/auth/login', customerAuthController.login);

router.get('/catalog', catalogController.getCatalog);
router.get('/catalog/:id', catalogController.getDetails);

// --- Secure Customer Endpoints ---
// Create a separate sub-router for secure routes or apply middlewares dynamically
const secureRouter = Router();
secureRouter.use(authMiddleware);
secureRouter.use(requireRole(['customer']));

secureRouter.get('/profile', customerProfileController.getProfile);
secureRouter.put('/profile', customerProfileController.updateProfile);

secureRouter.post('/spk/requests', spkController.createRequest);
secureRouter.get('/spk/requests', spkController.getMyRequests);
secureRouter.get('/spk/requests/:id', spkController.getRequestDetails);

// Mount secure router
router.use(secureRouter);

export default router;
