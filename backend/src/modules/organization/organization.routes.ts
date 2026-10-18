import { Router } from 'express';
import { OrganizationController } from './organization.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);

router.get('/', OrganizationController.get);
router.patch('/', authorize(['super_admin', 'hr_admin']), OrganizationController.update);

export default router;
