import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import workSessionRoutes from '../modules/work-sessions/work-session.routes';
import employeeRoutes from '../modules/employees/employee.routes';
import leaveRoutes from '../modules/leaves/leave.routes';
import attendanceRoutes from '../modules/attendance/attendance.routes';
import organizationRoutes from '../modules/organization/organization.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/work-sessions', workSessionRoutes);
router.use('/employees', employeeRoutes);
router.use('/leaves', leaveRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/organization', organizationRoutes);

export default router;
