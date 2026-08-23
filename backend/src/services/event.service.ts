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
  formPhone?: boolean;
  formJobTitle?: boolean;
  formOrganization?: boolean;
  formTshirtSize?: boolean;
  formReference?: boolean;
  formTransactionId?: boolean;
  isPrivate?: boolean;
  eventFor?: string;
  studentCategory?: string;
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
        INSERT INTO events (
          slug, title, description, thumbnail, date, time, start_date, end_date, 
          registration_deadline, location, capacity, contact_email, contact_phone, 
          host_username, status, form_phone, form_job_title, form_organization, 
          form_tshirt_size, form_reference, form_transaction_id, is_private, event_for, student_category
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
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
        input.formPhone !== undefined ? input.formPhone : true,
        input.formJobTitle !== undefined ? input.formJobTitle : true,
        input.formOrganization !== undefined ? input.formOrganization : true,
        input.formTshirtSize !== undefined ? input.formTshirtSize : false,
        input.formReference !== undefined ? input.formReference : false,
        input.formTransactionId !== undefined ? input.formTransactionId : false,
        input.isPrivate !== undefined ? input.isPrivate : false,
        input.eventFor || 'BOTH',
        input.studentCategory || null,
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

      // 4. Automatically create default Check-in, Food, Gift, and Certificate activities
      const defaultActivities = ['Check-in', 'Food', 'Gift', 'Certificate'];
      for (let i = 0; i < defaultActivities.length; i++) {
        const defaultActivityQuery = `
          INSERT INTO event_activities (event_id, name, scan_limit, sort_order)
          VALUES ($1, $2, 1, $3);
        `;
        await client.query(defaultActivityQuery, [eventId, defaultActivities[i], i]);
      }

      await client.query('COMMIT');
      return eventId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateEvent(slug: string, hostUsername: string, input: { 
    title?: string; 
    description?: string; 
    thumbnail?: string; 
    date?: string; 
    time?: string; 
    location?: string; 
    capacity?: number; 
    contactEmail?: string; 
    contactPhone?: string; 
    status?: string; 
    startDate?: string; 
    endDate?: string; 
    registrationDeadline?: string;
    formPhone?: boolean;
    formJobTitle?: boolean;
    formOrganization?: boolean;
    formTshirtSize?: boolean;
    formReference?: boolean;
    formTransactionId?: boolean;
    isPrivate?: boolean;
    eventFor?: string;
    studentCategory?: string;
  }, userRole?: string) {
    const client = await pool.connect();
    try {
      const checkRes = await client.query('SELECT * FROM events WHERE slug = $1', [slug]);
      if (checkRes.rowCount === 0) {
        throw new Error('Event not found');
      }
      const event = checkRes.rows[0];

      // Enforce Edit Lock on Ended Events for non-admins
      const computed = this.computeEventStatus(event);
      if (computed.status === 'ENDED') {
        if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
          throw new Error('This event has ended and is read-only. Only platform admins can edit ended events.');
        }
      }

      if (event.host_username !== hostUsername && userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
        throw new Error('Unauthorized: Only the event host can modify this event.');
      }

      const fieldToColumnMap: Record<string, string> = {
        title: 'title',
        date: 'date',
        time: 'time',
        location: 'location',
        capacity: 'capacity',
        contactEmail: 'contact_email',
        contactPhone: 'contact_phone',
        description: 'description',
        thumbnail: 'thumbnail',
        status: 'status',
        startDate: 'start_date',
        endDate: 'end_date',
        registrationDeadline: 'registration_deadline',
        formPhone: 'form_phone',
        formJobTitle: 'form_job_title',
        formOrganization: 'form_organization',
        formTshirtSize: 'form_tshirt_size',
        formReference: 'form_reference',
        formTransactionId: 'form_transaction_id',
        isPrivate: 'is_private',
        eventFor: 'event_for',
        studentCategory: 'student_category',
      };

      const updates: string[] = [];
      const values: any[] = [];

      for (const [key, columnName] of Object.entries(fieldToColumnMap)) {
        const val = (input as Record<string, any>)[key];
        if (val !== undefined) {
          values.push(val);
          updates.push(`${columnName} = $${values.length}`);
        }
      }

      if (updates.length === 0) {
        return event;
      }

      values.push(slug);
      const query = `
        UPDATE events
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE slug = $${values.length}
        RETURNING *;
      `;
      const updateRes = await client.query(query, values);
      return updateRes.rows[0];
    } finally {
      client.release();
    }
  }

  static computeEventStatus(event: any) {
    if (event.status === 'PUBLISHED' || event.status === 'REGISTRATION_CLOSED' || event.status === 'LIVE' || event.status === 'ENDED') {
      const now = new Date();
      if (event.end_date && new Date(event.end_date) < now) {
        return { ...event, status: 'ENDED' };
      }
      if (event.start_date && new Date(event.start_date) <= now) {
        return { ...event, status: 'LIVE' };
      }
      if (event.registration_deadline && new Date(event.registration_deadline) < now) {
        return { ...event, status: 'REGISTRATION_CLOSED' };
      }
      // If deadline has not passed but status was REGISTRATION_CLOSED, restore to PUBLISHED
      if (event.status === 'REGISTRATION_CLOSED') {
        return { ...event, status: 'PUBLISHED' };
      }
    }
    return event;
  }

  static async getEvents(
    usernameOrOptions?: string | { username?: string; role?: string; page?: number; limit?: number; search?: string; status?: string },
    roleParam?: string,
    pageParam?: number,
    limitParam?: number
  ) {
    let username: string | undefined;
    let role: string | undefined;
    let page: number | undefined;
    let limit: number | undefined;
    let search: string | undefined;
    let statusFilter: string | undefined;

    if (typeof usernameOrOptions === 'object' && usernameOrOptions !== null) {
      username = usernameOrOptions.username;
      role = usernameOrOptions.role;
      page = usernameOrOptions.page;
      limit = usernameOrOptions.limit;
      search = usernameOrOptions.search;
      statusFilter = usernameOrOptions.status;
    } else {
      username = usernameOrOptions;
      role = roleParam;
      page = pageParam;
      limit = limitParam;
    }

    const isPaginated = page !== undefined || limit !== undefined;
    const pageNum = Math.max(1, page || 1);
    const limitNum = Math.min(100, Math.max(1, limit || 10));
    const offset = (pageNum - 1) * limitNum;

    const values: any[] = [];
    const whereConditions: string[] = [];

    if (username) {
      values.push(username);
      const uIdx = values.length;
      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        whereConditions.push(`((e.status != 'DRAFT' AND e.is_private = false) OR e.host_username = $${uIdx} OR et.username = $${uIdx} OR r.user_id = $${uIdx})`);
      }
    } else {
      whereConditions.push(`(e.status != 'DRAFT' AND e.is_private = false)`);
    }

    if (statusFilter) {
      values.push(statusFilter);
      whereConditions.push(`e.status = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      const sIdx = values.length;
      whereConditions.push(`(e.title ILIKE $${sIdx} OR e.location ILIKE $${sIdx} OR e.description ILIKE $${sIdx})`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count query
    const countQuery = `
      SELECT COUNT(DISTINCT e.id) as total
      FROM events e
      LEFT JOIN event_team et ON e.id = et.event_id
      LEFT JOIN registrations r ON e.id = r.event_id
      ${whereClause}
    `;
    const countRes = await pool.query(countQuery, whereConditions.length > 0 ? values : []);
    const total = parseInt(countRes.rows[0]?.total || '0');

    // Select query
    let selectQuery = '';
    if (username) {
      selectQuery = `
        SELECT DISTINCT e.*,
          (e.host_username = $1) as is_host,
          EXISTS (
            SELECT 1 FROM event_team et 
            WHERE et.event_id = e.id AND et.username = $1
          ) as is_team_member,
          EXISTS (
            SELECT 1 FROM registrations r 
            WHERE r.event_id = e.id AND r.user_id = $1
          ) as is_registered,
          (
            SELECT role FROM event_team et 
            WHERE et.event_id = e.id AND et.username = $1
            LIMIT 1
          ) as team_role
        FROM events e
        LEFT JOIN event_team et ON e.id = et.event_id
        LEFT JOIN registrations r ON e.id = r.event_id
        ${whereClause}
        ORDER BY e.created_at DESC
      `;
      if (isPaginated) {
        selectQuery += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        values.push(limitNum, offset);
      }
    } else {
      selectQuery = `
        SELECT e.*, 
          false as is_host,
          false as is_team_member,
          false as is_registered,
          null as team_role
        FROM events e
        ${whereClause}
        ORDER BY e.created_at DESC
      `;
      if (isPaginated) {
        selectQuery += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        values.push(limitNum, offset);
      }
    }

    const res = await pool.query(selectQuery, values);
    const items = res.rows.map(this.computeEventStatus);
    const totalPages = Math.ceil(total / limitNum);

    return {
      data: items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    };
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
      
      const regQuery = await pool.query('SELECT 1 FROM registrations WHERE event_id = $1 AND user_id = $2', [event.id, username]);
      event.is_registered = (regQuery.rowCount !== null && regQuery.rowCount > 0);
    } else {
      event.is_host = false;
      event.is_team_member = false;
      event.team_role = null;
      event.is_registered = false;
    }

    return this.computeEventStatus(event);
  }

}
