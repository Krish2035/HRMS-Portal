import { Router } from 'express';
import { PayrollController, createPeriodSchema } from './payroll.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';

const router = Router();

router.use(authenticate);

// Employee route
router.get('/my-payslips', PayrollController.myPayslips);
router.get('/payslips/:payslipId/pdf', PayrollController.downloadPayslipPdf);

// HR/Admin routes
router.get('/periods', authorize(['super_admin', 'hr_admin']), PayrollController.listPeriods);
router.post('/periods', authorize(['super_admin', 'hr_admin']), validate(createPeriodSchema), PayrollController.createPeriod);
router.post('/periods/:periodId/run', authorize(['super_admin', 'hr_admin']), PayrollController.runPayroll);
router.patch('/periods/:periodId/finalize', authorize(['super_admin', 'hr_admin']), PayrollController.finalizePeriod);
router.get('/periods/:periodId/export/bank-csv', authorize(['super_admin', 'hr_admin']), PayrollController.exportAchCsv);
router.get('/periods/:periodId/export/nacha', authorize(['super_admin', 'hr_admin']), PayrollController.exportNachaBatch);

export default router;

