import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('schedule.controller');

export class ScheduleController {
  static async create(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const { title, date, start_time, end_time, room, speaker } = req.body;

      if (!title || !date || !start_time || !end_time) {
        return res.status(400).json({ error: 'Missing required schedule fields' });
      }

      const schedule = await prisma.schedule.create({
        data: {
          eventSlug: slug,
          title,
          date,
          startTime: start_time,
          endTime: end_time,
          room: room || '',
          speaker: speaker || '',
          status: 'CONFIRMED',
        },
      });

      return res.status(201).json({
        ...schedule,
        event_slug: schedule.eventSlug,
        start_time: schedule.startTime,
        end_time: schedule.endTime,
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Error creating schedule');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const schedules = await prisma.schedule.findMany({
        where: { eventSlug: slug },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      });

      const formatted = schedules.map((s: any) => ({
        ...s,
        event_slug: s.eventSlug,
        start_time: s.startTime,
        end_time: s.endTime,
      }));

      return res.status(200).json(formatted);
    } catch (error: any) {
      logger.error({ err: error }, 'Error fetching schedules');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { slug, id } = req.params;
      const scheduleId = parseInt(id, 10);

      await prisma.schedule.deleteMany({
        where: { id: scheduleId, eventSlug: slug },
      });

      return res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error: any) {
      logger.error({ err: error }, 'Error deleting schedule');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
