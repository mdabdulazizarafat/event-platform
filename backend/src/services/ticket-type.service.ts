import { pool } from '../db/pool';

export interface CreateTicketTypeInput {
  eventId: number;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  capacity?: number;
  sortOrder?: number;
  saleStart?: string;
  saleEnd?: string;
}

export interface UpdateTicketTypeInput {
  name?: string;
  description?: string;
  price?: number;
  capacity?: number;
  sortOrder?: number;
  isActive?: boolean;
  saleStart?: string;
  saleEnd?: string;
}

export class TicketTypeService {
  /**
   * Create a new ticket type for an event.
   */
  static async createTicketType(input: CreateTicketTypeInput) {
    const query = `
      INSERT INTO ticket_types (event_id, name, description, price, currency, capacity, sort_order, sale_start, sale_end)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const res = await pool.query(query, [
      input.eventId,
      input.name,
      input.description || null,
      input.price,
      input.currency || 'BDT',
      input.capacity || null,
      input.sortOrder || 0,
      input.saleStart || null,
      input.saleEnd || null,
    ]);
    return res.rows[0];
  }

  /**
   * Get all active ticket types for an event, ordered by sort_order.
   */
  static async getTicketTypesByEvent(eventId: number) {
    const query = `
      SELECT tt.*, 
        COALESCE(
          (SELECT COUNT(*) FROM registrations r WHERE r.event_id = tt.event_id AND r.ticket_type_id = tt.id AND r.status != 'CANCELLED'),
          0
        )::INTEGER AS sold_count
      FROM ticket_types tt
      WHERE tt.event_id = $1 AND tt.is_active = true
      ORDER BY tt.sort_order ASC, tt.created_at ASC;
    `;
    const res = await pool.query(query, [eventId]);
    return res.rows;
  }

  /**
   * Get all ticket types (including inactive) for host management.
   */
  static async getAllTicketTypesByEvent(eventId: number) {
    const query = `
      SELECT tt.*,
        COALESCE(
          (SELECT COUNT(*) FROM registrations r WHERE r.event_id = tt.event_id AND r.ticket_type_id = tt.id AND r.status != 'CANCELLED'),
          0
        )::INTEGER AS sold_count
      FROM ticket_types tt
      WHERE tt.event_id = $1
      ORDER BY tt.sort_order ASC, tt.created_at ASC;
    `;
    const res = await pool.query(query, [eventId]);
    return res.rows;
  }

  /**
   * Get a single ticket type by ID.
   */
  static async getTicketTypeById(id: number) {
    const res = await pool.query('SELECT * FROM ticket_types WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  /**
   * Update a ticket type.
   */
  static async updateTicketType(id: number, input: UpdateTicketTypeInput) {
    const fieldToColumnMap: Record<string, string> = {
      name: 'name',
      description: 'description',
      price: 'price',
      capacity: 'capacity',
      sortOrder: 'sort_order',
      isActive: 'is_active',
      saleStart: 'sale_start',
      saleEnd: 'sale_end',
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
      return await this.getTicketTypeById(id);
    }

    values.push(id);
    const query = `
      UPDATE ticket_types
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length}
      RETURNING *;
    `;
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  /**
   * Soft-delete a ticket type by setting is_active to false.
   */
  static async deactivateTicketType(id: number) {
    const query = `
      UPDATE ticket_types
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const res = await pool.query(query, [id]);
    return res.rows[0];
  }

  /**
   * Check if a ticket type has available capacity.
   */
  static async checkAvailability(ticketTypeId: number): Promise<{ available: boolean; remaining: number | null }> {
    const ticketType = await this.getTicketTypeById(ticketTypeId);
    if (!ticketType) {
      return { available: false, remaining: 0 };
    }

    if (!ticketType.capacity) {
      // No per-ticket-type limit
      return { available: true, remaining: null };
    }

    const countRes = await pool.query(
      "SELECT COUNT(*) FROM registrations WHERE ticket_type_id = $1 AND event_id = $2 AND status != 'CANCELLED'",
      [ticketTypeId, ticketType.event_id]
    );
    const soldCount = parseInt(countRes.rows[0].count);
    const remaining = ticketType.capacity - soldCount;

    return { available: remaining > 0, remaining };
  }
}
