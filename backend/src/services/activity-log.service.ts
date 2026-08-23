import { pool } from '../db/pool';
import { EventActivityService } from './event-activity.service';

export interface ScanInput {
  eventId: number;
  activityId: number;
  qrToken: string;
  scannedBy: string;
}

export class ActivityLogService {
  /**
   * Scans a QR token for a specific activity checkpoint.
   * Safely handles concurrent scans at the database level using a UNIQUE constraint.
   */
  static async scanQrToken(input: ScanInput) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Verify activity exists and is active
      const activity = await EventActivityService.getActivityById(input.activityId);
      if (!activity || activity.event_id !== input.eventId) {
        throw new Error('Activity not found or does not belong to this event.');
      }
      if (!activity.is_active) {
        throw new Error('This scanning checkpoint is currently inactive.');
      }

      // 2. Look up registration by exact B-Tree indexed QR token
      const registrationQuery = `
        SELECT r.*, tt.name as ticket_name 
        FROM registrations r
        LEFT JOIN ticket_types tt ON r.ticket_type_id = tt.id
        WHERE r.event_id = $1 AND r.qr_token = $2;
      `;
      const regRes = await client.query(registrationQuery, [input.eventId, input.qrToken]);
      if (regRes.rowCount === 0) {
        throw new Error('Invalid ticket: QR code not found for this event.');
      }

      const registration = regRes.rows[0];

      // 3. Verify registration is confirmed
      if (registration.status !== 'CONFIRMED') {
        throw new Error(`Ticket is ${registration.status}. Entry denied.`);
      }

      // 4. Verify payment status (if paid ticket, must be completed)
      if (registration.payment_status === 'PENDING') {
        throw new Error('Ticket payment is pending. Entry denied.');
      }
      if (registration.payment_status === 'FAILED') {
        throw new Error('Ticket payment failed. Entry denied.');
      }

      // 5. Handle duplicate scan checking based on scan_limit (typically 1)
      if (activity.scan_limit === 1) {
        // Try atomic INSERT into activity_scans
        const logQuery = `
          INSERT INTO activity_scans (registration_id, event_id, activity_id, scanned_by)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (registration_id, activity_id) DO NOTHING
          RETURNING id, scanned_at;
        `;
        const logRes = await client.query(logQuery, [
          registration.id,
          input.eventId,
          input.activityId,
          input.scannedBy
        ]);

        if (logRes.rowCount === 0) {
          // If insert failed due to conflict, retrieve the original scanner and time
          const originalScanQuery = `
            SELECT l.scanned_at, h.name as scanner_name 
            FROM activity_scans l
            JOIN users h ON l.scanned_by = h.username
            WHERE l.registration_id = $1 AND l.event_id = $2 AND l.activity_id = $3;
          `;
          const origRes = await client.query(originalScanQuery, [
            registration.id,
            input.eventId,
            input.activityId
          ]);
          const orig = origRes.rows[0];
          const timeStr = orig ? new Date(orig.scanned_at).toLocaleTimeString() : 'earlier';
          const scannerName = orig ? orig.scanner_name : 'another scanner';

          throw new Error(
            `Already scanned! Checked by ${scannerName} at ${timeStr}.`
          );
        }

        await client.query('COMMIT');
        return {
          success: true,
          message: `${activity.name} approved.`,
          registration: {
            id: registration.id,
            email: registration.email,
            userId: registration.user_id,
            ticketName: registration.ticket_name || 'Standard Admission',
          },
          scannedAt: logRes.rows[0].scanned_at
        };
      } else {
        // If scan limit is not 1 (e.g. unlimited or higher), we log it without strict UNIQUE block
        // (Note: unique constraint in schema means currently only 1 entry can exist.
        // If we want actual unlimited logs we'd have to drop the unique constraint,
        // but for now all check-in/food/gift activities have limit=1).
        const logQuery = `
          INSERT INTO activity_scans (registration_id, event_id, activity_id, scanned_by)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (registration_id, activity_id) 
          DO UPDATE SET scanned_at = CURRENT_TIMESTAMP, scanned_by = EXCLUDED.scanned_by
          RETURNING id, scanned_at;
        `;
        const logRes = await client.query(logQuery, [
          registration.id,
          input.eventId,
          input.activityId,
          input.scannedBy
        ]);

        await client.query('COMMIT');
        return {
          success: true,
          message: `${activity.name} recorded (updated).`,
          registration: {
            id: registration.id,
            email: registration.email,
            userId: registration.user_id,
            ticketName: registration.ticket_name || 'Standard Admission',
          },
          scannedAt: logRes.rows[0].scanned_at
        };
      }
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all scan activity logs for a specific event with pagination (real-time dashboard data).
   */
  static async getLogsForEvent(eventId: number, options: { page?: number; limit?: number } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*) as total FROM activity_scans WHERE event_id = $1`;
    const countRes = await pool.query(countQuery, [eventId]);
    const total = parseInt(countRes.rows[0]?.total || '0');

    const dataQuery = `
      SELECT l.*, r.email, r.user_id, r.full_name, tt.name as ticket_name, a.name as activity_name, h.name as scanner_name
      FROM activity_scans l
      JOIN registrations r ON l.registration_id = r.id AND l.event_id = r.event_id
      LEFT JOIN ticket_types tt ON r.ticket_type_id = tt.id
      JOIN event_activities a ON l.activity_id = a.id
      JOIN users h ON l.scanned_by = h.username
      WHERE l.event_id = $1
      ORDER BY l.scanned_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const res = await pool.query(dataQuery, [eventId, limit, offset]);
    return {
      data: res.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get analytics scan counts grouped by activity.
   */
  static async getScanStats(eventId: number) {
    const query = `
      SELECT a.id as activity_id, a.name as activity_name, COUNT(l.id)::INTEGER as scan_count
      FROM event_activities a
      LEFT JOIN activity_scans l ON a.id = l.activity_id
      WHERE a.event_id = $1 AND a.is_active = true
      GROUP BY a.id, a.name
      ORDER BY a.sort_order ASC;
    `;
    const res = await pool.query(query, [eventId]);
    return res.rows;
  }
}
