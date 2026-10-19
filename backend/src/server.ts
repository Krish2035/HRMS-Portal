import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { pool, checkDatabaseConnection } from './config/database';
import { redis, checkRedisConnection } from './config/redis';

async function bootstrap() {
  logger.info({ environment: env.NODE_ENV, port: env.PORT }, 'Initializing HRMS Backend API...');

  // Check connections
  const dbConnected = await checkDatabaseConnection();
  if (dbConnected) {
    logger.info('Database connection established successfully');
  } else {
    logger.warn('Database is currently unreachable. Continuing initialization...');
  }

  const redisConnected = await checkRedisConnection();
  if (redisConnected) {
    logger.info('Redis connection established successfully');
  } else {
    logger.warn('Redis is currently unreachable. Continuing initialization...');
  }

  const app = createApp();
  const server = app.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`🚀 HRMS Backend Server running on http://0.0.0.0:${env.PORT}`);
    logger.info(`Health check available at http://localhost:${env.PORT}/health/readiness`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await pool.end();
        logger.info('PostgreSQL pool closed.');
        redis.disconnect();
        logger.info('Redis connection closed.');
      } catch (err) {
        logger.error({ err }, 'Error during shutdown cleanup');
      }
      process.exit(0);
    });

    // Force close after 10 seconds if hanging
    setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcefully terminating.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  logger.fatal({ error }, 'Fatal error during application startup');
  process.exit(1);
});
