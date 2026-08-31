import { Request, Response, NextFunction } from 'express';
import { pool } from '../db/pool';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('rbac.middleware');

/**
 * Middleware to restrict route to specific platform-level global roles.
 * Super Admin always bypasses/satisfies any global role check.
 */
export function requireGlobalRole(allowedRoles: ('SUPER_ADMIN' | 'ADMIN' | 'ORGANIZER' | 'USER')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;

    if (userRole === 'SUPER_ADMIN') {
      return next(); // Super admin bypasses all global role checks
    }

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ error: 'Forbidden: You do not have the required platform role.' });
  };
}

/**
 * Middleware to restrict route to specific event-level roles (ORGANIZER, MANAGER).
 * Super Admin and Platform Admin roles bypass this check.
 * Fallbacks to checking event.organizer_username for backward compatibility.
 */
export function requireEventRole(allowedRoles: ('ORGANIZER' | 'MANAGER' | 'SCANNER')[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { username, role: globalRole } = req.user;

    // Try to resolve event ID or slug from params/body
    const slug = req.params.slug || req.body.eventSlug || req.query.eventSlug as string;
    const eventIdParam = req.params.eventId || req.body.eventId || req.query.eventId as string;

    let eventId: number | null = null;
    let organizerUsername: string | null = null;

    try {
      if (eventIdParam) {
        eventId = parseInt(eventIdParam);
        const eventRes = await pool.query('SELECT organizer_username FROM events WHERE id = $1', [eventId]);
        if (eventRes.rows.length > 0) {
          organizerUsername = eventRes.rows[0].organizer_username;
        }
      } else if (slug) {
        const eventRes = await pool.query('SELECT id, organizer_username FROM events WHERE slug = $1', [slug]);
        if (eventRes.rows.length > 0) {
          eventId = eventRes.rows[0].id;
          organizerUsername = eventRes.rows[0].organizer_username;
        }
      }

      if (!eventId) {
        return res.status(404).json({ error: 'Event context not found for authorization check.' });
      }

      // Inject resolved eventId into request for route handlers to use
      req.resolvedEventId = eventId;

      // Platform admins bypass local event checks
      if (globalRole === 'SUPER_ADMIN' || globalRole === 'ADMIN') {
        return next();
      }

      // Check event_team table for user's role
      const teamRes = await pool.query(
        'SELECT role FROM event_team WHERE event_id = $1 AND username = $2',
        [eventId, username]
      );

      let userRole: 'ORGANIZER' | 'MANAGER' | 'SCANNER' | null = null;

      if (teamRes.rows.length > 0) {
        userRole = teamRes.rows[0].role as 'ORGANIZER' | 'MANAGER' | 'SCANNER';
      } else if (organizerUsername === username) {
        // Fallback: If not in event_team but is original creator/host, they are ORGANIZER
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
