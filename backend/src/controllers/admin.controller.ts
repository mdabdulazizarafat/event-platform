import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
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
}
