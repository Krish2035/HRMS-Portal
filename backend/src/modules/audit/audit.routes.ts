import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);
router.get('/', authorize(['super_admin', 'hr_admin']), AuditController.list);

export default router;
