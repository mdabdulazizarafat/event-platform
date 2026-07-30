import { pool } from '../db/pool';

export class EventTeamService {
  /**
   * Invite a user to join an event's team as a MANAGER.
   */
  static async inviteManager(eventId: number, username: string, invitedBy: string) {
    // 1. Verify target user exists in users table
    const userCheck = await pool.query('SELECT username FROM users WHERE username = $1', [username]);
    if (userCheck.rowCount === 0) {
      throw new Error(`User "${username}" does not exist on the platform.`);
    }

    // 2. Prevent inviting yourself or inviting the owner
    const eventRes = await pool.query('SELECT host_username FROM events WHERE id = $1', [eventId]);
    if (eventRes.rows.length > 0 && eventRes.rows[0].host_username === username) {
      throw new Error('The event owner is already the organizer.');
    }

    // 3. Add to event_team as MANAGER
    const query = `
      INSERT INTO event_team (event_id, username, role, invited_by)
      VALUES ($1, $2, 'MANAGER', $3)
      ON CONFLICT (event_id, username) 
      DO UPDATE SET role = 'MANAGER', invited_by = EXCLUDED.invited_by
      RETURNING *;
    `;
    const res = await pool.query(query, [eventId, username, invitedBy]);
    return res.rows[0];
  }

  /**
   * Get all members of an event's team.
   */
  static async getTeam(eventId: number) {
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
   * Remove a member from the event's team.
   * Organizers cannot be removed from the team.
   */
  static async removeMember(eventId: number, username: string) {
    // Ensure we are not deleting the event owner/organizer
    const checkQuery = 'SELECT role FROM event_team WHERE event_id = $1 AND username = $2';
    const checkRes = await pool.query(checkQuery, [eventId, username]);
    if (checkRes.rowCount === 0) {
      throw new Error('Team member not found.');
    }

    const member = checkRes.rows[0];
    if (member.role === 'ORGANIZER') {
      throw new Error('Cannot remove the Event Organizer from the team.');
    }

    const deleteQuery = 'DELETE FROM event_team WHERE event_id = $1 AND username = $2 RETURNING *';
    const deleteRes = await pool.query(deleteQuery, [eventId, username]);
    return deleteRes.rows[0];
  }
}
