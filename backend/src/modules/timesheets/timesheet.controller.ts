import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TimesheetService } from './timesheet.service';
import { db } from '../../config/database';
import { employeeProfiles } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const generateTimesheetSchema = z.object({
  body: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  }),
});

export const reviewTimesheetSchema = z.object({
  body: z.object({
    action: z.enum(['approve', 'reject']),
    rejectionReason: z.string().optional(),
  }),
});

export class TimesheetController {
  private static async getEmployeeId(userId: string): Promise<string> {
    const [profile] = await db
      .select({ id: employeeProfiles.id })
      .from(employeeProfiles)
      .where(eq(employeeProfiles.userId, userId))
      .limit(1);

    if (!profile) throw new Error('Employee profile not linked to user account');
    return profile.id;
  }

  static async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await TimesheetController.getEmployeeId(user.userId);

      const timesheet = await TimesheetService.generateWeeklyTimesheet({
        employeeId,
        organizationId: user.organizationId,
        startDate: req.body.startDate,
      });

      res.status(200).json({
        success: true,
        message: 'Weekly timesheet generated successfully from active session records',
        data: timesheet,
      });
    } catch (error) {
      next(error);
    }
  }

  static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await TimesheetController.getEmployeeId(user.userId);
      const { id } = req.params;

      const updated = await TimesheetService.submitTimesheet(id, employeeId);

      res.status(200).json({
        success: true,
        message: 'Timesheet submitted to manager for approval',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async review(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const reviewerEmployeeId = await TimesheetController.getEmployeeId(user.userId);
      const { id } = req.params;
      const { action, rejectionReason } = req.body;

      const reviewed = await TimesheetService.reviewTimesheet({
        timesheetId: id,
        reviewerEmployeeId,
        organizationId: user.organizationId,
        action,
        rejectionReason,
      });

      res.status(200).json({
        success: true,
        message: `Timesheet successfully ${action}d`,
        data: reviewed,
      });
    } catch (error) {
      next(error);
    }
  }

  static async listPending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const pending = await TimesheetService.listPendingTimesheets(user.organizationId);

      res.status(200).json({
        success: true,
        data: pending,
      });
    } catch (error) {
      next(error);
    }
  }

  static async myTimesheets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await TimesheetController.getEmployeeId(user.userId);
      const list = await TimesheetService.listEmployeeTimesheets(employeeId);

      res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }
}
