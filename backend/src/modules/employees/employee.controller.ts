import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { EmployeeService } from './employee.service';

export const createEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8).optional(),
    roleSlug: z.enum(['employee', 'manager', 'hr_admin']).optional(),
    departmentId: z.string().uuid().optional(),
    designationId: z.string().uuid().optional(),
    joiningDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    employmentType: z.enum(['full_time', 'part_time', 'contract', 'intern']).optional(),
    workLocation: z.enum(['office', 'remote', 'hybrid']).optional(),
    compensationType: z.enum(['salaried', 'hourly']),
    baseSalary: z.number().nonnegative().optional(),
    hourlyRate: z.number().nonnegative().optional(),
    overtimeRateMultiplier: z.number().positive().optional(),
    standardWeeklyHours: z.number().positive().optional(),
    managerId: z.string().uuid().optional(),
  }),
});

export class EmployeeController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const result = await EmployeeService.createEmployee({
        organizationId: user.organizationId,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: 'Employee successfully onboarded',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const search = req.query.search as string | undefined;
      const departmentId = req.query.departmentId as string | undefined;
      const limit = Number(req.query.limit) || 50;
      const offset = Number(req.query.offset) || 0;

      const employees = await EmployeeService.listEmployees({
        organizationId: user.organizationId,
        search,
        departmentId,
        limit,
        offset,
      });

      res.status(200).json({
        success: true,
        data: employees,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const employee = await EmployeeService.getEmployeeById(id);

      if (!employee) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Employee profile not found',
            requestId: req.headers['x-request-id'],
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const team = await EmployeeService.getDirectReports(id);

      res.status(200).json({
        success: true,
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }
}

