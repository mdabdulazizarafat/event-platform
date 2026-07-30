import { Request, Response } from 'express';
import { EventActivityService } from '../services/event-activity.service';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('event-activity.controller');

export class EventActivityController {
  /**
   * Create a new activity for an event.
   * POST /api/v1/events/:slug/activities
   */
  static async create(req: Request, res: Response) {
    try {
      const eventId = req.resolvedEventId;
      if (!eventId) {
        return res.status(400).json({ error: 'Resolved Event ID required' });
      }

      const { name, scanLimit, sortOrder } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Activity name is required.' });
      }

      const activity = await EventActivityService.createActivity({
        eventId,
        name,
        scanLimit: scanLimit !== undefined ? (scanLimit === null ? null : parseInt(scanLimit)) : 1,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0
      });

      return res.status(201).json({
        message: 'Event activity created successfully.',
        activity
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Error creating activity');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * List active activities for an event.
   * GET /api/v1/events/:slug/activities
   */
  static async list(req: Request, res: Response) {
    try {
      const eventId = req.resolvedEventId;
      if (!eventId) {
        return res.status(400).json({ error: 'Resolved Event ID required' });
      }

      const activities = await EventActivityService.getActivities(eventId);
      return res.status(200).json(activities);
    } catch (error: any) {
      logger.error({ err: error }, 'Error listing activities');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * List all activities (including inactive) for event hosts.
   * GET /api/v1/events/:slug/activities/all
   */
  static async listAll(req: Request, res: Response) {
    try {
      const eventId = req.resolvedEventId;
      if (!eventId) {
        return res.status(400).json({ error: 'Resolved Event ID required' });
      }

      const activities = await EventActivityService.getAllActivities(eventId);
      return res.status(200).json(activities);
    } catch (error: any) {
      logger.error({ err: error }, 'Error listing all activities');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Update an activity configuration.
   * PUT /api/v1/events/:slug/activities/:id
   */
  static async update(req: Request, res: Response) {
    try {
      const eventId = req.resolvedEventId;
      const activityId = parseInt(req.params.id);

      if (!eventId || !activityId) {
        return res.status(400).json({ error: 'Missing Event ID or Activity ID' });
      }

      const activity = await EventActivityService.getActivityById(activityId);
      if (!activity || activity.event_id !== eventId) {
        return res.status(404).json({ error: 'Activity not found for this event.' });
      }

      const { name, scanLimit, isActive, sortOrder } = req.body;

      const updated = await EventActivityService.updateActivity(activityId, {
        name,
        scanLimit: scanLimit !== undefined ? (scanLimit === null ? null : parseInt(scanLimit)) : undefined,
        isActive,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined
      });

      return res.status(200).json({
        message: 'Activity updated successfully.',
        activity: updated
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Error updating activity');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Deactivate (soft-delete) an activity.
   * DELETE /api/v1/events/:slug/activities/:id
   */
  static async deactivate(req: Request, res: Response) {
    try {
      const eventId = req.resolvedEventId;
      const activityId = parseInt(req.params.id);

      if (!eventId || !activityId) {
        return res.status(400).json({ error: 'Missing Event ID or Activity ID' });
      }

      const activity = await EventActivityService.getActivityById(activityId);
      if (!activity || activity.event_id !== eventId) {
        return res.status(404).json({ error: 'Activity not found for this event.' });
      }

      const deactivated = await EventActivityService.deactivateActivity(activityId);

      return res.status(200).json({
        message: 'Activity deactivated successfully.',
        activity: deactivated
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Error deactivating activity');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
