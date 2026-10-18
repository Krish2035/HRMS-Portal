import { Router } from 'express';
import { OrganizationController, registerOrgSchema } from './organization.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';

const router = Router();

// Public route: Self-service company onboarding
router.post('/register', validate(registerOrgSchema), OrganizationController.register);

// Protected routes
router.use(authenticate);

router.get('/', OrganizationController.get);
router.patch('/', authorize(['super_admin', 'hr_admin']), OrganizationController.update);

export default router;

