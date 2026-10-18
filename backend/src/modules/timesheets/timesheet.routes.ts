import { Router } from 'express';
import {
  TimesheetController,
  generateTimesheetSchema,
  reviewTimesheetSchema,
} from './timesheet.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';

const router = Router();

router.use(authenticate);

// Employee Timesheet Endpoints
router.post('/generate', validate(generateTimesheetSchema), TimesheetController.generate);
router.post('/:id/submit', TimesheetController.submit);
router.get('/my', TimesheetController.myTimesheets);

// Manager / HR Admin Approval Endpoints
router.get(
  '/pending',
  authorize(['manager', 'hr_admin', 'super_admin']),
  TimesheetController.listPending
);
router.post(
  '/:id/review',
  authorize(['manager', 'hr_admin', 'super_admin']),
  validate(reviewTimesheetSchema),
  TimesheetController.review
);

export default router;
