import { pool } from '../db/pool';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('status-scheduler');

export async function checkAndUpdateEventStatuses() {
  const client = await pool.connect();
  try {
    // Select events that are not DRAFT or ARCHIVED
    const query = `
      SELECT id, title, slug, status, start_date, end_date, registration_deadline 
      FROM events 
      WHERE status NOT IN ('DRAFT', 'ARCHIVED')
    `;
    const res = await client.query(query);
    const now = new Date();

    for (const event of res.rows) {
      let targetStatus = event.status;

      const startDate = event.start_date ? new Date(event.start_date) : null;
      const endDate = event.end_date ? new Date(event.end_date) : null;
      const regDeadline = event.registration_deadline ? new Date(event.registration_deadline) : null;

      // 1. ENDED: if end_date has passed
      if (endDate && endDate < now) {
        targetStatus = 'ENDED';
      }
      // 2. LIVE: if start_date has arrived but end_date has not passed
      else if (startDate && startDate <= now) {
        targetStatus = 'LIVE';
      }
      // 3. REGISTRATION_CLOSED: if registration_deadline has passed but start_date has not arrived
      else if (regDeadline && regDeadline < now) {
        targetStatus = 'REGISTRATION_CLOSED';
      }
      // 4. Otherwise, it should be PUBLISHED (Live for registration)
      else {
        targetStatus = 'PUBLISHED';
      }

      if (targetStatus !== event.status) {
        logger.info(
          { eventId: event.id, slug: event.slug, oldStatus: event.status, newStatus: targetStatus },
          `Transitioning event status for "${event.title}"`
        );
        await client.query(
          'UPDATE events SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [targetStatus, event.id]
        );
      }
    }
  } catch (error) {
    logger.error({ err: error }, 'Error in checkAndUpdateEventStatuses scheduler');
  } finally {
    client.release();
  }
}

export function startStatusScheduler(intervalMs = 30000) {
  logger.info(`Starting Event Status Scheduler (running every ${intervalMs / 1000}s)...`);
  
  // Run immediately on boot
  checkAndUpdateEventStatuses().catch((err) => {
    logger.error({ err }, 'Initial run of checkAndUpdateEventStatuses failed');
  });

  const intervalId = setInterval(() => {
    checkAndUpdateEventStatuses().catch((err) => {
      logger.error({ err }, 'Background run of checkAndUpdateEventStatuses failed');
    });
  }, intervalMs);

  return intervalId;
}
