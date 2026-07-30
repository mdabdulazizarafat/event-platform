import { Worker } from 'bullmq';
import { pool } from '../db/pool';
import { EmailService } from '../services/email.service';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('worker');

function getRedisConnection(): any {
  const defaultOpts = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
  if (process.env.REDIS_URL) {
    const url = new URL(process.env.REDIS_URL);
    return {
      ...defaultOpts,
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password,
      username: url.username,
      tls: url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
    };
  }
  return {
    ...defaultOpts,
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  };
}

export function startWorkers() {
  logger.info('Initializing BullMQ Workers...');

  const redisConnection = getRedisConnection();
  logger.info(`Connecting BullMQ worker to Redis at ${redisConnection.host}:${redisConnection.port}${redisConnection.tls ? ' (TLS)' : ''}...`);

  // 1. Email Notifications Worker
  const emailWorker = new Worker(
    'email-notifications',
    async (job) => {
      const { email, eventId, registrationId, qrToken } = job.data;
      logger.info({ jobId: job.id, jobName: job.name, registrationId }, 'Processing email job...');

      // Fetch event title
      const eventRes = await pool.query('SELECT title FROM events WHERE id = $1', [eventId]);
      if (eventRes.rowCount === 0) {
        throw new Error(`Event with ID ${eventId} not found`);
      }
      const eventTitle = eventRes.rows[0].title;

      if (job.name === 'sendConfirmationEmail') {
        // Check if registration still exists
        const regRes = await pool.query('SELECT status FROM registrations WHERE id = $1 AND event_id = $2', [registrationId, eventId]);
        if (regRes.rowCount === 0) {
          throw new Error(`Registration ${registrationId} not found`);
        }

        // Generate QR Code URL via public API
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrToken}`;

        // Call Email Service
        await EmailService.sendTicketConfirmation({
          email,
          eventTitle,
          qrCodeUrl,
        });

        logger.info({ registrationId }, 'Confirmation email sent successfully');
      } else if (job.name === 'sendCancellationEmail') {
        // Call Email Service for Cancellation
        await EmailService.sendTicketCancellation({
          email,
          eventTitle,
        });

        logger.info({ registrationId }, 'Cancellation email sent successfully');
      } else {
        logger.warn({ jobName: job.name }, 'Unknown job name');
      }
    },
    { connection: redisConnection as any }
  );

  emailWorker.on('error', (err) => {
    logger.error({ err }, 'Email Worker connection warning/error');
  });

  // Handle final job failure (DLQ concept)
  emailWorker.on('failed', async (job, err) => {
    if (job) {
      const { attemptsMade, opts, data } = job;
      const maxAttempts = opts.attempts || 3;
      if (attemptsMade >= maxAttempts) {
        logger.fatal({ jobId: job.id, registrationId: data.registrationId, attemptsMade, err }, 'Email job failed after max attempts. Marking DELIVERY_FAILED');
        try {
          // Do not overwrite CANCELLED status with DELIVERY_FAILED
          await pool.query(
            "UPDATE registrations SET status = 'DELIVERY_FAILED' WHERE id = $1 AND event_id = $2 AND status != 'CANCELLED'",
            [data.registrationId, data.eventId]
          );
        } catch (dbErr: any) {
          logger.error({ err: dbErr, registrationId: data.registrationId }, 'Failed to update status to DELIVERY_FAILED');
        }
      }
    }
  });
}

