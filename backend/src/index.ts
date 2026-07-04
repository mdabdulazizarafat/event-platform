import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import eventRoutes from './routes/event.routes';
import authRoutes from './routes/auth.routes';
import ticketRoutes from './routes/ticket.routes';
import { runMigrations } from './db/migrate';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tickets', ticketRoutes);

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
  app.listen(port, () => {
    console.log(`Backend Express server listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start backend server:', err);
});

