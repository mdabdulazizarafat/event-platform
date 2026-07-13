import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import eventRoutes from './routes/event.routes';
import authRoutes from './routes/auth.routes';
import ticketRoutes from './routes/ticket.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import { runMigrations } from './db/migrate';
import { startWorkers } from './workers/worker';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Required for SSLCommerz form-encoded callbacks
app.use(cookieParser());

// Routes
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Global JSON Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Run Migrations then Start Server
async function startServer() {
  await runMigrations();
  startWorkers(); // Boot BullMQ workers
  app.listen(port, () => {
    console.log(`Backend Express server listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start backend server:', err);
});

