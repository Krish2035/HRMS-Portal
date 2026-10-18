import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from './organization.service';

export class OrganizationController {
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
