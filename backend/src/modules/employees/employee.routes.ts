import { Router } from 'express';
import { EmployeeController } from './employee.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', EmployeeController.list);
router.get('/:id', EmployeeController.getById);
router.get('/:id/team', EmployeeController.getTeam);

export default router;
