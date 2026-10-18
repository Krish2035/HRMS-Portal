import { Request, Response, NextFunction } from 'express';

export function authorize(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User is not authenticated',
          requestId: req.headers['x-request-id'],
        },
      });
      return;
    }

    const hasPermission = req.user.roles.some((role) =>
      allowedRoles.includes(role) || role === 'super_admin'
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action',
          requestId: req.headers['x-request-id'],
        },
      });
      return;
    }

    next();
  };
}
