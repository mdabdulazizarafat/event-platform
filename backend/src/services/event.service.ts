import { pool } from '../db/pool';

export interface CreateEventInput {
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  hostUsername: string;
}

export class EventService {
  /**
   * Creates a new event and dynamically provisions its PostgreSQL partition table
   * before registration opens.
   */
  static async createEvent(input: CreateEventInput) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert Core Event Details
      const insertQuery = `
        INSERT INTO events (slug, title, date, time, location, capacity, host_username)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
      `;
      const res = await client.query(insertQuery, [
        input.slug,
        input.title,
        input.date,
        input.time,
        input.location,
        input.capacity,
        input.hostUsername,
      ]);
      const eventId = res.rows[0].id;

      // 2. Allocate the PostgreSQL List Partition table dynamically.
      // Name formatting: p_reg_[eventId]
      const partitionQuery = `
        CREATE TABLE IF NOT EXISTS p_reg_${eventId} 
        PARTITION OF registrations 
        FOR VALUES IN (${eventId});
      `;
      await client.query(partitionQuery);

      await client.query('COMMIT');
      return eventId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getEvents() {
    const res = await pool.query('SELECT * FROM events ORDER BY created_at DESC');
    return res.rows;
  }

  static async getEventBySlug(slug: string) {
    const res = await pool.query('SELECT * FROM events WHERE slug = $1', [slug]);
    return res.rows[0] || null;
  }
}
