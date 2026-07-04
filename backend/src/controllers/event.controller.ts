import { Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { RegistrationService } from '../services/registration.service';

export class EventController {
  static async create(req: Request, res: Response) {
    try {
      const { slug, title, date, time, location, capacity, hostUsername } = req.body;
      
      if (!slug || !title || !date || !time || !location || !capacity || !hostUsername) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const eventId = await EventService.createEvent({
        slug,
        title,
        date,
        time,
        location,
        capacity: parseInt(capacity),
        hostUsername,
      });

      return res.status(201).json({ message: 'Event created and partition created successfully', eventId });
    } catch (error: any) {
      console.error('Error creating event:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const events = await EventService.getEvents();
      return res.status(200).json(events);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getBySlug(req: Request, res: Response) {
    try {
      const event = await EventService.getEventBySlug(req.params.slug);
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
      const { email, userId } = req.body;

      if (!email || !userId) {
        return res.status(400).json({ error: 'Missing email or userId' });
      }

      const event = await EventService.getEventBySlug(slug);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const result = await RegistrationService.registerForEvent(event.id, userId, email);
      return res.status(201).json({
        message: 'Registration confirmed',
        registrationId: result.registrationId,
        qrToken: result.qrToken,
      });
    } catch (error: any) {
      console.error('Error registering:', error);
      return res.status(500).json({ error: error.message || 'Registration failed' });
    }
  }
}
