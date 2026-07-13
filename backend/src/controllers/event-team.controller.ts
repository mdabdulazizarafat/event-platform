import { Request, Response } from 'express';
import { EventTeamService } from '../services/event-team.service';

export class EventTeamController {
  /**
   * Invite a user to join the event team as a manager.
   * POST /api/v1/events/:slug/team
   */
  static async invite(req: Request, res: Response) {
    try {
      const eventId = req.resolvedEventId;
      if (!eventId) {
        return res.status(400).json({ error: 'Resolved Event ID required' });
      }

      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: 'Username is required to invite a team member.' });
      }

      const invitedBy = req.user!.username;
      const teamMember = await EventTeamService.inviteManager(eventId, username, invitedBy);

      return res.status(201).json({
        message: `Successfully invited ${username} as a manager.`,
        teamMember
      });
    } catch (error: any) {
      console.error('Error inviting team member:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * List all team members of the event.
   * GET /api/v1/events/:slug/team
   */
  static async list(req: Request, res: Response) {
    try {
      const eventId = req.resolvedEventId;
      if (!eventId) {
        return res.status(400).json({ error: 'Resolved Event ID required' });
      }

      const team = await EventTeamService.getTeam(eventId);
      return res.status(200).json(team);
    } catch (error: any) {
      console.error('Error listing team members:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Remove a member from the event team.
   * DELETE /api/v1/events/:slug/team/:username
   */
  static async remove(req: Request, res: Response) {
    try {
      const eventId = req.resolvedEventId;
      if (!eventId) {
        return res.status(400).json({ error: 'Resolved Event ID required' });
      }

      const { username } = req.params;
      if (!username) {
        return res.status(400).json({ error: 'Username parameter is required.' });
      }

      const removed = await EventTeamService.removeMember(eventId, username);

      return res.status(200).json({
        message: `Successfully removed ${username} from the event team.`,
        removed
      });
    } catch (error: any) {
      console.error('Error removing team member:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
