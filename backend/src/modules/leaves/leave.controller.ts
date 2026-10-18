import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { LeaveService } from './leave.service';
import { db } from '../../config/database';
import { employeeProfiles } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const submitLeaveSchema = z.object({
  body: z.object({
    leaveTypeId: z.string().uuid(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    daysCount: z.coerce.number().positive(),
    reason: z.string().min(5),
  }),
});

export const reviewLeaveSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected']),
    approverComment: z.string().optional(),
  }),
});

export class LeaveController {
  private static async getEmployeeId(userId: string): Promise<string> {
    const [profile] = await db
      .select({ id: employeeProfiles.id })
      .from(employeeProfiles)
      .where(eq(employeeProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      throw new Error('Employee profile not linked to user account');
    }
    return profile.id;
  }

  static async getTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const types = await LeaveService.getLeaveTypes(user.organizationId);

      res.status(200).json({
        success: true,
        data: types,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBalances(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await LeaveController.getEmployeeId(user.userId);
      const year = (req.query.year as string) || '2026';

      const balances = await LeaveService.getBalances(employeeId, year);

      res.status(200).json({
        success: true,
        data: balances,
      });
    } catch (error) {
      next(error);
    }
  }

  static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await LeaveController.getEmployeeId(user.userId);
      const { leaveTypeId, startDate, endDate, daysCount, reason } = req.body;

      const request = await LeaveService.submitRequest({
        employeeId,
        organizationId: user.organizationId,
        leaveTypeId,
        startDate,
        endDate,
        daysCount: String(daysCount),
        reason,
      });

      res.status(201).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const isManagerOrAdmin = user.roles.some((r) => ['super_admin', 'hr_admin', 'manager'].includes(r));
      
      let employeeId: string | undefined = undefined;
      if (!isManagerOrAdmin || req.query.mine === 'true') {
        employeeId = await LeaveController.getEmployeeId(user.userId);
      }

      const status = req.query.status as string | undefined;
      const limit = Number(req.query.limit) || 50;
      const offset = Number(req.query.offset) || 0;

      const requests = await LeaveService.listRequests({
        organizationId: user.organizationId,
        employeeId,
        status,
        limit,
        offset,
      });

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  static async review(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const { id } = req.params;
      const { status, approverComment } = req.body;

      const updated = await LeaveService.reviewRequest({
        requestId: id,
        approverId: user.userId,
        status,
        approverComment,
      });

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
