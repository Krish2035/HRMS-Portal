import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { OrganizationService } from './organization.service';

export const registerOrgSchema = z.object({
  body: z.object({
    companyName: z.string().min(2, 'Company name must be at least 2 characters'),
    adminName: z.string().min(2, 'Admin name must be at least 2 characters'),
    adminEmail: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    timeZone: z.string().optional(),
    organizationScale: z.enum(['micro', 'growing', 'enterprise']).optional(),
    enabledModules: z.record(z.boolean()).optional(),
  }),
});

export class OrganizationController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await OrganizationService.registerOrganization(req.body);

      res.status(201).json({
        success: true,
        message: 'Organization and Super Admin account successfully registered',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const details = await OrganizationService.getDetails(user.organizationId);

      res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const updated = await OrganizationService.updateSettings(user.organizationId, req.body);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

