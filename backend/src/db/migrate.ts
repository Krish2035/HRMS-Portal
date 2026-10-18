import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../config/database';
import { logger } from '../config/logger';

export async function runMigrations() {
  logger.info('Running database migrations...');
  try {
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error({ error }, 'Database migration failed');
    throw error;
  }
}

// Allow running directly via tsx
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runMigrations()
    .then(() => pool.end())
    .catch(() => process.exit(1));
}
