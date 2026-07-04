import { Request, Response } from 'express';
import { pool } from '../db/pool';

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
        WHERE lower(r.qr_token) = lower($1);
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

      // 3. Perform atomic update changing attendance status
      const updateQuery = `
        UPDATE registrations 
        SET status = 'CHECKED_IN'
        WHERE id = $1 AND event_id = $2
        RETURNING status;
      `;
      await pool.query(updateQuery, [registration.registration_id, registration.event_id]);

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
      console.error('Error verifying ticket scan:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
