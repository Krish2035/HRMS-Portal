import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from './attendance.service';
import { db } from '../../config/database';
import { employeeProfiles } from '../../db/schema';
import { eq } from 'drizzle-orm';

export class AttendanceController {
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

  static async getMyAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const employeeId = await AttendanceController.getEmployeeId(user.userId);
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const records = await AttendanceService.getEmployeeAttendance({
        employeeId,
        startDate,
        endDate,
      });

      res.status(200).json({
        success: true,
        data: records,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDailySheet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

      const sheet = await AttendanceService.getOrganizationDailyAttendance({
        organizationId: user.organizationId,
        date,
      });

      res.status(200).json({
        success: true,
        data: sheet,
      });
    } catch (error) {
      next(error);
    }
  }
}
