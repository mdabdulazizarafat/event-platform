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
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Missing imageBase64' });
      }

      const matches = imageBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid base64 format' });
      }

      const buffer = Buffer.from(matches[2], 'base64');
      const tempId = `temp-${Date.now()}`;
      const url = await StorageService.uploadEventBanner(tempId, buffer);
      
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
      
      const hostUsername = req.user.username;
      const { slug, title, description, thumbnail, date, time, location, capacity, contactEmail, contactPhone, status } = req.body;
      
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
      const { title, description, thumbnail, date, time, location, capacity, contactEmail, contactPhone, status } = req.body;

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
      });

      return res.status(200).json({ message: 'Event updated successfully', event: updated });
    } catch (error: any) {
      logger.error({ err: error }, 'Error updating event');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const events = await EventService.getEvents(req.user?.username, req.user?.role);
      return res.status(200).json(events);
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
      const { email, userId, ticketTypeId } = req.body;

      if (!email || !userId) {
        return res.status(400).json({ error: 'Missing email or userId' });
      }

      const event = await EventService.getEventBySlug(slug);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
        return res.status(400).json({ error: 'Registration deadline has passed' });
      }

      // If ticketTypeId is provided, check if the ticket is paid
      if (ticketTypeId) {
        const ticketRes = await pool.query('SELECT * FROM ticket_types WHERE id = $1 AND event_id = $2 AND is_active = true', [ticketTypeId, event.id]);
        if (ticketRes.rowCount === 0) {
          return res.status(400).json({ error: 'Invalid or inactive ticket type' });
        }
        const ticketType = ticketRes.rows[0];

        if (parseFloat(ticketType.price) > 0) {
          // Paid ticket — registration must go through payment flow
          return res.status(400).json({ 
            error: 'This is a paid ticket. Please use the payment endpoint to register.',
            requiresPayment: true,
            price: ticketType.price,
            currency: ticketType.currency,
          });
        }
      }

      const result = await RegistrationService.registerForEvent(event.id, userId, email, ticketTypeId || null);
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

      const registrations = await RegistrationService.getRegistrationsByEvent(event.id);
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
}
