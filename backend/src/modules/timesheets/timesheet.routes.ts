import { Router } from 'express';
import {
  TimesheetController,
  generateTimesheetSchema,
  reviewTimesheetSchema,
} from './timesheet.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { protectIdorAndRola } from '../../middleware/object-auth';

const router = Router();

router.use(authenticate);

// Employee Timesheet Endpoints
router.post('/generate', validate(generateTimesheetSchema), TimesheetController.generate);
router.post(
  '/:id/submit',
  protectIdorAndRola({ resource: 'timesheets', idParam: 'id', allowSelf: true }),
  TimesheetController.submit
);
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
  protectIdorAndRola({
    resource: 'timesheets',
    idParam: 'id',
    allowRoles: ['super_admin', 'hr_admin'],
    checkManagerRelationship: true,
  }),
  validate(reviewTimesheetSchema),
  TimesheetController.review
);

export default router;
