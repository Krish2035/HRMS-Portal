import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const reqId = req.headers['x-request-id'];

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
        requestId: reqId,
      },
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'An unexpected error occurred';

  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        code: err.code,
        statusCode,
      },
      requestId: reqId,
      url: req.originalUrl,
      method: req.method,
    },
    'Request error caught'
  );

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR'),
      message,
      ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
      requestId: reqId,
    },
  });
}
