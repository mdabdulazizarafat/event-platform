import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import eventRoutes from './routes/event.routes';
import authRoutes from './routes/auth.routes';
import ticketRoutes from './routes/ticket.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import queueRoutes from './routes/queue-monitor';
import certificateRoutes from './routes/certificate.routes';
import partnersTeamRoutes from './routes/partners-team.routes';
import { runMigrations } from './db/migrate';
import { startStatusScheduler } from './workers/status-scheduler';
import logger from './lib/logger';
import { requestLogger } from './middleware/request-logger.middleware';
import { securityHeaders, corsMiddleware } from './middleware/security.middleware';

const app = express();
const port = process.env.PORT || 3001;

app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true })); // Required for SSLCommerz form-encoded callbacks
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
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Global JSON Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({ error: isProd ? 'Internal server error' : (err.message || 'Internal server error') });
});

// Run Migrations then Start Server
async function startServer() {
  await runMigrations();
  // startWorkers(); // Boot BullMQ workers (Disabled to prevent Redis connection crash)
  startStatusScheduler(); // Start background event status transitions scheduler
  app.listen(port, () => {
    logger.info(`Backend Express server listening on port ${port}`);
  });
}

startServer().catch((err) => {
  logger.error({ err }, 'Failed to start backend server');
});

