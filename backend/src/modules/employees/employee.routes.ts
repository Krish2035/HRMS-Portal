import { Router } from 'express';
import { EmployeeController, createEmployeeSchema } from './employee.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { protectIdorAndRola } from '../../middleware/object-auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['super_admin', 'hr_admin']), validate(createEmployeeSchema), EmployeeController.create);
router.get('/', EmployeeController.list);
router.get(
  '/:id',
  protectIdorAndRola({ resource: 'employee_profiles', idParam: 'id', allowSelf: true, allowRoles: ['super_admin', 'hr_admin', 'manager'] }),
  EmployeeController.getById
);
router.get(
  '/:id/team',
  protectIdorAndRola({ resource: 'employee_profiles', idParam: 'id', allowSelf: true, allowRoles: ['super_admin', 'hr_admin', 'manager'] }),
  EmployeeController.getTeam
);

export default router;

