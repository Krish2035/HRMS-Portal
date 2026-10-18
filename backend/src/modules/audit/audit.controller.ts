import { Request, Response, NextFunction } from 'express';
import { AuditService } from './audit.service';

export class AuditController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const limit = Number(req.query.limit) || 50;
      const offset = Number(req.query.offset) || 0;

      const logs = await AuditService.listLogs(user.organizationId, limit, offset);

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }
}
