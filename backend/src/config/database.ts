import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from './env';
import { logger } from './logger';
import * as schema from '../db/schema/index';

const { Pool } = pg;

const isSslRequired = env.DATABASE_URL.includes('neon.tech') || 
  env.DATABASE_URL.includes('sslmode=require') || 
  process.env.NODE_ENV === 'production';

// Primary Connection Pool (Writes & Transactions)
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: isSslRequired ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected error on idle primary PostgreSQL pool');
});

export const db = drizzle(pool, { schema });

// Read Replica Pool (Read-heavy reporting & analytical queries)
const replicaConnectionString = process.env.READ_REPLICA_URL || env.DATABASE_URL;
const isReplicaSslRequired = replicaConnectionString.includes('neon.tech') || 
  replicaConnectionString.includes('sslmode=require') || 
  process.env.NODE_ENV === 'production';

export const replicaPool = new Pool({
  connectionString: replicaConnectionString,
  ssl: isReplicaSslRequired ? { rejectUnauthorized: false } : undefined,
  max: 30, // Higher capacity for concurrent read reports
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

replicaPool.on('error', (err) => {
  logger.error({ err }, 'Unexpected error on idle replica PostgreSQL pool');
});

export const replicaDb = drizzle(replicaPool, { schema });

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    logger.warn({ error }, 'Database connection check failed (will retry on next request)');
    return false;
  }
}
