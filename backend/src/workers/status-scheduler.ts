import prisma from '../lib/prisma';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('status-scheduler');

/**
 * Optimized set-based status transition scheduler.
 * Performs set-based SQL queries instead of row-by-row iteration.
 */
export async function checkAndUpdateEventStatuses() {
  try {
    const nowIso = new Date().toISOString();

    // 1. Transition to ENDED: end_date < now
    const endedRes = await prisma.event.updateMany({
      where: {
        status: { notIn: ['DRAFT', 'ARCHIVED', 'ENDED'] },
        endDate: { not: null, lt: nowIso },
      },
      data: { status: 'ENDED' },
    });
    if (endedRes.count > 0) {
      logger.info(`Status Scheduler: Transitioned ${endedRes.count} event(s) to ENDED`);
    }

    // 2. Transition to LIVE: start_date <= now AND (end_date is null OR end_date >= now)
    const liveRes = await prisma.event.updateMany({
      where: {
        status: { notIn: ['DRAFT', 'ARCHIVED', 'ENDED', 'LIVE'] },
        startDate: { not: null, lte: nowIso },
        OR: [{ endDate: null }, { endDate: { gte: nowIso } }],
      },
      data: { status: 'LIVE' },
    });
    if (liveRes.count > 0) {
      logger.info(`Status Scheduler: Transitioned ${liveRes.count} event(s) to LIVE`);
    }

    // 3. Transition to REGISTRATION_CLOSED: registration_deadline < now AND (start_date is null OR start_date > now)
    const closedRes = await prisma.event.updateMany({
      where: {
        status: { in: ['PUBLISHED'] },
        registrationDeadline: { not: null, lt: nowIso },
        OR: [{ startDate: null }, { startDate: { gt: nowIso } }],
      },
      data: { status: 'REGISTRATION_CLOSED' },
    });
    if (closedRes.count > 0) {
      logger.info(`Status Scheduler: Transitioned ${closedRes.count} event(s) to REGISTRATION_CLOSED`);
    }
  } catch (error) {
    logger.error({ err: error }, 'Error in checkAndUpdateEventStatuses scheduler');
  }
}

export function startStatusScheduler(intervalMs = 30000) {
  logger.info(`Starting Event Status Scheduler (running every ${intervalMs / 1000}s)...`);

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
