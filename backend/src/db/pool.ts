import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import logger from '../lib/logger';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rong_plan';
const useSsl = process.env.DB_SSL === 'true' || connectionString.includes('sslmode=require');

const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

const poolConfig: PoolConfig = {
  connectionString,
  max: parseInt(process.env.DB_POOL_MAX || '25', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '5000', 10),
  allowExitOnIdle: false,
  ...(useSsl ? { ssl: { rejectUnauthorized } } : {}),
};

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected error on idle PostgreSQL client');
});

pool.on('connect', () => {
  logger.debug('New client connected to PostgreSQL pool');
});
