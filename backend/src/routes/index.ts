import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import workSessionRoutes from '../modules/work-sessions/work-session.routes';
import employeeRoutes from '../modules/employees/employee.routes';
import leaveRoutes from '../modules/leaves/leave.routes';
import attendanceRoutes from '../modules/attendance/attendance.routes';
import organizationRoutes from '../modules/organization/organization.routes';
import payrollRoutes from '../modules/payroll/payroll.routes';
import performanceRoutes from '../modules/performance/performance.routes';
import auditRoutes from '../modules/audit/audit.routes';
import timesheetRoutes from '../modules/timesheets/timesheet.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/work-sessions', workSessionRoutes);
router.use('/employees', employeeRoutes);
router.use('/leaves', leaveRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/organization', organizationRoutes);
router.use('/payroll', payrollRoutes);
router.use('/performance', performanceRoutes);
router.use('/audit', auditRoutes);
router.use('/timesheets', timesheetRoutes);

export default router;

