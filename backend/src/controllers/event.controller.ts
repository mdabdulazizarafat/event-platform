import { Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { RegistrationService } from '../services/registration.service';
import { StorageService } from '../services/storage.service';
import prisma from '../lib/prisma';
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

      const organizerUsername = req.user.username;
      const {
        slug, title, description, thumbnail, date, time, location, capacity, contactEmail, contactPhone, status,
        formPhone, formJobTitle, formOrganization, formTshirtSize, formReference, formTransactionId,
        isPrivate, eventFor, studentCategory,
        startDate, endDate, registrationDeadline,
      } = req.body;

      if (!slug || !title || !date || !time || !location || !capacity) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Rate limit check: Max 3 event creations per host per hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const eventCount = await prisma.event.count({
        where: {
          organizerUsername,
          createdAt: { gte: oneHourAgo },
        },
      });

      if (eventCount >= 3) {
        return res.status(429).json({
          error: 'Rate limit exceeded: Hosts can only create up to 3 events per hour.',
        });
      }

      const eventId = await EventService.createEvent({
        slug,
        title,
        date,
        time,
        location,
        capacity: parseInt(capacity, 10),
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        organizerUsername,
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
        paymentInstructions: req.body.paymentInstructions || undefined,
        bkashNumber: req.body.bkashNumber || undefined,
        rejectionReason: req.body.rejectionReason || undefined,
      });

      return res.status(201).json({ message: 'Event created successfully', eventId });
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
        startDate, endDate, registrationDeadline,
        paymentInstructions, bkashNumber, rejectionReason,
      } = req.body;

      const updated = await EventService.updateEvent(slug, req.user.username, {
        title,
        date,
        time,
        location,
        capacity: capacity ? parseInt(capacity, 10) : undefined,
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
        paymentInstructions,
        bkashNumber,
        rejectionReason,
      }, req.user.role);

      return res.status(200).json({ message: 'Event updated successfully', event: updated });
    } catch (error: any) {
      logger.error({ err: error }, 'Error updating event');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const cursor = req.query.cursor ? parseInt(req.query.cursor as string, 10) : undefined;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const category = req.query.category as string;

      const result = await EventService.getEvents({
        username: req.user?.username,
        role: req.user?.role,
        page,
        limit,
        cursor,
        search,
        status,
        category,
      });

      if (page === undefined && limit === undefined && cursor === undefined) {
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
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { slug } = req.params;
      const {
        ticketTypeId, ticketTypeIds: incomingTicketTypeIds,
        fullName, phone, jobTitle, organization, tshirtSize, reference, transactionId,
        teamName, teamMembers,
      } = req.body;

      const userId = req.user.username;
      const email = req.user.email;

      const settings = await prisma.platformSetting.findUnique({ where: { key: 'features' } });
      const features = (settings?.value as any) || {};
      if (features.participantRegistration === false) {
        return res.status(403).json({ error: 'Participant registrations are currently disabled globally by the administrator.' });
      }

      const ticketTypeIds = incomingTicketTypeIds || (ticketTypeId ? [ticketTypeId] : []);

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

      if (ticketTypeIds.length > 0) {
        const ticketTypes = await prisma.ticketType.findMany({
          where: {
            id: { in: ticketTypeIds },
            eventId: event.id,
            isActive: true,
          },
        });

        if (ticketTypes.length !== ticketTypeIds.length) {
          return res.status(400).json({ error: 'One or more invalid or inactive ticket types' });
        }

        let totalPrice = 0;
        let currency = 'BDT';
        for (const tt of ticketTypes) {
          totalPrice += Number(tt.price || 0);
          currency = tt.currency || currency;
        }

        if (totalPrice > 0 && (!transactionId || !transactionId.trim())) {
          return res.status(400).json({
            error: 'Manual bKash / mobile banking transaction ID is required for paid tickets.',
            requiresPayment: true,
            price: totalPrice,
            currency,
          });
        }
      }

      const cleanTransactionId = transactionId ? transactionId.trim() : undefined;

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
          transactionId: cleanTransactionId,
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

      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
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

      const events = await prisma.event.findMany({
        where: {
          team: {
            some: {
              username,
              role: 'MANAGER',
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(events);
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

      const hostEvents = await prisma.event.findMany({
        where: {
          OR: [
            { organizerUsername: username },
            { team: { some: { username, role: 'ORGANIZER' } } },
          ],
        },
        select: { id: true },
      });

      const eventIds = hostEvents.map((e: any) => e.id);

      if (eventIds.length === 0) {
        return res.status(200).json({
          totalRegistrations: 0,
          totalRevenue: 0,
          activeSessions: 0,
          checkInRate: 0,
        });
      }

      const [totalRegistrations, revenueAggregate, activeSessions, totalScans] = await Promise.all([
        prisma.registration.count({
          where: {
            eventId: { in: eventIds },
            status: { not: 'CANCELLED' },
          },
        }),
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            eventId: { in: eventIds },
            status: { in: ['SUCCESS', 'COMPLETED', 'SETTLED'] },
          },
        }),
        prisma.event.count({
          where: {
            id: { in: eventIds },
            status: 'LIVE',
          },
        }),
        prisma.activityScan.groupBy({
          by: ['registrationId'],
          where: { eventId: { in: eventIds } },
        }),
      ]);

      const totalRevenue = Number(revenueAggregate._sum.amount || 0);
      const uniqueScannedRegistrations = totalScans.length;
      const checkInRate = totalRegistrations > 0 ? Math.round((uniqueScannedRegistrations / totalRegistrations) * 100) : 0;

      return res.status(200).json({
        totalRegistrations,
        totalRevenue,
        activeSessions,
        checkInRate,
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Error fetching dashboard stats');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
