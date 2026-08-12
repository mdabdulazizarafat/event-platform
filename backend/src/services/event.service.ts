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
  description?: string;
  thumbnail?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
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
        INSERT INTO events (slug, title, description, thumbnail, date, time, start_date, end_date, registration_deadline, location, capacity, contact_email, contact_phone, host_username, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id;
      `;
      const res = await client.query(insertQuery, [
        input.slug,
        input.title,
        input.description || null,
        input.thumbnail || null,
        input.date,
        input.time,
        input.startDate || null,
        input.endDate || null,
        input.registrationDeadline || null,
        input.location,
        input.capacity,
        input.contactEmail || null,
        input.contactPhone || null,
        input.hostUsername,
        input.status || 'DRAFT',
      ]);
      const eventId = res.rows[0].id;

      // 2. Dynamic partitioning has been removed. Unified normal table architecture active.

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

  static async updateEvent(slug: string, hostUsername: string, input: { title?: string; description?: string; thumbnail?: string; date?: string; time?: string; location?: string; capacity?: number; contactEmail?: string; contactPhone?: string; status?: string; startDate?: string; endDate?: string; registrationDeadline?: string }) {
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
      if (input.description !== undefined) {
        updates.push(`description = $${idx++}`);
        values.push(input.description);
      }
      if (input.thumbnail !== undefined) {
        updates.push(`thumbnail = $${idx++}`);
        values.push(input.thumbnail);
      }
      if (input.status !== undefined) {
        updates.push(`status = $${idx++}`);
        values.push(input.status);
      }
      if (input.startDate !== undefined) {
        updates.push(`start_date = $${idx++}`);
        values.push(input.startDate);
      }
      if (input.endDate !== undefined) {
        updates.push(`end_date = $${idx++}`);
        values.push(input.endDate);
      }
      if (input.registrationDeadline !== undefined) {
        updates.push(`registration_deadline = $${idx++}`);
        values.push(input.registrationDeadline);
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

  static computeEventStatus(event: any) {
    if (event.status === 'PUBLISHED') {
      const now = new Date();
      if (event.end_date && new Date(event.end_date) < now) {
        return { ...event, status: 'ENDED' };
      }
      if (event.start_date && new Date(event.start_date) <= now) {
        return { ...event, status: 'LIVE' };
      }
    }
    return event;
  }

  static async getEvents(username?: string, role?: string) {
    let query = '';
    const values: any[] = [];
    
    if (username) {
      values.push(username);
      query = `
        SELECT DISTINCT e.*,
          (e.host_username = $1) as is_host,
          EXISTS (
            SELECT 1 FROM event_team et 
            WHERE et.event_id = e.id AND et.username = $1
          ) as is_team_member,
          (
            SELECT role FROM event_team et 
            WHERE et.event_id = e.id AND et.username = $1
            LIMIT 1
          ) as team_role
        FROM events e
        LEFT JOIN event_team et ON e.id = et.event_id
      `;
      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        query += ` WHERE e.status != 'DRAFT' OR e.host_username = $1 OR et.username = $1`;
      }
    } else {
      query = `
        SELECT e.*, 
          false as is_host,
          false as is_team_member,
          null as team_role
        FROM events e
        WHERE e.status != 'DRAFT'
      `;
    }
    
    query += ' ORDER BY e.created_at DESC';
    const res = await pool.query(query, values);
    return res.rows.map(this.computeEventStatus);
  }

  static async getEventBySlug(slug: string, username?: string, role?: string) {
    const res = await pool.query('SELECT * FROM events WHERE slug = $1', [slug]);
    const event = res.rows[0] || null;
    if (!event) return null;
    
    if (event.status === 'DRAFT') {
      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && event.host_username !== username) {
        if (username) {
          const teamCheck = await pool.query('SELECT 1 FROM event_team WHERE event_id = $1 AND username = $2', [event.id, username]);
          if (teamCheck.rowCount === 0) {
            return null;
          }
        } else {
          return null;
        }
      }
    }
    
    // Add is_team_member and team_role context if username is available
    if (username) {
      const teamQuery = await pool.query('SELECT role FROM event_team WHERE event_id = $1 AND username = $2', [event.id, username]);
      event.is_host = event.host_username === username;
      event.is_team_member = teamQuery.rowCount !== null && teamQuery.rowCount > 0;
      event.team_role = event.is_team_member ? teamQuery.rows[0].role : null;
    } else {
      event.is_host = false;
      event.is_team_member = false;
      event.team_role = null;
    }

    return this.computeEventStatus(event);
  }

}
