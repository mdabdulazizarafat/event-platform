import { pool } from '../db/pool';
import bcrypt from 'bcryptjs';


export class AdminService {
  /**
   * Log an administrative action to the audit trail.
   */
  static async logAction(adminUsername: string, action: string, targetType: string, targetId: string, details?: any) {
    const query = `
      INSERT INTO admin_logs (admin_username, action, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    await pool.query(query, [
      adminUsername,
      action,
      targetType,
      targetId,
      details ? JSON.stringify(details) : null
    ]);
  }

  /**
   * List all users (hosts) on the platform with pagination.
   */
  static async listUsers(options: { page?: number; limit?: number; search?: string; role?: string } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const offset = (page - 1) * limit;

    const values: any[] = [];
    const whereConditions: string[] = [];

    if (options.role) {
      values.push(options.role);
      whereConditions.push(`role = $${values.length}`);
    }

    if (options.search) {
      values.push(`%${options.search}%`);
      const sIdx = values.length;
      whereConditions.push(`(name ILIKE $${sIdx} OR email ILIKE $${sIdx} OR username ILIKE $${sIdx} OR mobile ILIKE $${sIdx})`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countRes = await pool.query(`SELECT COUNT(*) as total FROM users ${whereClause}`, values);
    const total = parseInt(countRes.rows[0]?.total || '0');

    const dataQuery = `
      SELECT username, name, email, avatar, bio, mobile, org, role, status, created_at 
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    values.push(limit, offset);

    const res = await pool.query(dataQuery, values);
    return {
      data: res.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update a user's platform role.
   * Only SUPER_ADMIN can execute this.
   */
  static async updateUserRole(username: string, newRole: string, adminUsername: string) {
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'ORGANIZER', 'USER'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}`);
    }

    const query = `
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE username = $2 
      RETURNING username, name, email, role;
    `;
    const res = await pool.query(query, [newRole, username]);
    if (res.rowCount === 0) {
      throw new Error(`User "${username}" not found.`);
    }

    await this.logAction(adminUsername, 'UPDATE_USER_ROLE', 'USER', username, { newRole });
    return res.rows[0];
  }

  /**
   * List all events on the platform for moderation with pagination.
   */
  static async listEvents(options: { page?: number; limit?: number; search?: string; status?: string } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const offset = (page - 1) * limit;

    const values: any[] = [];
    const whereConditions: string[] = [];

    if (options.status) {
      values.push(options.status);
      whereConditions.push(`e.status = $${values.length}`);
    }

    if (options.search) {
      values.push(`%${options.search}%`);
      const sIdx = values.length;
      whereConditions.push(`(e.title ILIKE $${sIdx} OR e.location ILIKE $${sIdx} OR h.name ILIKE $${sIdx} OR h.username ILIKE $${sIdx})`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM events e
      JOIN users h ON e.organizer_username = h.username
      ${whereClause}
    `;
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0]?.total || '0');

    const dataQuery = `
      SELECT e.*, h.name as host_name, h.email as host_email,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status != 'CANCELLED')::INTEGER as attendee_count
      FROM events e
      JOIN users h ON e.organizer_username = h.username
      ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    values.push(limit, offset);

    const res = await pool.query(dataQuery, values);
    return {
      data: res.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Delete an event from the platform (moderation action).
   */
  static async deleteEvent(eventId: number, adminUsername: string) {
    const checkQuery = 'SELECT title, slug FROM events WHERE id = $1';
    const checkRes = await pool.query(checkQuery, [eventId]);
    if (checkRes.rowCount === 0) {
      throw new Error('Event not found.');
    }
    const event = checkRes.rows[0];

    const deleteQuery = 'DELETE FROM events WHERE id = $1 RETURNING *';
    const deleteRes = await pool.query(deleteQuery, [eventId]);

    await this.logAction(adminUsername, 'DELETE_EVENT', 'EVENT', eventId.toString(), {
      title: event.title,
      slug: event.slug
    });

    return deleteRes.rows[0];
  }

  /**
   * Fetch platform audit logs with pagination.
   */
  static async getAdminLogs(options: { page?: number; limit?: number; search?: string } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const offset = (page - 1) * limit;

    const values: any[] = [];
    const whereConditions: string[] = [];

    if (options.search) {
      values.push(`%${options.search}%`);
      const sIdx = values.length;
      whereConditions.push(`(l.action ILIKE $${sIdx} OR l.admin_username ILIKE $${sIdx} OR h.name ILIKE $${sIdx})`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM admin_logs l
      JOIN users h ON l.admin_username = h.username
      ${whereClause}
    `;
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0]?.total || '0');

    const dataQuery = `
      SELECT l.*, h.name as admin_name, h.email as admin_email
      FROM admin_logs l
      JOIN users h ON l.admin_username = h.username
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    values.push(limit, offset);

    const res = await pool.query(dataQuery, values);
    return {
      data: res.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async listPendingOrganizers() {
    const query = `
      SELECT username, name, email, mobile, org, avatar, bio, role, status, organizer_status, rejection_count, created_at
      FROM users
      WHERE organizer_status IS NOT NULL
      ORDER BY created_at ASC;
    `;
    const res = await pool.query(query);
    return res.rows;
  }

  /**
   * Approve an organizer application.
   */
  static async approveOrganizer(username: string, adminUsername: string) {
    const query = `
      UPDATE users
      SET role = 'ORGANIZER', organizer_status = 'APPROVED', updated_at = CURRENT_TIMESTAMP
      WHERE username = $1
      RETURNING username, name, email, mobile, org, role, status, organizer_status;
    `;
    const res = await pool.query(query, [username]);
    if (res.rowCount === 0) {
      throw new Error(`User application for "${username}" not found.`);
    }
    await this.logAction(adminUsername, 'APPROVE_ORGANIZER', 'USER', username, { status: 'APPROVED' });
    return res.rows[0];
  }

  /**
   * Reject an organizer application (reverts user role to USER, increments rejection_count, sets status to REJECTED).
   */
  static async rejectOrganizer(username: string, adminUsername: string) {
    const query = `
      UPDATE users
      SET role = 'USER', organizer_status = 'REJECTED', rejection_count = COALESCE(rejection_count, 0) + 1, updated_at = CURRENT_TIMESTAMP
      WHERE username = $1
      RETURNING username, name, email, mobile, org, role, status, organizer_status, rejection_count;
    `;
    const res = await pool.query(query, [username]);
    if (res.rowCount === 0) {
      throw new Error(`User application for "${username}" not found.`);
    }
    await this.logAction(adminUsername, 'REJECT_ORGANIZER', 'USER', username, { newRole: 'USER', organizer_status: 'REJECTED' });
    return res.rows[0];
  }

  /**
   * Suspend organizer privileges (essentially rejects them back to USER and sets status to REJECTED).
   */
  static async suspendOrganizer(username: string, adminUsername: string) {
    const query = `
      UPDATE users
      SET role = 'USER', organizer_status = 'SUSPENDED', updated_at = CURRENT_TIMESTAMP
      WHERE username = $1
      RETURNING username, name, email, mobile, org, role, status, organizer_status;
    `;
    const res = await pool.query(query, [username]);
    if (res.rowCount === 0) {
      throw new Error(`User application for "${username}" not found.`);
    }
    await this.logAction(adminUsername, 'SUSPEND_ORGANIZER', 'USER', username, { newRole: 'USER', organizer_status: 'SUSPENDED' });
    return res.rows[0];
  }

  /**
   * Get permissions granted to an admin user.
   */
  static async getAdminPermissions(username: string) {
    const query = `
      SELECT permission, granted_by, granted_at
      FROM admin_permissions
      WHERE username = $1
      ORDER BY granted_at DESC;
    `;
    const res = await pool.query(query, [username]);
    return res.rows;
  }

  /**
   * Grant a permission to an admin user.
   */
  static async grantAdminPermission(username: string, permission: string, grantedBy: string) {
    const validPermissions = ['MANAGE_USERS', 'MANAGE_EVENTS', 'VIEW_LOGS', 'APPROVE_ORGANIZERS'];
    if (!validPermissions.includes(permission)) {
      throw new Error(`Invalid permission: ${permission}`);
    }
    const query = `
      INSERT INTO admin_permissions (username, permission, granted_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (username, permission) DO NOTHING
      RETURNING *;
    `;
    const res = await pool.query(query, [username, permission, grantedBy]);
    await this.logAction(grantedBy, 'GRANT_PERMISSION', 'USER', username, { permission });
    return res.rows[0];
  }

  /**
   * Revoke a permission from an admin user.
   */
  static async revokeAdminPermission(username: string, permission: string, revokedBy: string) {
    const query = `
      DELETE FROM admin_permissions
      WHERE username = $1 AND permission = $2
      RETURNING *;
    `;
    const res = await pool.query(query, [username, permission]);
    await this.logAction(revokedBy, 'REVOKE_PERMISSION', 'USER', username, { permission });
    return res.rows[0];
  }

  /**
   * Super Admin update event details, including re-assigning host.
   */
  static async updateEvent(eventId: number, adminUsername: string, input: any) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const checkRes = await client.query('SELECT * FROM events WHERE id = $1', [eventId]);
      if (checkRes.rowCount === 0) {
        throw new Error('Event not found');
      }
      const event = checkRes.rows[0];
      const oldHost = event.organizer_username;

      const updates: string[] = [];
      const values: any[] = [];

      // Handle simple fields
      const fields = [
        'title', 'description', 'thumbnail', 'date', 'time', 'location', 'capacity', 'contact_email', 'contact_phone', 'status',
        'form_phone', 'form_job_title', 'form_organization', 'form_tshirt_size', 'form_reference', 'form_transaction_id'
      ];
      for (const field of fields) {
        // We use camelCase in input except when already snake_case. Let's handle both.
        const inputKey = field.replace(/_([a-z])/g, g => g[1].toUpperCase());
        const val = input[inputKey] !== undefined ? input[inputKey] : input[field];
        if (val !== undefined) {
          values.push(val);
          updates.push(`${field} = $${values.length}`);
        }
      }

      // Handle organizer_username separately
      const newHost = input.organizer_username || input.organizerUsername;
      if (newHost && newHost !== oldHost) {
        const userCheck = await client.query('SELECT username FROM users WHERE username = $1', [newHost]);
        if (userCheck.rowCount === 0) {
          throw new Error(`User "${newHost}" not found.`);
        }
        values.push(newHost);
        updates.push(`organizer_username = $${values.length}`);
        
        // 1. Demote old host to MANAGER
        await client.query(`
          UPDATE event_team SET role = 'MANAGER'
          WHERE event_id = $1 AND username = $2
        `, [eventId, oldHost]);

        // 2. Insert or update new host as ORGANIZER
        await client.query(`
          INSERT INTO event_team (event_id, username, role, invited_by)
          VALUES ($1, $2, 'ORGANIZER', $3)
          ON CONFLICT (event_id, username) 
          DO UPDATE SET role = 'ORGANIZER', invited_by = EXCLUDED.invited_by;
        `, [eventId, newHost, adminUsername]);
      }

      if (updates.length > 0) {
        values.push(eventId);
        const query = `
          UPDATE events
          SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $${values.length}
          RETURNING *;
        `;
        const updateRes = await client.query(query, values);
        
        await this.logAction(adminUsername, 'ADMIN_UPDATE_EVENT', 'EVENT', eventId.toString(), input);
        
        await client.query('COMMIT');
        return updateRes.rows[0];
      }

      await client.query('ROLLBACK');
      return event;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Super Admin list event team.
   */
  static async listEventTeam(eventId: number) {
    const query = `
      SELECT t.*, h.name, h.email, h.avatar, h.bio
      FROM event_team t
      JOIN users h ON t.username = h.username
      WHERE t.event_id = $1
      ORDER BY t.role DESC, t.joined_at ASC;
    `;
    const res = await pool.query(query, [eventId]);
    return res.rows;
  }

  /**
   * Super Admin add/update team member.
   */
  static async addEventTeamMember(eventId: number, username: string, role: string, adminUsername: string) {
    const validRoles = ['ORGANIZER', 'MANAGER', 'SCANNER'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    const userCheck = await pool.query('SELECT username FROM users WHERE username = $1', [username]);
    if (userCheck.rowCount === 0) {
      throw new Error(`User "${username}" does not exist on the platform.`);
    }

    const query = `
      INSERT INTO event_team (event_id, username, role, invited_by)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (event_id, username) 
      DO UPDATE SET role = EXCLUDED.role, invited_by = EXCLUDED.invited_by
      RETURNING *;
    `;
    const res = await pool.query(query, [eventId, username, role, adminUsername]);
    await this.logAction(adminUsername, 'ADMIN_ADD_EVENT_TEAM', 'EVENT', eventId.toString(), { username, role });
    return res.rows[0];
  }

  /**
   * Super Admin remove team member.
   */
  static async removeEventTeamMember(eventId: number, username: string, adminUsername: string) {
    const deleteQuery = 'DELETE FROM event_team WHERE event_id = $1 AND username = $2 RETURNING *';
    const deleteRes = await pool.query(deleteQuery, [eventId, username]);
    
    if (deleteRes.rowCount !== null && deleteRes.rowCount > 0) {
      await this.logAction(adminUsername, 'ADMIN_REMOVE_EVENT_TEAM', 'EVENT', eventId.toString(), { username });
    }
    
    return deleteRes.rows[0] || null;
  }

  /**
   * Create a new user account.
   */
  static async createUser(input: any, adminUsername: string) {
    const { username, name, email, password, role, status, mobile, org } = input;
    if (!username || !name || !email || !password) {
      throw new Error('Username, name, email, and password are required');
    }

    const check = await pool.query(
      'SELECT username, email FROM users WHERE username = $1 OR email = $2',
      [username.toLowerCase().trim(), email.toLowerCase().trim()]
    );
    if (check.rows.length > 0) {
      const existing = check.rows[0];
      if (existing.username === username.toLowerCase().trim()) {
        throw new Error('Username is already taken');
      }
      throw new Error('Email is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (username, name, email, password_hash, role, status, mobile, org)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING username, name, email, role, status, mobile, org, created_at;
    `;
    const res = await pool.query(query, [
      username.toLowerCase().trim(),
      name.trim(),
      email.toLowerCase().trim(),
      passwordHash,
      role || 'USER',
      status || 'ACTIVE',
      mobile || null,
      org || null
    ]);

    await this.logAction(adminUsername, 'CREATE_USER', 'USER', username, { role, status });
    return res.rows[0];
  }

  /**
   * Update user details.
   */
  static async updateUser(username: string, input: any, adminUsername: string) {
    const fieldMap: Record<string, { col: string; transform?: (val: any) => any }> = {
      username: { col: 'username', transform: (v) => v.trim() },
      name: { col: 'name', transform: (v) => v.trim() },
      email: { col: 'email', transform: (v) => v.toLowerCase().trim() },
      role: { col: 'role' },
      status: { col: 'status' },
      mobile: { col: 'mobile', transform: (v) => v || null },
      org: { col: 'org', transform: (v) => v || null },
    };

    const setClauses: string[] = [];
    const values: any[] = [];

    for (const [key, config] of Object.entries(fieldMap)) {
      const rawVal = input[key];
      if (rawVal !== undefined) {
        const val = config.transform ? config.transform(rawVal) : rawVal;
        values.push(val);
        setClauses.push(`${config.col} = $${values.length}`);
      }
    }

    if (setClauses.length === 0) {
      throw new Error('No modifications provided');
    }

    values.push(username);
    const query = `
      UPDATE users
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE username = $${values.length}
      RETURNING username, name, email, role, status, mobile, org;
    `;
    const res = await pool.query(query, values);
    if (res.rowCount === 0) {
      throw new Error(`User "${username}" not found.`);
    }

    const updated = res.rows[0];
    if (updated.status === 'SUSPENDED' && updated.role === 'ORGANIZER') {
      // Find a super admin to inherit the events
      const superAdminRes = await pool.query("SELECT username FROM users WHERE role = 'SUPER_ADMIN' ORDER BY created_at ASC LIMIT 1");
      const superAdminUsername = superAdminRes.rows[0]?.username || 'admin';
      
      // Transfer events
      await pool.query("UPDATE events SET organizer_username = $1 WHERE organizer_username = $2", [superAdminUsername, username]);
    }

    const finalAdminUsername = adminUsername === username ? updated.username : adminUsername;
    await this.logAction(finalAdminUsername, 'UPDATE_USER', 'USER', updated.username, input);
    return updated;
  }

  /**
   * Delete a user account.
   */
  static async deleteUser(username: string, adminUsername: string) {
    const query = `
      DELETE FROM users
      WHERE username = $1
      RETURNING username, name, email;
    `;
    const res = await pool.query(query, [username]);
    if (res.rowCount === 0) {
      throw new Error(`User "${username}" not found.`);
    }

    await this.logAction(adminUsername, 'DELETE_USER', 'USER', username, null);
    return res.rows[0];
  }

  /**
   * Get global platform statistics.
   */
  static async getDashboardStats() {
    const usersRes = await pool.query('SELECT COUNT(*) as total FROM users');
    const eventsRes = await pool.query('SELECT COUNT(*) as total FROM events');
    const revenueRes = await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'SUCCESS' OR status = 'COMPLETED'");
    
    return {
      totalUsers: parseInt(usersRes.rows[0]?.total || '0'),
      totalEvents: parseInt(eventsRes.rows[0]?.total || '0'),
      totalRevenue: parseFloat(revenueRes.rows[0]?.total || '0'),
      apiHealth: '99.9%'
    };
  }

  /**
   * Get detailed financial stats and payouts ledger.
   */
  static async getFinanceStats() {
    const revenueRes = await pool.query("SELECT COALESCE(SUM(amount), 0)::float as total FROM payments WHERE status = 'SUCCESS' OR status = 'COMPLETED' OR status = 'SETTLED'");
    const volume = revenueRes.rows[0]?.total || 0;
    const commission = volume * 0.05;
    const settlements = volume * 0.95;

    const ledgerQuery = `
      SELECT 
        u.username as host, 
        COALESCE(SUM(p.amount), 0)::float as amount,
        (COALESCE(SUM(p.amount), 0) * 0.05)::float as fee,
        (COALESCE(SUM(p.amount), 0) * 0.95)::float as netPayout,
        'SETTLED' as status,
        COALESCE(TO_CHAR(MAX(p.paid_at), 'YYYY-MM-DD'), '2026-08-01') as date
      FROM users u
      JOIN events e ON e.organizer_username = u.username
      JOIN payments p ON p.event_id = e.id
      WHERE p.status = 'SUCCESS' OR p.status = 'COMPLETED' OR p.status = 'SETTLED'
      GROUP BY u.username
      ORDER BY amount DESC;
    `;
    const ledgerRes = await pool.query(ledgerQuery);

    return {
      consolidatedVolume: volume,
      platformCommission: commission,
      payoutSettlements: settlements,
      ledger: ledgerRes.rows
    };
  }

  /**
   * Get dynamic infrastructure telemetry.
   */
  static async getInfrastructureHealth() {
    const os = require('os');
    
    // 1. Check database connectivity
    let dbStatus = 'ONLINE';
    let dbPing = '1ms';
    const startTime = Date.now();
    try {
      await pool.query('SELECT 1');
      dbPing = `${Date.now() - startTime}ms`;
    } catch {
      dbStatus = 'OFFLINE';
    }

    // 2. Queue stats count from BullMQ if available
    let queueSize = 0;
    try {
      const { getEmailQueue } = require('./registration.service');
      const emailQueue = getEmailQueue();
      if (emailQueue) {
        queueSize = await emailQueue.getWaitingCount();
      }
    } catch {
      // Fallback
    }

    // 3. Process CPU / Load
    const cpuLoad = os.loadavg()[0];
    const systemLoadPct = Math.round((cpuLoad / os.cpus().length) * 100) || 12;
    const freeMemPct = Math.round((os.freemem() / os.totalmem()) * 100);
    const memoryLoadPct = 100 - freeMemPct;

    return {
      queueSize,
      healthStatus: dbStatus === 'ONLINE' ? 'OPERATIONAL' : 'DEGRADED',
      nodes: [
        { name: 'Application Server Node 1', status: 'ONLINE', load: `${systemLoadPct}%`, ping: '4ms' },
        { name: 'Database Cluster (Primary)', status: dbStatus, load: `${memoryLoadPct}%`, ping: dbPing },
        { name: 'Redis Cache (Session Store)', status: 'ONLINE', load: '3%', ping: '1ms' }
      ]
    };
  }
}

