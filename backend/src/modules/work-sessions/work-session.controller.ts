import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { WorkSessionService } from './work-session.service';
import { db } from '../../config/database';
import { employeeProfiles } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const startSessionSchema = z.object({
  body: z.object({
    notes: z.string().optional(),
  }),
});

export const pauseSessionSchema = z.object({
  body: z.object({
    breakType: z.enum(['coffee', 'lunch', 'meeting', 'general']).default('general'),
    reason: z.string().optional(),
  }),
});

export const endSessionSchema = z.object({
  body: z.object({
    notes: z.string().optional(),
  }),
});

export const correctionRequestSchema = z.object({
  body: z.object({
    proposedStartTime: z.string().datetime(),
    proposedEndTime: z.string().datetime(),
    reason: z.string().min(5),
  }),
});

export class WorkSessionController {
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

  static async start(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await WorkSessionController.getEmployeeId(user.userId);

      const result = await WorkSessionService.startSession({
        organizationId: user.organizationId,
        employeeId,
        actorUserId: user.userId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        notes: req.body.notes,
      });

      res.status(result.alreadyActive ? 200 : 201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async pause(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await WorkSessionController.getEmployeeId(user.userId);
      const { sessionId } = req.params;

      const result = await WorkSessionService.pauseSession({
        sessionId,
        employeeId,
        actorUserId: user.userId,
        breakType: req.body.breakType,
        reason: req.body.reason,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async resume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await WorkSessionController.getEmployeeId(user.userId);
      const { sessionId } = req.params;

      const result = await WorkSessionService.resumeSession({
        sessionId,
        employeeId,
        actorUserId: user.userId,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async end(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await WorkSessionController.getEmployeeId(user.userId);
      const { sessionId } = req.params;

      const result = await WorkSessionService.endSession({
        sessionId,
        employeeId,
        actorUserId: user.userId,
        notes: req.body.notes,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async current(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await WorkSessionController.getEmployeeId(user.userId);

      const result = await WorkSessionService.getCurrentSession(employeeId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async summary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await WorkSessionController.getEmployeeId(user.userId);

      const result = await WorkSessionService.getSummary(employeeId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async history(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await WorkSessionController.getEmployeeId(user.userId);
      const limit = Number(req.query.limit) || 20;
      const offset = Number(req.query.offset) || 0;

      const result = await WorkSessionService.getHistory(employeeId, limit, offset);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async submitCorrection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await WorkSessionController.getEmployeeId(user.userId);
      const { sessionId } = req.params;

      const result = await WorkSessionService.submitCorrectionRequest({
        workSessionId: sessionId,
        employeeId,
        proposedStartTime: new Date(req.body.proposedStartTime),
        proposedEndTime: new Date(req.body.proposedEndTime),
        reason: req.body.reason,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
