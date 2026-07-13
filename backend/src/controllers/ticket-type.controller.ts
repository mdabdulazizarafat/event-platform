import { Request, Response } from 'express';
import { TicketTypeService } from '../services/ticket-type.service';
import { EventService } from '../services/event.service';

export class TicketTypeController {
  /**
   * Create a new ticket type for an event.
   * Host-only, authenticated.
   */
  static async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { slug } = req.params;
      const event = await EventService.getEventBySlug(slug);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.host_username !== req.user.username) {
        return res.status(403).json({ error: 'Unauthorized: Only the event host can manage ticket types.' });
      }

      const { name, description, price, capacity, sortOrder, saleStart, saleEnd } = req.body;
      if (!name || price === undefined) {
        return res.status(400).json({ error: 'Missing required fields: name and price are required.' });
      }

      const ticketType = await TicketTypeService.createTicketType({
        eventId: event.id,
        name,
        description,
        price: parseFloat(price),
        capacity: capacity ? parseInt(capacity) : undefined,
        sortOrder: sortOrder ? parseInt(sortOrder) : undefined,
        saleStart,
        saleEnd,
      });

      return res.status(201).json({ message: 'Ticket type created successfully', ticketType });
    } catch (error: any) {
      console.error('Error creating ticket type:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * List all active ticket types for an event.
   * Public endpoint.
   */
  static async list(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const event = await EventService.getEventBySlug(slug);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const ticketTypes = await TicketTypeService.getTicketTypesByEvent(event.id);

      // Enrich with availability info
      const enriched = ticketTypes.map((tt: any) => {
        const remaining = tt.capacity ? tt.capacity - tt.sold_count : null;
        return {
          ...tt,
          remaining,
          available: remaining === null || remaining > 0,
          isFree: parseFloat(tt.price) === 0,
        };
      });

      return res.status(200).json(enriched);
    } catch (error: any) {
      console.error('Error listing ticket types:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Update a ticket type.
   * Host-only, authenticated.
   */
  static async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { slug, id } = req.params;
      const event = await EventService.getEventBySlug(slug);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.host_username !== req.user.username) {
        return res.status(403).json({ error: 'Unauthorized: Only the event host can manage ticket types.' });
      }

      const ticketType = await TicketTypeService.getTicketTypeById(parseInt(id));
      if (!ticketType || ticketType.event_id !== event.id) {
        return res.status(404).json({ error: 'Ticket type not found for this event.' });
      }

      const { name, description, price, capacity, sortOrder, isActive, saleStart, saleEnd } = req.body;

      const updated = await TicketTypeService.updateTicketType(parseInt(id), {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        capacity: capacity !== undefined ? parseInt(capacity) : undefined,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
        isActive,
        saleStart,
        saleEnd,
      });

      return res.status(200).json({ message: 'Ticket type updated successfully', ticketType: updated });
    } catch (error: any) {
      console.error('Error updating ticket type:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Deactivate (soft-delete) a ticket type.
   * Host-only, authenticated.
   */
  static async deactivate(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { slug, id } = req.params;
      const event = await EventService.getEventBySlug(slug);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.host_username !== req.user.username) {
        return res.status(403).json({ error: 'Unauthorized: Only the event host can manage ticket types.' });
      }

      const ticketType = await TicketTypeService.getTicketTypeById(parseInt(id));
      if (!ticketType || ticketType.event_id !== event.id) {
        return res.status(404).json({ error: 'Ticket type not found for this event.' });
      }

      const deactivated = await TicketTypeService.deactivateTicketType(parseInt(id));
      return res.status(200).json({ message: 'Ticket type deactivated successfully', ticketType: deactivated });
    } catch (error: any) {
      console.error('Error deactivating ticket type:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
