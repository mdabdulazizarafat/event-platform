import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { EventService } from '../services/event.service';
import { pool } from '../db/pool';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('admin.controller');

export class AdminController {
  /**
   * List all platform users.
   * GET /api/v1/admin/users
   */
  static async listUsers(req: Request, res: Response) {
    try {
      const users = await AdminService.listUsers();
      return res.status(200).json(users);
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
      const adminUsername = req.user!.username;
      const newUser = await AdminService.createUser(req.body, adminUsername);
      return res.status(201).json({
        message: `Successfully created user "${newUser.username}".`,
        user: newUser
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
        user: updatedUser
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
      const events = await AdminService.listEvents();
      return res.status(200).json(events);
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
      const eventId = parseInt(req.params.id);
      if (!eventId) {
        return res.status(400).json({ error: 'Valid Event ID is required.' });
      }

      const adminUsername = req.user!.username;
      const deletedEvent = await AdminService.deleteEvent(eventId, adminUsername);

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
      const logs = await AdminService.getAdminLogs();
      return res.status(200).json(logs);
    } catch (error: any) {
      logger.error({ err: error }, 'Admin log list error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * List pending organizer applications.
   * GET /api/v1/admin/organizer-applications
   */
  static async listOrganizerApplications(req: Request, res: Response) {
    try {
      const apps = await AdminService.listPendingOrganizers();
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
        message: `Approved organizer application for "${username}".`,
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
        message: `Rejected organizer application for "${username}". Reverted to PARTICIPANT.`,
        user
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin reject organizer error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Get permissions for an admin user.
   * GET /api/v1/admin/permissions/:username
   */
  static async listAdminPermissions(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const permissions = await AdminService.getAdminPermissions(username);
      return res.status(200).json(permissions);
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
      const { username } = req.params;
      const { permission } = req.body;
      if (!permission) {
        return res.status(400).json({ error: 'Permission is required.' });
      }
      const grantedBy = req.user!.username;
      const result = await AdminService.grantAdminPermission(username, permission, grantedBy);
      return res.status(201).json({
        message: `Granted permission "${permission}" to user "${username}".`,
        permission: result
      });
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
      const { username, permission } = req.params;
      const revokedBy = req.user!.username;
      const result = await AdminService.revokeAdminPermission(username, permission, revokedBy);
      return res.status(200).json({
        message: `Revoked permission "${permission}" from user "${username}".`,
        result
      });
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
      const eventId = parseInt(req.params.id);
      if (!eventId) {
        return res.status(400).json({ error: 'Valid Event ID is required.' });
      }

      const adminUsername = req.user!.username;
      const updatedEvent = await AdminService.updateEvent(eventId, adminUsername, req.body);

      return res.status(200).json({
        message: 'Event updated successfully.',
        event: updatedEvent
      });
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

      const team = await AdminService.listEventTeam(eventId);
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
      const teamMember = await AdminService.addEventTeamMember(eventId, username, role, adminUsername);

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
      const removed = await AdminService.removeEventTeamMember(eventId, username, adminUsername);

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
      const { slug, title, description, thumbnail, date, time, location, capacity, contactEmail, contactPhone, hostUsername, status } = req.body;
      
      if (!slug || !title || !date || !time || !location || !capacity || !hostUsername) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if host user exists
      const hostCheck = await pool.query('SELECT username FROM users WHERE username = $1', [hostUsername]);
      if (hostCheck.rowCount === 0) {
        return res.status(400).json({ error: `Organizer "${hostUsername}" does not exist.` });
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

      await AdminService.logAction(adminUsername, 'CREATE_EVENT', 'EVENT', slug, req.body);

      return res.status(201).json({ message: 'Event created successfully by admin', eventId });
    } catch (error: any) {
      logger.error({ err: error }, 'Admin create event error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}

