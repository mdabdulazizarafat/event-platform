import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('rbac.middleware');

/**
 * Restrict route to specific platform-level global roles.
 * Super Admin always bypasses/satisfies any global role check.
 */
export function requireGlobalRole(allowedRoles: ('SUPER_ADMIN' | 'ADMIN' | 'ORGANIZER' | 'USER')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;

    if (userRole === 'SUPER_ADMIN') {
      return next();
    }

    if (allowedRoles.includes(userRole as any)) {
      return next();
    }

    return res.status(403).json({ error: 'Forbidden: You do not have the required platform role.' });
  };
}

/**
 * Restrict route to specific event-level roles (ORGANIZER, MANAGER, SCANNER).
 */
export function requireEventRole(allowedRoles: ('ORGANIZER' | 'MANAGER' | 'SCANNER')[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { username, role: globalRole } = req.user;

    const slug = req.params.slug || req.params.eventSlug || req.body.slug || req.body.eventSlug || (req.query.slug as string) || (req.query.eventSlug as string);
    const eventIdParam = req.params.eventId || req.params.id || req.body.eventId || (req.query.eventId as string);

    let eventId: number | null = null;
    let organizerUsername: string | null = null;

    try {
      if (eventIdParam && !isNaN(parseInt(eventIdParam, 10))) {
        eventId = parseInt(eventIdParam, 10);
        const eventRes = await prisma.event.findUnique({
          where: { id: eventId },
          select: { id: true, organizerUsername: true },
        });
        if (eventRes) {
          organizerUsername = eventRes.organizerUsername;
        }
      }
      
      if (!eventId && slug) {
        const eventRes = await prisma.event.findUnique({
          where: { slug },
          select: { id: true, organizerUsername: true },
        });
        if (eventRes) {
          eventId = eventRes.id;
          organizerUsername = eventRes.organizerUsername;
        }
      }

      if (!eventId) {
        return res.status(404).json({ error: 'Event context not found for authorization check.' });
      }

      req.resolvedEventId = eventId;

      if (globalRole === 'SUPER_ADMIN' || globalRole === 'ADMIN') {
        return next();
      }

      const teamMember = await prisma.eventTeam.findUnique({
        where: { eventId_username: { eventId, username } },
        select: { role: true },
      });

      let userRole: 'ORGANIZER' | 'MANAGER' | 'SCANNER' | null = null;

      if (teamMember) {
        userRole = teamMember.role as 'ORGANIZER' | 'MANAGER' | 'SCANNER';
      } else if (organizerUsername === username) {
        userRole = 'ORGANIZER';
      }

      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Forbidden: You do not have permissions to manage this event.' });
      }

      return next();
    } catch (error: any) {
      logger.error({ err: error }, 'Event role verification error');
      return res.status(500).json({ error: 'Internal server error during authorization.' });
    }
  };
}
