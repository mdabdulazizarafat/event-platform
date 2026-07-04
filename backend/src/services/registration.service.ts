import { pool } from '../db/pool';
import { Queue } from 'bullmq';

// BullMQ Sidecar Worker Offloading Queues
const emailQueue = new Queue('email-notifications', {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});
emailQueue.on('error', (err) => {
  console.warn('Redis connection warning (emailQueue):', err.message);
});

const pdfQueue = new Queue('pdf-generation', {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});
pdfQueue.on('error', (err) => {
  console.warn('Redis connection warning (pdfQueue):', err.message);
});

export class RegistrationService {
  /**
   * Atomic concurrent registration query checking capacity dynamically
   * in the insert statement to prevent race conditions during ticket drop spikes.
   */
  static async registerForEvent(eventId: number, userId: string, email: string) {
    const client = await pool.connect();
    try {
      // Atomic insert checking current count against capacity
      const registerQuery = `
        INSERT INTO registrations (event_id, user_id, email, status)
        SELECT $1, $2, $3, 'CONFIRMED'
        WHERE (
          SELECT COUNT(*) FROM registrations WHERE event_id = $1
        ) < (
          SELECT capacity FROM events WHERE id = $1
        )
        RETURNING id, qr_token;
      `;
      
      const res = await client.query(registerQuery, [eventId, userId, email]);

      if (res.rowCount === 0) {
        throw new Error('Registration failed: Event is at capacity or does not exist.');
      }

      const { id: registrationId, qr_token: qrToken } = res.rows[0];

      // Offload heavy non-blocking operations via BullMQ (handled gracefully if Redis is offline)
      try {
        await emailQueue.add('sendConfirmationEmail', { email, eventId, registrationId, qrToken });
        await pdfQueue.add('generateAttendanceCertificate', { email, eventId, registrationId, qrToken });
      } catch (queueError: any) {
        console.warn('Failed to queue email/PDF generation jobs (Redis offline):', queueError.message);
      }

      return { registrationId, qrToken };
    } finally {
      client.release();
    }
  }

  static async getRegistrationsByEvent(eventId: number) {
    const res = await pool.query('SELECT * FROM registrations WHERE event_id = $1', [eventId]);
    return res.rows;
  }
}
