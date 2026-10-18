import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PerformanceService } from './performance.service';
import { db } from '../../config/database';
import { employeeProfiles } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const createGoalSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

export const updateGoalSchema = z.object({
  body: z.object({
    progress: z.number().min(0).max(100).optional(),
    status: z.enum(['in_progress', 'completed', 'cancelled']).optional(),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    employeeId: z.string().uuid(),
    reviewPeriod: z.string().min(2),
    rating: z.coerce.number().min(1).max(5),
    strengths: z.string().optional(),
    improvements: z.string().optional(),
    feedback: z.string().min(5),
  }),
});

export class PerformanceController {
  private static async getEmployeeId(userId: string): Promise<string> {
    const [profile] = await db
      .select({ id: employeeProfiles.id })
      .from(employeeProfiles)
      .where(eq(employeeProfiles.userId, userId))
      .limit(1);

    if (!profile) throw new Error('Employee profile not linked to user account');
    return profile.id;
  }

  static async myGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await PerformanceController.getEmployeeId(user.userId);
      const goals = await PerformanceService.getEmployeeGoals(employeeId);

      res.status(200).json({
        success: true,
        data: goals,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await PerformanceController.getEmployeeId(user.userId);

      const goal = await PerformanceService.createGoal({
        employeeId,
        organizationId: user.organizationId,
        title: req.body.title,
        description: req.body.description,
        targetDate: req.body.targetDate,
      });

      res.status(201).json({
        success: true,
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await PerformanceController.getEmployeeId(user.userId);
      const { id } = req.params;

      const updated = await PerformanceService.updateGoal({
        goalId: id,
        employeeId,
        progress: req.body.progress,
        status: req.body.status,
      });

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async myReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await PerformanceController.getEmployeeId(user.userId);
      const reviews = await PerformanceService.getReviews(employeeId);

      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const review = await PerformanceService.createReview({
        employeeId: req.body.employeeId,
        organizationId: user.organizationId,
        reviewerId: user.userId,
        reviewPeriod: req.body.reviewPeriod,
        rating: String(req.body.rating),
        strengths: req.body.strengths,
        improvements: req.body.improvements,
        feedback: req.body.feedback,
      });

      res.status(201).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }
}
