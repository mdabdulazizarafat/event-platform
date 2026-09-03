import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createChildLogger } from '../lib/logger';
import { getEmailQueue } from '../services/registration.service';

const logger = createChildLogger('ticket.controller');

export class TicketController {
  /**
   * Verify participant QR token and mark them checked-in.
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

      const registration = await prisma.registration.findUnique({
        where: { qrToken },
        include: {
          event: {
            select: { id: true, title: true, organizerUsername: true },
          },
        },
      });

      if (!registration) {
        return res.status(404).json({ error: 'Ticket invalid: Registration not found' });
      }

      if (registration.event.organizerUsername !== activeHost) {
        return res.status(403).json({
          error: 'Unauthorized: Only the host of this event can perform ticket verification and check-ins.',
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
            userId: registration.userId,
            email: registration.email,
            status: registration.status,
            eventTitle: registration.event.title,
          },
        });
      }

      await prisma.$transaction(async (tx: any) => {
        await tx.registration.update({
          where: { id: registration.id },
          data: { status: 'CHECKED_IN' },
        });

        let activity = await tx.eventActivity.findFirst({
          where: { eventId: registration.eventId, name: 'Check-in' },
        });

        if (!activity) {
          activity = await tx.eventActivity.create({
            data: { eventId: registration.eventId, name: 'Check-in', scanLimit: 1, sortOrder: 0 },
          });
        }

        await tx.activityScan.upsert({
          where: {
            registrationId_activityId: {
              registrationId: registration.id,
              activityId: activity.id,
            },
          },
          update: { scannedBy: activeHost, scannedAt: new Date() },
          create: {
            registrationId: registration.id,
            eventId: registration.eventId,
            activityId: activity.id,
            scannedBy: activeHost,
          },
        });
      });

      return res.status(200).json({
        message: 'Ticket verified successfully',
        alreadyCheckedIn: false,
        participant: {
          userId: registration.userId,
          email: registration.email,
          status: 'CHECKED_IN',
          eventTitle: registration.event.title,
        },
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Error verifying ticket scan');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Sync a batch of offline check-ins in optimized batch queries.
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

    try {
      const validQrTokens = scans.map((s: any) => s.qrToken).filter(Boolean);
      if (validQrTokens.length === 0) {
        return res.status(200).json({ message: 'No valid tokens provided', syncedCount: 0, syncedTokens: [], errors: [] });
      }

      // Batch query 1: Fetch all registrations in ONE query
      const registrations = await prisma.registration.findMany({
        where: { qrToken: { in: validQrTokens } },
        include: {
          event: { select: { id: true, organizerUsername: true } },
        },
      });

      const regMap = new Map<string, any>(registrations.map((r: any) => [r.qrToken, r]));
      const syncedTokens: string[] = [];
      const errors: string[] = [];
      const regIdsToUpdate: bigint[] = [];
      const eventIdsSet = new Set<number>();

      for (const scan of scans) {
        const { qrToken } = scan;
        if (!qrToken) continue;

        const reg = regMap.get(qrToken);
        if (!reg) {
          errors.push(`Token "${qrToken}" is invalid: registration not found`);
          continue;
        }

        if (reg.event.organizerUsername !== activeHost) {
          errors.push(`Token "${qrToken}" unauthorized: host mismatch`);
          continue;
        }

        if (reg.status === 'CANCELLED') {
          errors.push(`Token "${qrToken}" is invalid: registration has been cancelled`);
          continue;
        }

        if (reg.status !== 'CHECKED_IN') {
          regIdsToUpdate.push(reg.id);
        }
        eventIdsSet.add(reg.eventId);
        syncedTokens.push(qrToken);
      }

      // Batch update registration status
      if (regIdsToUpdate.length > 0) {
        await prisma.registration.updateMany({
          where: { id: { in: regIdsToUpdate } },
          data: { status: 'CHECKED_IN' },
        });
      }

      // Ensure Check-in activity exists for each event
      const eventActivitiesMap = new Map<number, number>();
      for (const eventId of Array.from(eventIdsSet)) {
        let activity = await prisma.eventActivity.findFirst({
          where: { eventId, name: 'Check-in' },
        });
        if (!activity) {
          activity = await prisma.eventActivity.create({
            data: { eventId, name: 'Check-in', scanLimit: 1, sortOrder: 0 },
          });
        }
        eventActivitiesMap.set(eventId, activity.id);
      }

      // Batch log scans
      const scansToCreate = syncedTokens.map((token: string) => {
        const reg = regMap.get(token)!;
        const activityId = eventActivitiesMap.get(reg.eventId)!;
        return {
          registrationId: reg.id,
          eventId: reg.eventId,
          activityId,
          scannedBy: activeHost,
        };
      });

      if (scansToCreate.length > 0) {
        await prisma.activityScan.createMany({
          data: scansToCreate,
          skipDuplicates: true,
        });
      }

      return res.status(200).json({
        message: 'Batch synchronization completed',
        syncedCount: syncedTokens.length,
        syncedTokens,
        errors,
      });
    } catch (err: any) {
      logger.error({ err }, 'Offline sync database failure');
      return res.status(500).json({ error: 'Database transaction failed during batch synchronization' });
    }
  }

  /**
   * Resend ticket: update email (optional), reset status to CONFIRMED, and re-enqueue jobs.
   */
  static async resendTicket(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const ticketId = BigInt(req.params.id);
    const { email: newEmail } = req.body;
    const activeHost = req.user.username;

    try {
      const registration = await prisma.registration.findUnique({
        where: { id: ticketId },
        include: {
          event: { select: { id: true, organizerUsername: true } },
        },
      });

      if (!registration) {
        return res.status(404).json({ error: 'Registration ticket not found' });
      }

      const isPlatformAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN';
      const isHost = registration.event.organizerUsername === activeHost;
      let isTeamOrganizer = false;

      if (!isPlatformAdmin && !isHost) {
        const teamCheck = await prisma.eventTeam.findFirst({
          where: { eventId: registration.eventId, username: activeHost, role: 'ORGANIZER' },
        });
        isTeamOrganizer = !!teamCheck;
      }

      if (!isPlatformAdmin && !isHost && !isTeamOrganizer) {
        return res.status(403).json({ error: 'Unauthorized: Only event organizers and administrators can resend this ticket.' });
      }

      const targetEmail = newEmail || registration.email;

      const updated = await prisma.registration.update({
        where: { id: ticketId },
        data: { email: targetEmail, status: 'CONFIRMED' },
      });

      await getEmailQueue().add(
        'sendConfirmationEmail',
        { email: updated.email, eventId: registration.eventId, registrationId: Number(registration.id), qrToken: updated.qrToken },
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
   */
  static async cancelTicket(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const ticketId = BigInt(req.params.id);
    const activeHost = req.user.username;

    try {
      const registration = await prisma.registration.findUnique({
        where: { id: ticketId },
        include: {
          event: { select: { id: true, organizerUsername: true } },
        },
      });

      if (!registration) {
        return res.status(404).json({ error: 'Registration ticket not found' });
      }

      const isPlatformAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN';
      const isHost = registration.event.organizerUsername === activeHost;
      let isTeamOrganizer = false;

      if (!isPlatformAdmin && !isHost) {
        const teamCheck = await prisma.eventTeam.findFirst({
          where: { eventId: registration.eventId, username: activeHost, role: 'ORGANIZER' },
        });
        isTeamOrganizer = !!teamCheck;
      }

      if (!isPlatformAdmin && !isHost && !isTeamOrganizer) {
        return res.status(403).json({ error: 'Unauthorized: Only event organizers and administrators can cancel this ticket.' });
      }

      const updated = await prisma.registration.update({
        where: { id: ticketId },
        data: { status: 'CANCELLED' },
      });

      await getEmailQueue().add(
        'sendCancellationEmail',
        { email: updated.email, eventId: registration.eventId, registrationId: Number(registration.id), qrToken: updated.qrToken },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      );

      return res.status(200).json({ message: 'Ticket cancelled successfully' });
    } catch (err: any) {
      logger.error({ err }, 'Error cancelling ticket');
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  /**
   * Fetch all registered events for the logged-in participant with scan history.
   * GET /api/v1/tickets/my-registrations
   */
  static async myRegistrations(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const username = req.user.username;

      const registrations = await prisma.registration.findMany({
        where: {
          OR: [
            { userId: username },
            {
              ledRegistrationTeams: {
                some: {
                  members: { some: { username } },
                },
              },
            },
          ],
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              time: true,
              location: true,
              slug: true,
              contactEmail: true,
              contactPhone: true,
            },
          },
          ticketType: {
            select: { id: true, name: true, price: true, currency: true },
          },
          ticketTypesJoinTable: {
            include: {
              ticketType: { select: { id: true, name: true, price: true, currency: true } }
            }
          },
          ledRegistrationTeams: {
            select: { teamName: true },
          },
          activityScans: {
            include: {
              activity: { select: { name: true } },
            },
            orderBy: { scannedAt: 'desc' },
          },
        },
        orderBy: { registeredAt: 'desc' },
      });

      const enriched = registrations.map((r: any) => {
        const ticketsList: any[] = [];
        if (r.ticketType) ticketsList.push(r.ticketType);
        if (r.ticketTypesJoinTable) {
          r.ticketTypesJoinTable.forEach((jt: any) => {
            if (jt.ticketType && !ticketsList.some((t: any) => t.id === jt.ticketType.id)) {
              ticketsList.push(jt.ticketType);
            }
          });
        }

        return {
          id: Number(r.id),
          event_id: r.eventId,
          email: r.email,
          status: r.status,
          payment_status: r.paymentStatus,
          qr_token: r.qrToken,
          registered_at: r.registeredAt,
          event_title: r.event.title,
          event_date: r.event.date,
          event_time: r.event.time,
          event_location: r.event.location,
          event_slug: r.event.slug,
          contact_email: r.event.contactEmail,
          contact_phone: r.event.contactPhone,
          ticket_name: ticketsList[0]?.name || r.ticketType?.name || null,
          tickets: ticketsList,
          team_name: r.ledRegistrationTeams[0]?.teamName || null,
          is_leader: r.userId === username,
          scanHistory: r.activityScans.map((s: any) => ({
            activityName: s.activity.name,
            scannedAt: s.scannedAt,
          })),
        };
      });

      return res.status(200).json(enriched);
    } catch (err: any) {
      logger.error({ err }, 'Error fetching participant registrations');
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
