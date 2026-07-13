import { pool } from '../db/pool';

export interface CreateEventInput {
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  contactEmail?: string;
  contactPhone?: string;
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
      
      // Set transaction-local timeouts to prevent database hangs
      await client.query('SET LOCAL lock_timeout = 2000'); // max 2 seconds waiting for lock
      await client.query('SET LOCAL statement_timeout = 5000'); // max 5 seconds running query

      // 1. Insert Core Event Details
      const insertQuery = `
        INSERT INTO events (slug, title, date, time, location, capacity, contact_email, contact_phone, host_username)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id;
      `;
      const res = await client.query(insertQuery, [
        input.slug,
        input.title,
        input.date,
        input.time,
        input.location,
        input.capacity,
        input.contactEmail || null,
        input.contactPhone || null,
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

      // 3. Automatically add creator to event_team as ORGANIZER
      const teamQuery = `
        INSERT INTO event_team (event_id, username, role)
        VALUES ($1, $2, 'ORGANIZER')
        ON CONFLICT (event_id, username) DO NOTHING;
      `;
      await client.query(teamQuery, [eventId, input.hostUsername]);

      // 4. Automatically create default Check-in activity
      const defaultActivityQuery = `
        INSERT INTO event_activities (event_id, name, scan_limit, sort_order)
        VALUES ($1, 'Check-in', 1, 0);
      `;
      await client.query(defaultActivityQuery, [eventId]);

      await client.query('COMMIT');
      return eventId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateEvent(slug: string, hostUsername: string, input: { title?: string; date?: string; time?: string; location?: string; capacity?: number; contactEmail?: string; contactPhone?: string }) {
    const client = await pool.connect();
    try {
      const checkRes = await client.query('SELECT * FROM events WHERE slug = $1', [slug]);
      if (checkRes.rowCount === 0) {
        throw new Error('Event not found');
      }
      const event = checkRes.rows[0];
      if (event.host_username !== hostUsername) {
        throw new Error('Unauthorized: Only the event host can modify this event.');
      }

      const updates: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (input.title !== undefined) {
        updates.push(`title = $${idx++}`);
        values.push(input.title);
      }
      if (input.date !== undefined) {
        updates.push(`date = $${idx++}`);
        values.push(input.date);
      }
      if (input.time !== undefined) {
        updates.push(`time = $${idx++}`);
        values.push(input.time);
      }
      if (input.location !== undefined) {
        updates.push(`location = $${idx++}`);
        values.push(input.location);
      }
      if (input.capacity !== undefined) {
        updates.push(`capacity = $${idx++}`);
        values.push(input.capacity);
      }
      if (input.contactEmail !== undefined) {
        updates.push(`contact_email = $${idx++}`);
        values.push(input.contactEmail);
      }
      if (input.contactPhone !== undefined) {
        updates.push(`contact_phone = $${idx++}`);
        values.push(input.contactPhone);
      }

      if (updates.length === 0) {
        return event;
      }

      values.push(slug);
      const query = `
        UPDATE events
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE slug = $${idx}
        RETURNING *;
      `;
      const updateRes = await client.query(query, values);
      return updateRes.rows[0];
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
