import { pool } from '../db/pool';
import { Queue } from 'bullmq';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('registration.service');

// BullMQ Sidecar Worker Offloading Queues
// Lazy initialization to ensure dotenv has loaded before reading env vars
let _emailQueue: Queue | null = null;

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

export function getEmailQueue(): Queue {
  if (!_emailQueue) {
    _emailQueue = new Queue('email-notifications', {
      connection: getRedisConnection(),
    });
    _emailQueue.on('error', (err) => {
      logger.warn({ err }, 'Redis connection warning (emailQueue)');
    });
  }
  return _emailQueue;
}



export class RegistrationService {
  /**
   * Atomic concurrent registration query checking capacity dynamically
   * in the insert statement to prevent race conditions during ticket drop spikes.
   * 
   * Now supports ticket types with per-ticket-type capacity enforcement.
   * For free tickets only — paid tickets go through PaymentService.
   */
  static async registerForEvent(
    eventId: number, 
    userId: string, 
    email: string, 
    ticketTypeId: number | null = null,
    details?: {
      fullName?: string;
      phone?: string;
      jobTitle?: string;
      organization?: string;
      tshirtSize?: string;
      reference?: string;
      transactionId?: string;
    }
  ) {
    const client = await pool.connect();
    try {
      // If a ticket type is specified, validate it
      if (ticketTypeId) {
        const ttRes = await client.query(
          'SELECT * FROM ticket_types WHERE id = $1 AND event_id = $2 AND is_active = true',
          [ticketTypeId, eventId]
        );
        if (ttRes.rowCount === 0) {
          throw new Error('Invalid or inactive ticket type.');
        }
        const ticketType = ttRes.rows[0];

        // Reject paid tickets from this flow
        if (parseFloat(ticketType.price) > 0) {
          throw new Error('Paid tickets must be registered through the payment flow.');
        }

        // Check per-ticket-type capacity
        if (ticketType.capacity) {
          const countRes = await client.query(
            "SELECT COUNT(*) FROM registrations WHERE ticket_type_id = $1 AND event_id = $2 AND status != 'CANCELLED'",
            [ticketTypeId, eventId]
          );
          const soldCount = parseInt(countRes.rows[0].count);
          if (soldCount >= ticketType.capacity) {
            throw new Error('This ticket type is sold out.');
          }
        }
      }

      // Atomic insert checking current count against global event capacity
      const registerQuery = `
        INSERT INTO registrations (
          event_id, ticket_type_id, user_id, email, status, payment_status,
          full_name, phone, job_title, organization, tshirt_size, reference, transaction_id
        )
        SELECT $1, $2, $3, $4, 'CONFIRMED', 'NOT_REQUIRED', $5, $6, $7, $8, $9, $10, $11
        WHERE (
          SELECT COUNT(*) FROM registrations WHERE event_id = $1 AND status != 'CANCELLED'
        ) < (
          SELECT capacity FROM events WHERE id = $1
        )
        RETURNING id, qr_token;
      `;
      
      const res = await client.query(registerQuery, [
        eventId, 
        ticketTypeId, 
        userId, 
        email,
        details?.fullName || null,
        details?.phone || null,
        details?.jobTitle || null,
        details?.organization || null,
        details?.tshirtSize || null,
        details?.reference || null,
        details?.transactionId || null,
      ]);

      if (res.rowCount === 0) {
        throw new Error('Registration failed: Event is at capacity or does not exist.');
      }

      const { id: registrationId, qr_token: qrToken } = res.rows[0];

      // Offload heavy non-blocking operations via BullMQ (handled gracefully if Redis is offline)
      try {
        await getEmailQueue().add(
          'sendConfirmationEmail', 
          { email, eventId, registrationId, qrToken },
          { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
        );

      } catch (queueError: any) {
        logger.warn({ err: queueError }, 'Failed to queue email confirmation job (Redis offline)');
      }

      return { registrationId, qrToken };
    } finally {
      client.release();
    }
  }

  static async getRegistrationsByEvent(eventId: number) {
    const res = await pool.query(
      `SELECT r.*, tt.name as ticket_type_name, tt.price as ticket_price
       FROM registrations r
       LEFT JOIN ticket_types tt ON r.ticket_type_id = tt.id
       WHERE r.event_id = $1
       ORDER BY r.registered_at DESC`,
      [eventId]
    );
    return res.rows;
  }
}
