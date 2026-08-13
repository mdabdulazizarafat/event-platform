import { pool } from '../db/pool';

export interface CreateActivityInput {
  eventId: number;
  name: string;
  scanLimit?: number | null;
  sortOrder?: number;
}

export interface UpdateActivityInput {
  name?: string;
  scanLimit?: number | null;
  isActive?: boolean;
  sortOrder?: number;
}

export class EventActivityService {
  /**
   * Create a new scan operation/activity for an event.
   */
  static async createActivity(input: CreateActivityInput) {
    const query = `
      INSERT INTO event_activities (event_id, name, scan_limit, sort_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const res = await pool.query(query, [
      input.eventId,
      input.name,
      input.scanLimit === undefined ? 1 : input.scanLimit,
      input.sortOrder || 0
    ]);
    return res.rows[0];
  }

  /**
   * Get all active activities for an event, ordered by sort_order.
   */
  static async getActivities(eventId: number) {
    const query = `
      SELECT * FROM event_activities
      WHERE event_id = $1 AND is_active = true
      ORDER BY sort_order ASC, created_at ASC;
    `;
    const res = await pool.query(query, [eventId]);
    return res.rows;
  }

  /**
   * Get all activities (including inactive ones) for host management.
   */
  static async getAllActivities(eventId: number) {
    const query = `
      SELECT * FROM event_activities
      WHERE event_id = $1
      ORDER BY sort_order ASC, created_at ASC;
    `;
    const res = await pool.query(query, [eventId]);
    return res.rows;
  }

  /**
   * Get a single activity by ID.
   */
  static async getActivityById(id: number) {
    const res = await pool.query('SELECT * FROM event_activities WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  /**
   * Update an activity.
   */
  static async updateActivity(id: number, input: UpdateActivityInput) {
    const fieldToColumnMap: Record<string, string> = {
      name: 'name',
      scanLimit: 'scan_limit',
      isActive: 'is_active',
      sortOrder: 'sort_order',
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
      return await this.getActivityById(id);
    }

    values.push(id);
    const query = `
      UPDATE event_activities
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING *;
    `;
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  /**
   * Deactivate an activity.
   */
  static async deactivateActivity(id: number) {
    const query = `
      UPDATE event_activities
      SET is_active = false
      WHERE id = $1
      RETURNING *;
    `;
    const res = await pool.query(query, [id]);
    return res.rows[0];
  }
}
