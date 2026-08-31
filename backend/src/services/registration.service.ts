import { pool } from '../db/pool';
import { Queue } from 'bullmq';
import { createChildLogger } from '../lib/logger';
import { generateSecureQrToken } from '../lib/crypto';

const logger = createChildLogger('registration.service');

// BullMQ Sidecar Worker Offloading Queues
// Lazy initialization to ensure dotenv has loaded before reading env vars
let _emailQueue: Queue | null = null;

function getRedisConnection(): any {
  if (process.env.REDIS_URL) {
    const url = new URL(process.env.REDIS_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password,
      username: url.username,
      tls: url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
    };
  }
  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  };
}

export function getEmailQueue(): Queue {
  if (!_emailQueue) {
    _emailQueue = new Queue('email-notifications', {
      connection: getRedisConnection(),
    });
    _emailQueue.on('error', (err) => {
      logger.warn({ err }, 'Redis connection warning (emailQueue)');
    });
  }
  return _emailQueue;
}



export class RegistrationService {
  /**
   * Atomic concurrent registration query checking capacity dynamically
   * in the insert statement to prevent race conditions during ticket drop spikes.
   * 
   * Now supports ticket types with per-ticket-type capacity enforcement.
   * For free tickets only — paid tickets go through PaymentService.
   */
  static async validateTeamAndRegistration(
    client: any,
    eventId: number,
    ticketTypeId: number,
    userId: string,
    teamName?: string,
    teamMembers?: string[]
  ) {
    // 1. Validate if user is already registered for this segment
    const hasReg = await client.query(
      "SELECT 1 FROM registrations WHERE ticket_type_id = $1 AND user_id = $2 AND status != 'CANCELLED'",
      [ticketTypeId, userId]
    );
    if (hasReg.rowCount > 0) {
      throw new Error(`User ${userId} is already registered for this category.`);
    }

    // 2. Validate if user is already in a team for this segment
    const hasTeam = await client.query(
      `SELECT 1 FROM registration_team_members rtm 
       JOIN registration_teams rt ON rtm.team_id = rt.id 
       WHERE rt.ticket_type_id = $1 AND rtm.username = $2`,
      [ticketTypeId, userId]
    );
    if (hasTeam.rowCount > 0) {
      throw new Error(`User ${userId} is already a member of a team for this category.`);
    }

    // 3. If it's a team ticket, validate team properties
    const ttRes = await client.query(
      'SELECT * FROM ticket_types WHERE id = $1 AND event_id = $2 AND is_active = true',
      [ticketTypeId, eventId]
    );
    if (ttRes.rowCount === 0) {
      throw new Error('Invalid or inactive ticket type.');
    }
    const ticketType = ttRes.rows[0];

    if (ticketType.is_team) {
      if (!teamName || !teamName.trim()) {
        throw new Error('Team name is required for team registration.');
      }
      
      const members = teamMembers || [];
      // Total size = leader (1) + members
      const totalSize = 1 + members.length;
      if (ticketType.max_team_size && totalSize > ticketType.max_team_size) {
        throw new Error(`Team size exceeds the maximum allowed size of ${ticketType.max_team_size}.`);
      }

      // Check each member
      for (const memberEmail of members) {
        const trimmed = memberEmail.trim();
        if (!trimmed) continue;

        // Verify member exists in users table by email
        const userRes = await client.query('SELECT username FROM users WHERE email = $1', [trimmed]);
        if (userRes.rowCount === 0) {
          throw new Error(`User with email "${trimmed}" does not exist on Ayojok.`);
        }
        const memberUsername = userRes.rows[0].username;

        if (memberUsername.toLowerCase() === userId.toLowerCase()) {
          throw new Error('You cannot add yourself as an additional team member.');
        }

        // Verify member is not registered for this segment
        const memberReg = await client.query(
          "SELECT 1 FROM registrations WHERE ticket_type_id = $1 AND user_id = $2 AND status != 'CANCELLED'",
          [ticketTypeId, memberUsername]
        );
        if (memberReg.rowCount > 0) {
          throw new Error(`Team member with email ${trimmed} is already registered for this category.`);
        }

        // Verify member is not already in a team for this segment
        const memberTeam = await client.query(
          `SELECT 1 FROM registration_team_members rtm 
           JOIN registration_teams rt ON rtm.team_id = rt.id 
           WHERE rt.ticket_type_id = $1 AND rtm.username = $2`,
          [ticketTypeId, memberUsername]
        );
        if (memberTeam.rowCount > 0) {
          throw new Error(`Team member with email ${trimmed} is already a member of another team for this category.`);
        }
      }
    }
  }

  static async saveTeamAndMembers(
    client: any,
    eventId: number,
    ticketTypeId: number,
    registrationId: number | string,
    teamName: string,
    teamMembers?: string[]
  ) {
    // Insert team
    const teamInsert = await client.query(
      `INSERT INTO registration_teams (event_id, ticket_type_id, leader_registration_id, team_name)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [eventId, ticketTypeId, registrationId, teamName.trim()]
    );
    const teamId = teamInsert.rows[0].id;

    // Insert members
    const members = teamMembers || [];
    for (const memberEmail of members) {
      const trimmed = memberEmail.trim();
      if (!trimmed) continue;
      const userRes = await client.query('SELECT username FROM users WHERE email = $1', [trimmed]);
      const memberUsername = userRes.rows[0].username;
      await client.query(
        `INSERT INTO registration_team_members (team_id, username)
         VALUES ($1, $2)`,
        [teamId, memberUsername]
      );
    }
  }

  /**
   * Atomic concurrent registration query checking capacity dynamically
   * in the insert statement to prevent race conditions during ticket drop spikes.
   * 
   * Now supports ticket types with per-ticket-type capacity enforcement.
   * For free tickets only — paid tickets go through PaymentService.
   */
  static async registerForEvent(
    eventId: number, 
    userId: string, 
    email: string, 
    ticketTypeIds: number[] = [],
    details?: {
      fullName?: string;
      phone?: string;
      jobTitle?: string;
      organization?: string;
      tshirtSize?: string;
      reference?: string;
      transactionId?: string;
      teamName?: string;
      teamMembers?: string[];
    }
  ) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If ticket types are specified, validate all of them
      if (ticketTypeIds.length > 0) {
        for (const ticketTypeId of ticketTypeIds) {
          // Validate team and registration
          await this.validateTeamAndRegistration(
            client,
            eventId,
            ticketTypeId,
            userId,
            details?.teamName,
            details?.teamMembers
          );

        const ttRes = await client.query(
          'SELECT * FROM ticket_types WHERE id = $1 AND event_id = $2 AND is_active = true',
          [ticketTypeId, eventId]
        );
        const ticketType = ttRes.rows[0];

        // Reject paid tickets from this flow
        if (parseFloat(ticketType.price) > 0) {
          throw new Error('Paid tickets must be registered through the payment flow.');
        }

        // Check per-ticket-type capacity
        if (ticketType.capacity) {
          const countRes = await client.query(
            "SELECT COUNT(*) FROM registrations WHERE ticket_type_id = $1 AND event_id = $2 AND status != 'CANCELLED'",
            [ticketTypeId, eventId]
          );
          const soldCount = parseInt(countRes.rows[0].count);
          if (soldCount >= ticketType.capacity) {
            throw new Error('This ticket type is sold out.');
          }
        }
        }
      }

      const primaryTicketTypeId = ticketTypeIds.length > 0 ? ticketTypeIds[0] : null;

      // Check if user is already registered for this event
      const existingRegRes = await client.query(
        "SELECT id, qr_token FROM registrations WHERE event_id = $1 AND user_id = $2 AND status != 'CANCELLED'",
        [eventId, userId]
      );

      let registrationId;
      let qrToken;

      if ((existingRegRes.rowCount ?? 0) > 0) {
        // Retain existing QR token so the QR code stays identical for all segments of this event
        registrationId = existingRegRes.rows[0].id;
        qrToken = existingRegRes.rows[0].qr_token || generateSecureQrToken();
        
        await client.query(
          `UPDATE registrations SET 
             full_name = COALESCE($1, full_name),
             phone = COALESCE($2, phone),
             job_title = COALESCE($3, job_title),
             organization = COALESCE($4, organization),
             tshirt_size = COALESCE($5, tshirt_size),
             reference = COALESCE($6, reference),
             transaction_id = COALESCE($7, transaction_id)
           WHERE id = $8`,
          [
            details?.fullName || null,
            details?.phone || null,
            details?.jobTitle || null,
            details?.organization || null,
            details?.tshirtSize || null,
            details?.reference || null,
            details?.transactionId || null,
            registrationId
          ]
        );
      } else {
        // Generate secure random QR token for new registration
        qrToken = generateSecureQrToken();

        // Atomic insert checking current count against global event capacity
        const registerQuery = `
          INSERT INTO registrations (
            event_id, ticket_type_id, user_id, email, status, payment_status,
            full_name, phone, job_title, organization, tshirt_size, reference, transaction_id, qr_token
          )
          SELECT $1, $2, $3, $4, 'CONFIRMED', 'NOT_REQUIRED', $5, $6, $7, $8, $9, $10, $11, $12
          WHERE (
            SELECT COUNT(*) FROM registrations WHERE event_id = $1 AND status != 'CANCELLED'
          ) < (
            SELECT capacity FROM events WHERE id = $1
          )
          RETURNING id;
        `;
        
        const res = await client.query(registerQuery, [
          eventId, 
          primaryTicketTypeId, 
          userId, 
          email,
          details?.fullName || null,
          details?.phone || null,
          details?.jobTitle || null,
          details?.organization || null,
          details?.tshirtSize || null,
          details?.reference || null,
          details?.transactionId || null,
          qrToken
        ]);

        if (res.rowCount === 0) {
          throw new Error('Registration failed: Event is at capacity or does not exist.');
        }

        registrationId = res.rows[0].id;
      }

      // Save to join table, ignoring duplicates
      for (const tId of ticketTypeIds) {
        await client.query(
          'INSERT INTO registration_ticket_types (registration_id, ticket_type_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [registrationId, tId]
        );
      }

      // Save team and team members if applicable (associating with the first team ticket type)
      if (ticketTypeIds.length > 0 && details?.teamName) {
        await this.saveTeamAndMembers(
          client,
          eventId,
          ticketTypeIds[0],
          registrationId,
          details.teamName,
          details.teamMembers
        );
      }

      await client.query('COMMIT');

      // Offload heavy non-blocking operations via BullMQ (handled gracefully if Redis is offline)
      try {
        await getEmailQueue().add(
          'sendConfirmationEmail', 
          { email, eventId, registrationId, qrToken },
          { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
        );

      } catch (queueError: any) {
        logger.warn({ err: queueError }, 'Failed to queue email confirmation job (Redis offline)');
      }

      return { registrationId, qrToken };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getRegistrationsByEvent(
    eventId: number,
    options?: { page?: number; limit?: number; search?: string; status?: string } | number,
    limitParam?: number
  ) {
    let page = 1;
    let limit = 10;
    let search: string | undefined;
    let statusFilter: string | undefined;

    if (typeof options === 'object' && options !== null) {
      page = options.page || 1;
      limit = options.limit || 10;
      search = options.search;
      statusFilter = options.status;
    } else if (typeof options === 'number') {
      page = options;
      limit = limitParam || 10;
    }

    const pageNum = Math.max(1, page);
    const limitNum = Math.min(100, Math.max(1, limit));
    const offset = (pageNum - 1) * limitNum;

    const values: any[] = [eventId];
    const whereConditions: string[] = ['r.event_id = $1'];

    if (statusFilter) {
      values.push(statusFilter);
      whereConditions.push(`r.status = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      const sIdx = values.length;
      whereConditions.push(`(r.full_name ILIKE $${sIdx} OR r.email ILIKE $${sIdx} OR r.phone ILIKE $${sIdx} OR r.user_id ILIKE $${sIdx} OR r.job_title ILIKE $${sIdx})`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const countQuery = `SELECT COUNT(*) as total FROM registrations r ${whereClause}`;
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0]?.total || '0');

    const dataQuery = `
      SELECT r.*, tt.name as ticket_type_name, tt.price as ticket_price
      FROM registrations r
      LEFT JOIN ticket_types tt ON r.ticket_type_id = tt.id
      ${whereClause}
      ORDER BY r.registered_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    values.push(limitNum, offset);

    const res = await pool.query(dataQuery, values);
    return {
      data: res.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }
}
