import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PayrollService } from './payroll.service';
import { PdfService } from './pdf.service';
import { BankExportService } from './bank-export.service';
import { db } from '../../config/database';
import { employeeProfiles } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const createPeriodSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

export class PayrollController {
  private static async getEmployeeId(userId: string): Promise<string> {
    const [profile] = await db
      .select({ id: employeeProfiles.id })
      .from(employeeProfiles)
      .where(eq(employeeProfiles.userId, userId))
      .limit(1);

    if (!profile) throw new Error('Employee profile not linked to user account');
    return profile.id;
  }

  static async listPeriods(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const periods = await PayrollService.listPeriods(user.organizationId);

      res.status(200).json({
        success: true,
        data: periods,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createPeriod(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const period = await PayrollService.createPeriod({
        organizationId: user.organizationId,
        name: req.body.name,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      });

      res.status(201).json({
        success: true,
        data: period,
      });
    } catch (error) {
      next(error);
    }
  }

  static async runPayroll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const { periodId } = req.params;

      const records = await PayrollService.generatePayrollRun(periodId, user.organizationId);

      res.status(200).json({
        success: true,
        data: {
          periodId,
          generatedRecordsCount: records.length,
          records,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async myPayslips(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await PayrollController.getEmployeeId(user.userId);

      const payslips = await PayrollService.getEmployeePayslips(employeeId);

      res.status(200).json({
        success: true,
        data: payslips,
      });
    } catch (error) {
      next(error);
    }
  }

  static async finalizePeriod(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { periodId } = req.params;
      const updated = await PayrollService.finalizePeriod(periodId);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async downloadPayslipPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const { payslipId } = req.params;

      const payslip = await PayrollService.getPayslipForPdf(payslipId);
      if (!payslip) {
        res.status(404).json({ success: false, message: 'Payslip record not found' });
        return;
      }

      // Authorization verification
      const isPrivileged = user.roles && (user.roles.includes('super_admin') || user.roles.includes('hr_admin'));
      if (!isPrivileged) {
        const empId = await PayrollController.getEmployeeId(user.userId);
        if (empId !== payslip.employeeId) {
          res.status(403).json({ success: false, message: 'Access denied to this payslip' });
          return;
        }
      } else {
        if (user.organizationId !== payslip.organizationId) {
          res.status(403).json({ success: false, message: 'Cross-organization access prohibited' });
          return;
        }
      }

      const pdfBuffer = await PdfService.generatePayslipPdf(payslip);
      const filename = `Payslip-${payslip.employeeCode}-${payslip.periodName.replace(/[\s\W]+/g, '_')}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.status(200).end(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  static async exportAchCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const { periodId } = req.params;

      const csvData = await BankExportService.generateAchCsv(periodId, user.organizationId);
      const filename = `ACH_Direct_Deposit_${periodId.slice(0, 8)}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }

  static async exportNachaBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const { periodId } = req.params;

      const nachaData = await BankExportService.generateNachaFile(periodId, user.organizationId);
      const filename = `NACHA_PAYROLL_${periodId.slice(0, 8)}.ach`;

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(nachaData);
    } catch (error) {
      next(error);
    }
  }
}

