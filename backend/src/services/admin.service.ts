import { pool } from '../db/pool';

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
   * List all users (hosts) on the platform.
   */
  static async listUsers() {
    const query = `
      SELECT username, name, email, avatar, bio, role, created_at 
      FROM users 
      ORDER BY created_at DESC;
    `;
    const res = await pool.query(query);
    return res.rows;
  }

  /**
   * Update a user's platform role.
   * Only SUPER_ADMIN can execute this.
   */
  static async updateUserRole(username: string, newRole: string, adminUsername: string) {
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'ORGANIZER', 'PARTICIPANT'];
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
   * List all events on the platform for moderation.
   */
  static async listEvents() {
    const query = `
      SELECT e.*, h.name as host_name, h.email as host_email,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status != 'CANCELLED')::INTEGER as attendee_count
      FROM events e
      JOIN users h ON e.host_username = h.username
      ORDER BY e.created_at DESC;
    `;
    const res = await pool.query(query);
    return res.rows;
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
   * Fetch platform audit logs.
   */
  static async getAdminLogs() {
    const query = `
      SELECT l.*, h.name as admin_name, h.email as admin_email
      FROM admin_logs l
      JOIN users h ON l.admin_username = h.username
      ORDER BY l.created_at DESC
      LIMIT 100;
    `;
    const res = await pool.query(query);
    return res.rows;
  }
}
