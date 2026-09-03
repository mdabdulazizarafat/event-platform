import prisma from '../lib/prisma';

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
  isTeam?: boolean;
  maxTeamSize?: number;
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
  isTeam?: boolean;
  maxTeamSize?: number;
}

export class TicketTypeService {
  /**
   * Create a new ticket type for an event.
   */
  static async createTicketType(input: CreateTicketTypeInput) {
    const tt = await prisma.ticketType.create({
      data: {
        eventId: input.eventId,
        name: input.name,
        description: input.description || null,
        price: input.price,
        currency: input.currency || 'BDT',
        capacity: input.capacity || null,
        sortOrder: input.sortOrder || 0,
        saleStart: input.saleStart ? new Date(input.saleStart) : null,
        saleEnd: input.saleEnd ? new Date(input.saleEnd) : null,
        isTeam: input.isTeam !== undefined ? input.isTeam : false,
        maxTeamSize: input.maxTeamSize || 1,
      },
    });

    return {
      ...tt,
      event_id: tt.eventId,
      sort_order: tt.sortOrder,
      is_active: tt.isActive,
      is_team: tt.isTeam,
      max_team_size: tt.maxTeamSize,
      sale_start: tt.saleStart,
      sale_end: tt.saleEnd,
      created_at: tt.createdAt,
      updated_at: tt.updatedAt,
    };
  }

  /**
   * Get all active ticket types for an event with sold count.
   */
  static async getTicketTypesByEvent(eventId: number) {
    const ticketTypes = await prisma.ticketType.findMany({
      where: { eventId, isActive: true },
      include: {
        _count: {
          select: {
            registrations: {
              where: { status: { not: 'CANCELLED' } },
            },
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return ticketTypes.map((tt: any) => ({
      ...tt,
      event_id: tt.eventId,
      sort_order: tt.sortOrder,
      is_active: tt.isActive,
      is_team: tt.isTeam,
      max_team_size: tt.maxTeamSize,
      sale_start: tt.saleStart,
      sale_end: tt.saleEnd,
      created_at: tt.createdAt,
      updated_at: tt.updatedAt,
      sold_count: tt._count.registrations,
    }));
  }

  /**
   * Get all ticket types for host management.
   */
  static async getAllTicketTypesByEvent(eventId: number) {
    const ticketTypes = await prisma.ticketType.findMany({
      where: { eventId },
      include: {
        _count: {
          select: {
            registrations: {
              where: { status: { not: 'CANCELLED' } },
            },
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return ticketTypes.map((tt: any) => ({
      ...tt,
      event_id: tt.eventId,
      sort_order: tt.sortOrder,
      is_active: tt.isActive,
      is_team: tt.isTeam,
      max_team_size: tt.maxTeamSize,
      sale_start: tt.saleStart,
      sale_end: tt.saleEnd,
      created_at: tt.createdAt,
      updated_at: tt.updatedAt,
      sold_count: tt._count.registrations,
    }));
  }

  /**
   * Get a single ticket type by ID.
   */
  static async getTicketTypeById(id: number) {
    const tt = await prisma.ticketType.findUnique({ where: { id } });
    if (!tt) return null;

    return {
      ...tt,
      event_id: tt.eventId,
      sort_order: tt.sortOrder,
      is_active: tt.isActive,
      is_team: tt.isTeam,
      max_team_size: tt.maxTeamSize,
      sale_start: tt.saleStart,
      sale_end: tt.saleEnd,
      created_at: tt.createdAt,
      updated_at: tt.updatedAt,
    };
  }

  /**
   * Update a ticket type.
   */
  static async updateTicketType(id: number, input: UpdateTicketTypeInput) {
    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.capacity !== undefined) updateData.capacity = input.capacity;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.saleStart !== undefined) updateData.saleStart = input.saleStart ? new Date(input.saleStart) : null;
    if (input.saleEnd !== undefined) updateData.saleEnd = input.saleEnd ? new Date(input.saleEnd) : null;
    if (input.isTeam !== undefined) updateData.isTeam = input.isTeam;
    if (input.maxTeamSize !== undefined) updateData.maxTeamSize = input.maxTeamSize;

    const tt = await prisma.ticketType.update({
      where: { id },
      data: updateData,
    });

    return {
      ...tt,
      event_id: tt.eventId,
      sort_order: tt.sortOrder,
      is_active: tt.isActive,
      is_team: tt.isTeam,
      max_team_size: tt.maxTeamSize,
      sale_start: tt.saleStart,
      sale_end: tt.saleEnd,
      created_at: tt.createdAt,
      updated_at: tt.updatedAt,
    };
  }

  /**
   * Soft-delete a ticket type.
   */
  static async deactivateTicketType(id: number) {
    const tt = await prisma.ticketType.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      ...tt,
      event_id: tt.eventId,
      sort_order: tt.sortOrder,
      is_active: tt.isActive,
      is_team: tt.isTeam,
      max_team_size: tt.maxTeamSize,
      sale_start: tt.saleStart,
      sale_end: tt.saleEnd,
      created_at: tt.createdAt,
      updated_at: tt.updatedAt,
    };
  }

  /**
   * Check if a ticket type has available capacity.
   */
  static async checkAvailability(ticketTypeId: number): Promise<{ available: boolean; remaining: number | null }> {
    const ticketType = await prisma.ticketType.findUnique({ where: { id: ticketTypeId } });
    if (!ticketType) {
      return { available: false, remaining: 0 };
    }

    if (!ticketType.capacity) {
      return { available: true, remaining: null };
    }

    const soldCount = await prisma.registration.count({
      where: {
        ticketTypeId,
        eventId: ticketType.eventId,
        status: { not: 'CANCELLED' },
      },
    });

    const remaining = ticketType.capacity - soldCount;
    return { available: remaining > 0, remaining };
  }
}
