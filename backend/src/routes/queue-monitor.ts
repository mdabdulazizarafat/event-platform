import { Router, Request, Response } from 'express';
import { getEmailQueue } from '../services/registration.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireGlobalRole } from '../middleware/rbac.middleware';
import logger from '../lib/logger';

const router = Router();

/**
 * GET /api/v1/admin/queues/status
 * Super-Admin endpoint to monitor BullMQ queue metrics and Redis health.
 */
router.get(
  '/status',
  authMiddleware,
  requireGlobalRole(['SUPER_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const emailQueue = getEmailQueue();
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        emailQueue.getWaitingCount(),
        emailQueue.getActiveCount(),
        emailQueue.getCompletedCount(),
        emailQueue.getFailedCount(),
        emailQueue.getDelayedCount(),
      ]);

      const redisClient = await emailQueue.client;
      const redisStatus = redisClient.status || 'unknown';

      logger.info({ waiting, active, completed, failed, delayed, redisStatus }, 'Queue status queried by SUPER_ADMIN');

      return res.status(200).json({
        queueName: emailQueue.name,
        redisStatus,
        metrics: {
          waiting,
          active,
          completed,
          failed,
          delayed,
          total: waiting + active + completed + failed + delayed,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Error retrieving BullMQ queue metrics');
      return res.status(500).json({
        error: 'Failed to query Redis/BullMQ queue status',
        details: error.message,
      });
    }
  }
);

export default router;
