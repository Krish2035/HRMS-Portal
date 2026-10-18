import { Router } from 'express';
import { LeaveController, submitLeaveSchema, reviewLeaveSchema } from './leave.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';

const router = Router();

router.use(authenticate);

router.get('/types', LeaveController.getTypes);
router.get('/balances', LeaveController.getBalances);
router.post('/requests', validate(submitLeaveSchema), LeaveController.submit);
router.get('/requests', LeaveController.list);
router.patch(
  '/requests/:id/review',
  authorize(['super_admin', 'hr_admin', 'manager']),
  validate(reviewLeaveSchema),
  LeaveController.review
);

export default router;
