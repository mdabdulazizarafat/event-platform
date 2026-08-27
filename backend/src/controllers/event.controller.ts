import { Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { RegistrationService } from '../services/registration.service';
import { StorageService } from '../services/storage.service';
import { pool } from '../db/pool';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('event.controller');

export class EventController {
  static async uploadImage(req: Request, res: Response) {
    try {
      const { imageBase64, eventId } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Missing imageBase64' });
      }

      const matches = imageBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid base64 format' });
      }

      const buffer = Buffer.from(matches[2], 'base64');
      const targetId = eventId || `temp-${Date.now()}`;
      const url = await StorageService.uploadEventBanner(targetId, buffer);
      
      return res.status(200).json({ url });
    } catch (error: any) {
      logger.error({ err: error }, 'Error uploading image');
      return res.status(500).json({ error: error.message || 'Upload failed' });
    }
  }
  static async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      if (req.user.role === 'USER') {
        return res.status(403).json({ error: 'Users cannot create events. Please upgrade to Organizer.' });
      }
      
      const hostUsername = req.user.username;
      const { 
        slug, title, description, thumbnail, date, time, location, capacity, contactEmail, contactPhone, status,
        formPhone, formJobTitle, formOrganization, formTshirtSize, formReference, formTransactionId,
        isPrivate, eventFor, studentCategory,
        startDate, endDate, registrationDeadline
      } = req.body;
      
      if (!slug || !title || !date || !time || !location || !capacity) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Rate limit check: Max 3 event creations per host per hour
      const rateLimitQuery = `
        SELECT COUNT(*) FROM events 
        WHERE host_username = $1 AND created_at > NOW() - INTERVAL '1 hour'
      `;
      const countRes = await pool.query(rateLimitQuery, [hostUsername]);
      const eventCount = parseInt(countRes.rows[0].count);

      if (eventCount >= 3) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded: Hosts can only create up to 3 events per hour.' 
        });
      }

      const eventId = await EventService.createEvent({
        slug,
        title,
        date,
        time,
        location,
        capacity: parseInt(capacity),
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        hostUsername,
        description: description || undefined,
        thumbnail: thumbnail || undefined,
        status: status || 'DRAFT',
        formPhone: formPhone !== undefined ? !!formPhone : undefined,
        formJobTitle: formJobTitle !== undefined ? !!formJobTitle : undefined,
        formOrganization: formOrganization !== undefined ? !!formOrganization : undefined,
        formTshirtSize: formTshirtSize !== undefined ? !!formTshirtSize : undefined,
        formReference: formReference !== undefined ? !!formReference : undefined,
        formTransactionId: formTransactionId !== undefined ? !!formTransactionId : undefined,
        isPrivate: isPrivate !== undefined ? !!isPrivate : undefined,
        eventFor,
        studentCategory,
        startDate,
        endDate,
        registrationDeadline,
      });

      return res.status(201).json({ message: 'Event created and partition created successfully', eventId });
    } catch (error: any) {
      logger.error({ err: error }, 'Error creating event');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { slug } = req.params;
      const { 
        title, description, thumbnail, date, time, location, capacity, contactEmail, contactPhone, status,
        formPhone, formJobTitle, formOrganization, formTshirtSize, formReference, formTransactionId,
        isPrivate, eventFor, studentCategory,
        startDate, endDate, registrationDeadline
      } = req.body;

      const updated = await EventService.updateEvent(slug, req.user.username, {
        title,
        date,
        time,
        location,
        capacity: capacity ? parseInt(capacity) : undefined,
        contactEmail,
        contactPhone,
        description,
        thumbnail,
        status,
        formPhone: formPhone !== undefined ? !!formPhone : undefined,
        formJobTitle: formJobTitle !== undefined ? !!formJobTitle : undefined,
        formOrganization: formOrganization !== undefined ? !!formOrganization : undefined,
        formTshirtSize: formTshirtSize !== undefined ? !!formTshirtSize : undefined,
        formReference: formReference !== undefined ? !!formReference : undefined,
        formTransactionId: formTransactionId !== undefined ? !!formTransactionId : undefined,
        isPrivate: isPrivate !== undefined ? !!isPrivate : undefined,
        eventFor,
        studentCategory,
        startDate,
        endDate,
        registrationDeadline,
      }, req.user.role);

      return res.status(200).json({ message: 'Event updated successfully', event: updated });
    } catch (error: any) {
      logger.error({ err: error }, 'Error updating event');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const result = await EventService.getEvents({
        username: req.user?.username,
        role: req.user?.role,
        page,
        limit,
        search,
        status,
      });
      if (page === undefined && limit === undefined) {
        return res.status(200).json(result.data);
      }
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getBySlug(req: Request, res: Response) {
    try {
      const event = await EventService.getEventBySlug(req.params.slug, req.user?.username, req.user?.role);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      return res.status(200).json(event);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const { 
        email, userId, ticketTypeId, ticketTypeIds: incomingTicketTypeIds,
        fullName, phone, jobTitle, organization, tshirtSize, reference, transactionId,
        teamName, teamMembers
      } = req.body;

      // Enforce Service Controls
      const settingsRes = await pool.query("SELECT value FROM platform_settings WHERE key = 'features'");
      const features = settingsRes.rows[0]?.value || {};
      if (features.participantRegistration === false) {
        return res.status(403).json({ error: 'Participant registrations are currently disabled globally by the administrator.' });
      }

      const ticketTypeIds = incomingTicketTypeIds || (ticketTypeId ? [ticketTypeId] : []);

      if (!email || !userId) {
        return res.status(400).json({ error: 'Missing email or userId' });
      }

      const event = await EventService.getEventBySlug(slug);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.status !== 'PUBLISHED') {
        return res.status(400).json({ error: 'Registration is closed or not open for this event' });
      }

      if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
        return res.status(400).json({ error: 'Registration deadline has passed' });
      }

      // Validate ticket types and calculate total price
      if (ticketTypeIds.length > 0) {
        const placeholders = ticketTypeIds.map((_: number, i: number) => `$${i + 2}`).join(',');
        const ticketRes = await pool.query(
          `SELECT * FROM ticket_types WHERE id IN (${placeholders}) AND event_id = $1 AND is_active = true`,
          [event.id, ...ticketTypeIds]
        );
        
        if (ticketRes.rowCount !== ticketTypeIds.length) {
          return res.status(400).json({ error: 'One or more invalid or inactive ticket types' });
        }

        let totalPrice = 0;
        let currency = 'BDT';
        for (const ticketType of ticketRes.rows) {
          totalPrice += parseFloat(ticketType.price || '0');
          currency = ticketType.currency || currency;
        }

        if (totalPrice > 0) {
          // Paid ticket — registration must go through payment flow
          return res.status(400).json({ 
            error: 'This registration requires payment. Please use the payment endpoint to register.',
            requiresPayment: true,
            price: totalPrice,
            currency: currency,
          });
        }
      }

      const result = await RegistrationService.registerForEvent(
        event.id, 
        userId, 
        email, 
        ticketTypeIds,
        {
          fullName,
          phone,
          jobTitle,
          organization,
          tshirtSize,
          reference,
          transactionId,
          teamName,
          teamMembers,
        }
      );
      return res.status(201).json({
        message: 'Registration confirmed',
        registrationId: result.registrationId,
        qrToken: result.qrToken,
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Error registering for event');
      return res.status(500).json({ error: error.message || 'Registration failed' });
    }
  }

  static async getRegistrations(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { slug } = req.params;
      const event = await EventService.getEventBySlug(slug);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.host_username !== req.user.username) {
        return res.status(403).json({ error: 'Unauthorized: Only the event host can retrieve registrations.' });
      }

      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const registrations = await RegistrationService.getRegistrationsByEvent(event.id, { page, limit, search, status });
      return res.status(200).json(registrations);
    } catch (error: any) {
      logger.error({ err: error }, 'Error fetching registrations');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async getMyManagedEvents(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const username = req.user.username;
      const query = `
        SELECT e.* 
        FROM events e
        JOIN event_team et ON e.id = et.event_id
        WHERE et.username = $1 AND et.role = 'MANAGER'
        ORDER BY e.created_at DESC
      `;
      const result = await pool.query(query, [username]);
      return res.status(200).json(result.rows);
    } catch (error: any) {
      logger.error({ err: error }, 'Error fetching my managed events');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async getDashboardStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const username = req.user.username;
      
      // Get events the user hosts or manages
      const eventsQuery = `
        SELECT e.id 
        FROM events e
        LEFT JOIN event_team et ON e.id = et.event_id AND et.username = $1
        WHERE e.host_username = $1 OR (et.username = $1 AND et.role = 'ORGANIZER')
      `;
      const eventsRes = await pool.query(eventsQuery, [username]);
      const eventIds = eventsRes.rows.map(r => r.id);

      if (eventIds.length === 0) {
        return res.status(200).json({
          totalRegistrations: 0,
          totalRevenue: 0,
          activeSessions: 0,
          checkInRate: 0
        });
      }

      const idsString = eventIds.join(',');

      // Total Registrations
      const regQuery = `SELECT COUNT(*) as count FROM registrations WHERE event_id IN (${idsString}) AND status != 'CANCELLED'`;
      const regRes = await pool.query(regQuery);
      const totalRegistrations = parseInt(regRes.rows[0].count);

      // Total Revenue
      const revQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE event_id IN (${idsString}) AND status = 'SUCCESS'`;
      const revRes = await pool.query(revQuery);
      const totalRevenue = parseFloat(revRes.rows[0].total);

      // Active Sessions (Live Events)
      const liveQuery = `SELECT COUNT(*) as count FROM events WHERE id IN (${idsString}) AND status = 'LIVE'`;
      const liveRes = await pool.query(liveQuery);
      const activeSessions = parseInt(liveRes.rows[0].count);

      // Check-in rate (Scans vs Total Registrations)
      let checkInRate = 0;
      if (totalRegistrations > 0) {
        const scansQuery = `SELECT COUNT(DISTINCT registration_id) as count FROM activity_scans WHERE event_id IN (${idsString})`;
        const scansRes = await pool.query(scansQuery);
        const totalScans = parseInt(scansRes.rows[0].count);
        checkInRate = Math.round((totalScans / totalRegistrations) * 100);
      }

      return res.status(200).json({
        totalRegistrations,
        totalRevenue,
        activeSessions,
        checkInRate
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Error fetching dashboard stats');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
