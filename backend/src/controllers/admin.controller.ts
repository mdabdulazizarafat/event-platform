import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { EventService } from '../services/event.service';
import { EventTeamService } from '../services/event-team.service';
import prisma from '../lib/prisma';
import { createChildLogger } from '../lib/logger';
import jwt from 'jsonwebtoken';
import { getPrivateKey } from '../services/crypto.service';

const logger = createChildLogger('admin.controller');

export class AdminController {
  /**
   * List all platform users.
   * GET /api/v1/admin/users
   */
  static async listUsers(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string;
      const role = req.query.role as string;
      const result = await AdminService.listUsers({ page, limit, search, role });
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error({ err: error }, 'Admin user list error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Create a new user account.
   * POST /api/v1/admin/users
   */
  static async createUser(req: Request, res: Response) {
    try {
      const { username, name, email, password, role } = req.body;
      if (!username || !name || !email || !password) {
        return res.status(400).json({ error: 'Username, name, email, and password are required' });
      }

      const adminUsername = req.user!.username;
      const newUser = await AdminService.createAdmin({ username, name, email, password, role }, adminUsername);
      return res.status(201).json({
        message: `Successfully created admin user "${username}".`,
        user: newUser,
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin user create error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Update user details.
   * PUT /api/v1/admin/users/:username
   */
  static async updateUser(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const adminUsername = req.user!.username;
      const updatedUser = await AdminService.updateUser(username, req.body, adminUsername);
      return res.status(200).json({
        message: `Successfully updated user "${username}".`,
        user: updatedUser,
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin user update error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Delete a user account.
   * DELETE /api/v1/admin/users/:username
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const adminUsername = req.user!.username;
      const deletedUser = await AdminService.deleteUser(username, adminUsername);
      return res.status(200).json({
        message: `Successfully deleted user "${username}".`,
        user: deletedUser
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin user delete error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }


  /**
   * Update a user's role on the platform.
   * PUT /api/v1/admin/users/:username/role
   */
  static async updateUserRole(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const { role } = req.body;

      if (!username || !role) {
        return res.status(400).json({ error: 'Missing username or role.' });
      }

      const adminUsername = req.user!.username;
      const updatedUser = await AdminService.updateUserRole(username, role, adminUsername);

      return res.status(200).json({
        message: `Updated user "${username}" role to ${role}.`,
        user: updatedUser
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin update user role error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * List all events across the platform for moderation.
   * GET /api/v1/admin/events
   */
  static async listEvents(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const result = await AdminService.listEvents({ page, limit, search, status });
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error({ err: error }, 'Admin event list error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Delete/Moderate an event from the platform.
   * DELETE /api/v1/admin/events/:id
   */
  static async deleteEvent(req: Request, res: Response) {
    try {
      const identifier = req.params.id; // Accepts numeric ID or slug
      if (!identifier) {
        return res.status(400).json({ error: 'Valid Event ID or Slug is required.' });
      }

      const adminUsername = req.user!.username;
      const deletedEvent = await AdminService.deleteEvent(identifier, adminUsername);

      return res.status(200).json({
        message: 'Event successfully removed from the platform.',
        event: deletedEvent
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin delete event error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Fetch administrative audit logs.
   * GET /api/v1/admin/logs
   */
  static async listLogs(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string;
      const result = await AdminService.getAuditLogs({ page, limit });
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error({ err: error }, 'Admin log list error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Fetch platform stats for dashboard.
   * GET /api/v1/admin/stats
   */
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await AdminService.getDashboardStats();
      return res.status(200).json(stats);
    } catch (error: any) {
      logger.error({ err: error }, 'Admin get dashboard stats error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Fetch finance stats and ledger for dashboard.
   * GET /api/v1/admin/finance/stats
   */
  static async getFinanceStats(req: Request, res: Response) {
    try {
      const stats = await AdminService.getFinanceStats();
      return res.status(200).json(stats);
    } catch (error: any) {
      logger.error({ err: error }, 'Admin get finance stats error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Fetch real system health telemetry.
   * GET /api/v1/admin/infrastructure/health
   */
  static async getInfrastructureHealth(req: Request, res: Response) {
    try {
      const health = await AdminService.getInfrastructureHealth();
      return res.status(200).json(health);
    } catch (error: any) {
      logger.error({ err: error }, 'Admin get infrastructure health error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * List pending organizer applications.
   * GET /api/v1/admin/organizer-applications
   */
  static async listOrganizerApplications(req: Request, res: Response) {
    try {
      const apps = await AdminService.getPendingOrganizers();
      return res.status(200).json(apps);
    } catch (error: any) {
      logger.error({ err: error }, 'Admin list organizer applications error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Approve a pending organizer application.
   * PUT /api/v1/admin/organizer-applications/:username/approve
   */
  static async approveOrganizer(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const adminUsername = req.user!.username;
      const user = await AdminService.approveOrganizer(username, adminUsername);
      return res.status(200).json({
        message: 'you became an organizer in the Somavesh, please follow the  event rules when creat the event.',
        user
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin approve organizer error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Reject a pending organizer application.
   * PUT /api/v1/admin/organizer-applications/:username/reject
   */
  static async rejectOrganizer(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const adminUsername = req.user!.username;
      const user = await AdminService.rejectOrganizer(username, adminUsername);
      return res.status(200).json({
        message: 'Your application was rejected. update your profile and try again.',
        user
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin reject organizer error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Suspend an organizer application or privileges.
   */
  static async suspendOrganizer(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const adminUsername = req.user!.username;
      const user = await AdminService.suspendOrganizer(username, adminUsername);
      return res.status(200).json({
        message: 'you can not apply for organzier anymore',
        user
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin suspend organizer error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Get permissions for an admin user.
   * GET /api/v1/admin/permissions/:username
   */
  static async listAdminPermissions(req: Request, res: Response) {
    try {
      return res.status(501).json({ error: 'Admin permissions not implemented' });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin list permissions error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Grant a permission to an admin user.
   * POST /api/v1/admin/permissions/:username
   */
  static async grantAdminPermission(req: Request, res: Response) {
    try {
      return res.status(501).json({ error: 'Admin permissions not implemented' });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin grant permission error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Revoke a permission from an admin user.
   * DELETE /api/v1/admin/permissions/:username/:permission
   */
  static async revokeAdminPermission(req: Request, res: Response) {
    try {
      return res.status(501).json({ error: 'Admin permissions not implemented' });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin revoke permission error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Update event details as admin.
   * PUT /api/v1/admin/events/:id
   */
  static async updateEvent(req: Request, res: Response) {
    try {
      return res.status(501).json({ error: 'Event update by ID not supported here. Use EventService via standard routes.' });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin update event error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * List event team.
   * GET /api/v1/admin/events/:id/team
   */
  static async listEventTeam(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.id);
      if (!eventId) {
        return res.status(400).json({ error: 'Valid Event ID is required.' });
      }

      const team = await EventTeamService.getTeam(eventId);
      return res.status(200).json(team);
    } catch (error: any) {
      logger.error({ err: error }, 'Admin list event team error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Add or update event team member.
   * POST /api/v1/admin/events/:id/team
   */
  static async addEventTeamMember(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.id);
      if (!eventId) {
        return res.status(400).json({ error: 'Valid Event ID is required.' });
      }

      const { username, role } = req.body;
      if (!username || !role) {
        return res.status(400).json({ error: 'Username and role are required.' });
      }

      const adminUsername = req.user!.username;
      const teamMember = await EventTeamService.inviteManager(eventId, username, adminUsername, role);

      return res.status(201).json({
        message: `Successfully added/updated ${username} as ${role}.`,
        teamMember
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin add event team member error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Remove event team member.
   * DELETE /api/v1/admin/events/:id/team/:username
   */
  static async removeEventTeamMember(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.id);
      if (!eventId) {
        return res.status(400).json({ error: 'Valid Event ID is required.' });
      }

      const { username } = req.params;
      if (!username) {
        return res.status(400).json({ error: 'Username parameter is required.' });
      }

      const adminUsername = req.user!.username;
      const removed = await EventTeamService.removeMember(eventId, username);

      return res.status(200).json({
        message: `Successfully removed ${username} from the event team.`,
        removed
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin remove event team member error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Create event as admin.
   * POST /api/v1/admin/events
   */
  static async createEvent(req: Request, res: Response) {
    try {
      const adminUsername = req.user!.username;
      const { slug, title, description, thumbnail, date, time, location, capacity, contactEmail, contactPhone, organizerUsername, status } = req.body;
      
      if (!slug || !title || !date || !time || !location || !capacity || !organizerUsername) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if host user exists
      const hostUser = await prisma.user.findUnique({ where: { username: organizerUsername }, select: { username: true } });
      if (!hostUser) {
        return res.status(400).json({ error: `Organizer "${organizerUsername}" does not exist.` });
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
        organizerUsername,
        description: description || undefined,
        thumbnail: thumbnail || undefined,
        status: status || 'DRAFT',
      });

      await AdminService.logAction(adminUsername, 'CREATE_EVENT', 'EVENT', slug, req.body);

      return res.status(201).json({ message: 'Event created successfully by admin', eventId });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin create event error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Impersonate a user as a super admin.
   * POST /api/v1/admin/users/:username/impersonate
   */
  static async impersonateUser(req: Request, res: Response) {
    try {
      const { username } = req.params;
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }

      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Sign Stateless JWT via Asymmetric Private Key (RS256)
      const tokenPayload = {
        username: user.username,
        email: user.email,
        role: user.role || 'USER',
        mobile: user.mobile,
        org: user.org,
        status: user.status || 'ACTIVE'
      };
      
      const token = jwt.sign(tokenPayload, getPrivateKey(), {
        algorithm: 'RS256',
        expiresIn: '24h',
      });

      // Set cookie in response jar (HttpOnly, Secure, Lax SameSite)
      res.cookie('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      const adminUsername = req.user!.username;
      await AdminService.logAction(adminUsername, 'IMPERSONATE_USER', 'USER', username, {
        targetEmail: user.email,
        targetRole: user.role
      });

      return res.status(200).json({ message: 'Successfully impersonated user', user: tokenPayload });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin impersonate error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}

