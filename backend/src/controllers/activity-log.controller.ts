import { Request, Response } from 'express';
import { ActivityLogService } from '../services/activity-log.service';

export class ActivityLogController {
  /**
   * Scan a participant's QR code for a specific activity checkpoint.
   * POST /api/v1/events/:slug/scan
   */
  static async scan(req: Request, res: Response) {
    try {
      const eventId = req.resolvedEventId;
      if (!eventId) {
        return res.status(400).json({ error: 'Resolved Event ID required' });
      }

      const { activityId, qrToken } = req.body;
      if (!activityId || !qrToken) {
        return res.status(400).json({ error: 'Missing activityId or qrToken parameter.' });
      }

      const scannedBy = req.user!.username;

      const result = await ActivityLogService.scanQrToken({
        eventId,
        activityId: parseInt(activityId),
        qrToken,
        scannedBy
      });

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Scan error:', error);
      // Return 400 for scanning errors (like already scanned, invalid ticket)
      // to let the frontend show a clear red warning badge.
      return res.status(400).json({ error: error.message || 'Scan validation failed.' });
    }
  }

  /**
   * List recent scan activity logs for dashboard feed.
   * GET /api/v1/events/:slug/scan/logs
   */
  static async listLogs(req: Request, res: Response) {
    try {
      const eventId = req.resolvedEventId;
      if (!eventId) {
        return res.status(400).json({ error: 'Resolved Event ID required' });
      }

      const logs = await ActivityLogService.getLogsForEvent(eventId);
      return res.status(200).json(logs);
    } catch (error: any) {
      console.error('Error fetching scan logs:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Get total scans per activity for progress indicators.
   * GET /api/v1/events/:slug/scan/stats
   */
  static async getStats(req: Request, res: Response) {
    try {
      const eventId = req.resolvedEventId;
      if (!eventId) {
        return res.status(400).json({ error: 'Resolved Event ID required' });
      }

      const stats = await ActivityLogService.getScanStats(eventId);
      return res.status(200).json(stats);
    } catch (error: any) {
      console.error('Error fetching scan statistics:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
