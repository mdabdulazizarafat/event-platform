// @ts-ignore: Prisma client is generated inside Docker container, so it may be missing in local IDE
import { PrismaClient } from '@prisma/client';
import logger from './logger';
import os from 'os';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const numCPUs = os.cpus().length || 1;
  // Calculate connection limit per cluster worker so total cluster connections <= 80 (leaving buffer for admin/jobs)
  const connectionLimit = Math.max(2, Math.floor(80 / numCPUs));

  let dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rong_plan';

  // Append connection_limit parameter if not already present
  if (!dbUrl.includes('connection_limit=')) {
    const separator = dbUrl.includes('?') ? '&' : '?';
    dbUrl = `${dbUrl}${separator}connection_limit=${connectionLimit}`;
  }

  logger.info(`Initializing Prisma Client (CPU cores: ${numCPUs}, connection_limit per worker: ${connectionLimit})`);

  const client = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

  return client;
}

export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
