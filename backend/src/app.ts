import express, { Express, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestId } from './middleware/request-id';
import { securityHeaders, corsMiddleware } from './middleware/security-headers';
import { errorHandler } from './middleware/error-handler';
import { checkDatabaseConnection } from './config/database';
import { checkRedisConnection } from './config/redis';
import routes from './routes/index';

export function createApp(): Express {
  const app = express();

  // Security & standard middlewares
  app.use(requestId);
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Kubernetes / Docker Health Checks
  app.get('/health/liveness', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });

  app.get('/health/readiness', async (req: Request, res: Response) => {
    const dbHealthy = await checkDatabaseConnection();
    const redisHealthy = await checkRedisConnection();

    const isReady = dbHealthy; // DB is critical, redis can be soft in some local configs
    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ready' : 'unhealthy',
      dependencies: {
        database: dbHealthy ? 'connected' : 'disconnected',
        redis: redisHealthy ? 'connected' : 'disconnected',
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Base API health check
  app.get('/api/v1/health', async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        service: 'hrms-backend',
        version: '1.0.0',
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Mount API modular routes
  app.use(`/api/${env.API_VERSION}`, routes);

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
        requestId: req.headers['x-request-id'],
      },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
