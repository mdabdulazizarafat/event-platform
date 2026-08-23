import { Request, Response } from 'express';
import { pool } from '../db/pool';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('ticket.controller');

export class TicketController {
  /**
   * Verify participant QR token and mark them checked-in
   * Strict authorization checks: Ensures only the Event Host can change participant attendance status.
   */
  static async verifyScan(req: Request, res: Response) {
    try {
      const { qrToken } = req.body;

      if (!qrToken) {
        return res.status(400).json({ error: 'QR token is required' });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const activeHost = req.user.username;

      // 1. Fetch the registration and event metadata using the token
      const registrationQuery = `
        SELECT r.id as registration_id, r.event_id, r.user_id, r.email, r.status, e.title as event_title, e.host_username
        FROM registrations r
        JOIN events e ON r.event_id = e.id
        WHERE r.qr_token = $1;
      `;
      const regRes = await pool.query(registrationQuery, [qrToken]);

      if (regRes.rowCount === 0) {
        return res.status(404).json({ error: 'Ticket invalid: Registration not found' });
      }

      const registration = regRes.rows[0];

      // 2. Strict Authorization Check: Only the Host who published the event can check-in participants
      if (registration.host_username !== activeHost) {
        return res.status(403).json({ 
          error: 'Unauthorized: Only the host of this event can perform ticket verification and check-ins.' 
        });
      }

      if (registration.status === 'CANCELLED') {
        return res.status(400).json({ error: 'Ticket invalid: Registration has been cancelled' });
      }

      if (registration.status === 'CHECKED_IN') {
        return res.status(200).json({
          message: 'Already checked in',
          alreadyCheckedIn: true,
          participant: {
            userId: registration.user_id,
            email: registration.email,
            status: registration.status,
            eventTitle: registration.event_title,
          }
        });
      }

      // 3. Perform atomic update changing attendance status and log check-in activity
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const updateQuery = `
          UPDATE registrations 
          SET status = 'CHECKED_IN'
          WHERE id = $1 AND event_id = $2
          RETURNING status;
        `;
        await client.query(updateQuery, [registration.registration_id, registration.event_id]);

        // Find or create default Check-in activity
        let activityId: number;
        const activityRes = await client.query("SELECT id FROM event_activities WHERE event_id = $1 AND name = 'Check-in'", [registration.event_id]);
        if (activityRes.rows.length > 0) {
          activityId = activityRes.rows[0].id;
        } else {
          const insertAct = await client.query("INSERT INTO event_activities (event_id, name, scan_limit, sort_order) VALUES ($1, 'Check-in', 1, 0) RETURNING id", [registration.event_id]);
          activityId = insertAct.rows[0].id;
        }

        // Insert into activity_scans
        await client.query(`
          INSERT INTO activity_scans (registration_id, event_id, activity_id, scanned_by)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (registration_id, activity_id) DO NOTHING
        `, [registration.registration_id, registration.event_id, activityId, activeHost]);

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw err;
      } finally {
        client.release();
      }

      return res.status(200).json({
        message: 'Ticket verified successfully',
        alreadyCheckedIn: false,
        participant: {
          userId: registration.user_id,
          email: registration.email,
          status: 'CHECKED_IN',
          eventTitle: registration.event_title,
        }
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Error verifying ticket scan');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Sync a batch of offline check-ins back to Express.
   * Atomic transactional updates verifying event hosts.
   */
  static async syncOffline(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { scans } = req.body;
    if (!scans || !Array.isArray(scans)) {
      return res.status(400).json({ error: 'Invalid scans payload. Must be an array of scans.' });
    }

    const activeHost = req.user.username;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const syncedTokens: string[] = [];
      const errors: string[] = [];
      const eventActivities: Record<number, number> = {};

      for (const scan of scans) {
        const { qrToken } = scan;
        if (!qrToken) continue;

        // Fetch registration and event info
        const query = `
          SELECT r.id, r.event_id, e.host_username, r.status
          FROM registrations r
          JOIN events e ON r.event_id = e.id
          WHERE r.qr_token = $1
        `;
        const regRes = await client.query(query, [qrToken]);

        if (regRes.rowCount === 0) {
          errors.push(`Token "${qrToken}" is invalid: registration not found`);
          continue;
        }

        const registration = regRes.rows[0];

        // Authorization check: only the event host can sync check-ins
        if (registration.host_username !== activeHost) {
          errors.push(`Token "${qrToken}" unauthorized: host mismatch`);
          continue;
        }

        if (registration.status === 'CANCELLED') {
          errors.push(`Token "${qrToken}" is invalid: registration has been cancelled`);
          continue;
        }

        if (registration.status !== 'CHECKED_IN') {
          const updateQuery = `
            UPDATE registrations
            SET status = 'CHECKED_IN'
            WHERE id = $1 AND event_id = $2
          `;
          await client.query(updateQuery, [registration.id, registration.event_id]);
        }

        // Find or create default Check-in activity (cache in-memory per event_id to minimize queries)
        let activityId = eventActivities[registration.event_id];
        if (!activityId) {
          const activityRes = await client.query("SELECT id FROM event_activities WHERE event_id = $1 AND name = 'Check-in'", [registration.event_id]);
          if (activityRes.rows.length > 0) {
            activityId = activityRes.rows[0].id;
          } else {
            const insertAct = await client.query("INSERT INTO event_activities (event_id, name, scan_limit, sort_order) VALUES ($1, 'Check-in', 1, 0) RETURNING id", [registration.event_id]);
            activityId = insertAct.rows[0].id;
          }
          eventActivities[registration.event_id] = activityId;
        }

        // Log to activity_scans
        await client.query(`
          INSERT INTO activity_scans (registration_id, event_id, activity_id, scanned_by)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (registration_id, activity_id) DO NOTHING
        `, [registration.id, registration.event_id, activityId, activeHost]);

        syncedTokens.push(qrToken);
      }

      await client.query('COMMIT');
      return res.status(200).json({
        message: 'Batch synchronization completed',
        syncedCount: syncedTokens.length,
        syncedTokens,
        errors,
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      logger.error({ err }, 'Offline sync database failure');
      return res.status(500).json({ error: 'Database transaction failed during batch synchronization' });
    } finally {
      client.release();
    }
  }

  /**
   * Resend ticket: update email (optional), reset status to CONFIRMED, and re-enqueue jobs.
   */
  static async resendTicket(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const ticketId = parseInt(req.params.id);
    const { email: newEmail } = req.body;
    const activeHost = req.user.username;

    try {
      // Fetch current registration details
      const query = `
        SELECT r.id, r.event_id, r.email, r.qr_token, e.host_username
        FROM registrations r
        JOIN events e ON r.event_id = e.id
        WHERE r.id = $1
      `;
      const regRes = await pool.query(query, [ticketId]);
      if (regRes.rowCount === 0) {
        return res.status(404).json({ error: 'Registration ticket not found' });
      }

      const registration = regRes.rows[0];

      // Authorization check
      if (registration.host_username !== activeHost) {
        return res.status(403).json({ error: 'Unauthorized: Only the event host can resend this ticket.' });
      }

      const targetEmail = newEmail || registration.email;

      // Update email and reset status to CONFIRMED
      const updateQuery = `
        UPDATE registrations
        SET email = $1, status = 'CONFIRMED'
        WHERE id = $2 AND event_id = $3
        RETURNING email, qr_token;
      `;
      const updateRes = await pool.query(updateQuery, [targetEmail, registration.id, registration.event_id]);
      const { email, qr_token: qrToken } = updateRes.rows[0];

      // Re-enqueue BullMQ job
      const { getEmailQueue } = require('../services/registration.service');
      await getEmailQueue().add(
        'sendConfirmationEmail',
        { email, eventId: registration.event_id, registrationId: registration.id, qrToken },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      );

      return res.status(200).json({ message: 'Ticket resent successfully' });
    } catch (err: any) {
      logger.error({ err }, 'Error resending ticket');
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  /**
   * Cancel ticket: update status to CANCELLED and enqueue cancellation email.
   * Strict authorization checks: Ensures only the Event Host can cancel the ticket.
   */
  static async cancelTicket(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const ticketId = parseInt(req.params.id);
    const activeHost = req.user.username;

    try {
      // Fetch current registration details
      const query = `
        SELECT r.id, r.event_id, r.email, r.qr_token, e.host_username
        FROM registrations r
        JOIN events e ON r.event_id = e.id
        WHERE r.id = $1
      `;
      const regRes = await pool.query(query, [ticketId]);
      if (regRes.rowCount === 0) {
        return res.status(404).json({ error: 'Registration ticket not found' });
      }

      const registration = regRes.rows[0];

      // Authorization check
      if (registration.host_username !== activeHost) {
        return res.status(403).json({ error: 'Unauthorized: Only the event host can cancel this ticket.' });
      }

      // Perform atomic update changing status to CANCELLED
      const updateQuery = `
        UPDATE registrations
        SET status = 'CANCELLED'
        WHERE id = $1 AND event_id = $2
        RETURNING email, qr_token;
      `;
      const updateRes = await pool.query(updateQuery, [registration.id, registration.event_id]);
      const { email, qr_token: qrToken } = updateRes.rows[0];

      // Enqueue cancellation email BullMQ job
      const { getEmailQueue } = require('../services/registration.service');
      await getEmailQueue().add(
        'sendCancellationEmail',
        { email, eventId: registration.event_id, registrationId: registration.id, qrToken },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      );

      return res.status(200).json({ message: 'Ticket cancelled successfully' });
    } catch (err: any) {
      logger.error({ err }, 'Error cancelling ticket');
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  /**
   * Fetch all registered events for the logged-in participant.
   * GET /api/v1/tickets/my-registrations
   */
  static async myRegistrations(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const username = req.user.username;

      // 1. Fetch all registrations for this user (both as leader and team member)
      const query = `
        SELECT DISTINCT r.id, r.event_id, r.email, r.status, r.payment_status, r.qr_token, r.registered_at,
          e.title as event_title, e.date as event_date, e.time as event_time, e.location as event_location, e.slug as event_slug, e.contact_email, e.contact_phone,
          tt.name as ticket_name, tt.price as ticket_price, tt.currency as ticket_currency,
          rt.team_name,
          (r.user_id = $1) as is_leader
        FROM registrations r
        JOIN events e ON r.event_id = e.id
        LEFT JOIN ticket_types tt ON r.ticket_type_id = tt.id
        LEFT JOIN registration_teams rt ON rt.leader_registration_id = r.id
        LEFT JOIN registration_team_members rtm ON rtm.team_id = rt.id
        WHERE r.user_id = $1 OR rtm.username = $1
        ORDER BY r.registered_at DESC;
      `;
      const regRes = await pool.query(query, [username]);
      const registrations = regRes.rows;

      if (registrations.length === 0) {
        return res.status(200).json([]);
      }

      // 2. Fetch all scan activity logs for these registrations to show checkpoint updates
      const regIds = registrations.map(r => r.id);
      const logsQuery = `
        SELECT al.registration_id, al.scanned_at, ea.name as activity_name
        FROM activity_scans al
        JOIN event_activities ea ON al.activity_id = ea.id
        WHERE al.registration_id = ANY($1::bigint[]);
      `;
      const logsRes = await pool.query(logsQuery, [regIds]);
      const logs = logsRes.rows;

      // 3. Map logs to their respective registrations
      const enriched = registrations.map(reg => {
        const regLogs = logs.filter(log => log.registration_id === reg.id);
        return {
          ...reg,
          scanHistory: regLogs.map(l => ({
            activityName: l.activity_name,
            scannedAt: l.scanned_at
          }))
        };
      });

      return res.status(200).json(enriched);
    } catch (err: any) {
      logger.error({ err }, 'Error fetching participant registrations');
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
