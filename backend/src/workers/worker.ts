import { Worker } from 'bullmq';
import { pool } from '../db/pool';
import { EmailService } from '../services/email.service';

function getRedisConnection(): any {
  if (process.env.REDIS_URL) {
    const url = new URL(process.env.REDIS_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password,
      username: url.username,
      tls: url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
    };
  }
  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  };
}

export function startWorkers() {
  console.log('Initializing BullMQ Workers...');

  const redisConnection = getRedisConnection();
  console.log(`Connecting BullMQ worker to Redis at ${redisConnection.host}:${redisConnection.port}${redisConnection.tls ? ' (TLS)' : ''}...`);

  // 1. Email Notifications Worker
  const emailWorker = new Worker(
    'email-notifications',
    async (job) => {
      const { email, eventId, registrationId, qrToken } = job.data;
      console.log(`Processing email job ${job.id} (type: ${job.name}) for registration ${registrationId}...`);

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

        console.log(`Confirmation email sent successfully for registration ${registrationId}`);
      } else if (job.name === 'sendCancellationEmail') {
        // Call Email Service for Cancellation
        await EmailService.sendTicketCancellation({
          email,
          eventTitle,
        });

        console.log(`Cancellation email sent successfully for registration ${registrationId}`);
      } else {
        console.warn(`Unknown job name: ${job.name}`);
      }
    },
    { connection: redisConnection as any }
  );

  emailWorker.on('error', (err) => {
    console.error('Email Worker connection warning/error:', err.message);
  });

  // Handle final job failure (DLQ concept)
  emailWorker.on('failed', async (job, err) => {
    if (job) {
      const { attemptsMade, opts, data } = job;
      const maxAttempts = opts.attempts || 3;
      if (attemptsMade >= maxAttempts) {
        console.error(`Email job ${job.id} failed after ${attemptsMade} attempts. Marking registration ${data.registrationId} as DELIVERY_FAILED if not cancelled. Error: ${err.message}`);
        try {
          // Do not overwrite CANCELLED status with DELIVERY_FAILED
          await pool.query(
            "UPDATE registrations SET status = 'DELIVERY_FAILED' WHERE id = $1 AND event_id = $2 AND status != 'CANCELLED'",
            [data.registrationId, data.eventId]
          );
        } catch (dbErr: any) {
          console.error(`Failed to update status to DELIVERY_FAILED for registration ${data.registrationId}:`, dbErr.message);
        }
      }
    }
  });
}

