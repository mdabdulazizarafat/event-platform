import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cluster from 'cluster';
import os from 'os';
import eventRoutes from './routes/event.routes';
import authRoutes from './routes/auth.routes';
import ticketRoutes from './routes/ticket.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import queueRoutes from './routes/queue-monitor';
import certificateRoutes from './routes/certificate.routes';
import partnersTeamRoutes from './routes/partners-team.routes';
import { startStatusScheduler } from './workers/status-scheduler';
import { startWorkers } from './workers/worker';
import logger from './lib/logger';
import prisma from './lib/prisma';
import { requestLogger } from './middleware/request-logger.middleware';
import { securityHeaders, corsMiddleware } from './middleware/security.middleware';

const app = express();
const port = process.env.PORT || 3001;

app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(requestLogger);

// Routes
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/queues', queueRoutes);
app.use('/api/v1/certificates', certificateRoutes);
app.use('/api/v1', partnersTeamRoutes);

// Health Check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', timestamp: new Date() });
  } catch (err: any) {
    res.status(503).json({ status: 'degraded', database: 'disconnected', timestamp: new Date() });
  }
});

// Global JSON Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({ error: isProd ? 'Internal server error' : err.message || 'Internal server error' });
});

async function startServer() {
  // Test Prisma database connection
  try {
    await prisma.$connect();
    logger.info('Database connection established via Prisma Client');
  } catch (dbErr: any) {
    logger.error({ err: dbErr }, 'Failed to connect to PostgreSQL via Prisma');
  }

  if (process.env.NODE_ENV === 'production' && cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    logger.info(`Primary process ${process.pid} is running`);
    logger.info(`Forking ${numCPUs} cluster workers...`);

    // Start background scheduler ONLY on primary process (avoids multi-worker stampede)
    startStatusScheduler();

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      logger.warn(`Worker ${worker.process.pid} died with code ${code} (${signal}). Restarting worker...`);
      cluster.fork();
    });
  } else {
    // In development or inside a cluster worker process
    if (process.env.NODE_ENV !== 'production') {
      // In single-process development mode, run status scheduler here
      startStatusScheduler();
    }

    try {
      startWorkers(); // Boot BullMQ email workers
    } catch (workerErr: any) {
      logger.warn({ err: workerErr }, 'BullMQ worker initialization skipped (Redis unavailable)');
    }

    app.listen(port, () => {
      logger.info(`Backend Express server listening on port ${port} (PID: ${process.pid})`);
    });
  }
}

startServer().catch((err) => {
  logger.error({ err }, 'Failed to start backend server');
});
