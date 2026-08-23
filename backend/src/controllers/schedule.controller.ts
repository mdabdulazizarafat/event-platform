import { Request, Response } from 'express';
import { pool } from '../db/pool';
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

      const result = await pool.query(`
        INSERT INTO schedules (event_slug, title, date, start_time, end_time, room, speaker, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'CONFIRMED')
        RETURNING *
      `, [slug, title, date, start_time, end_time, room, speaker]);

      return res.status(201).json(result.rows[0]);
    } catch (error: any) {
      logger.error({ err: error }, 'Error creating schedule');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const result = await pool.query(`
        SELECT * FROM schedules WHERE event_slug = $1 ORDER BY date ASC, start_time ASC
      `, [slug]);

      return res.status(200).json(result.rows);
    } catch (error: any) {
      logger.error({ err: error }, 'Error fetching schedules');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { slug, id } = req.params;
      
      await pool.query('DELETE FROM schedules WHERE id = $1 AND event_slug = $2', [id, slug]);
      
      return res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error: any) {
      logger.error({ err: error }, 'Error deleting schedule');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
