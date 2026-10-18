import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);

router.get('/my', AttendanceController.getMyAttendance);
router.get('/daily-sheet', authorize(['super_admin', 'hr_admin', 'manager']), AttendanceController.getDailySheet);

export default router;
