import { Router } from 'express';
import { EmployeeController, createEmployeeSchema } from './employee.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['super_admin', 'hr_admin']), validate(createEmployeeSchema), EmployeeController.create);
router.get('/', EmployeeController.list);
router.get('/:id', EmployeeController.getById);
router.get('/:id/team', EmployeeController.getTeam);

export default router;

