import prisma from '../lib/prisma';

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
    const activity = await prisma.eventActivity.create({
      data: {
        eventId: input.eventId,
        name: input.name,
        scanLimit: input.scanLimit === undefined ? 1 : input.scanLimit,
        sortOrder: input.sortOrder || 0,
      },
    });

    return {
      ...activity,
      event_id: activity.eventId,
      scan_limit: activity.scanLimit,
      is_active: activity.isActive,
      sort_order: activity.sortOrder,
      created_at: activity.createdAt,
    };
  }

  /**
   * Get all active activities for an event.
   */
  static async getActivities(eventId: number) {
    const activities = await prisma.eventActivity.findMany({
      where: { eventId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return activities.map((a: any) => ({
      ...a,
      event_id: a.eventId,
      scan_limit: a.scanLimit,
      is_active: a.isActive,
      sort_order: a.sortOrder,
      created_at: a.createdAt,
    }));
  }

  /**
   * Get all activities (including inactive) for host management.
   */
  static async getAllActivities(eventId: number) {
    const activities = await prisma.eventActivity.findMany({
      where: { eventId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return activities.map((a: any) => ({
      ...a,
      event_id: a.eventId,
      scan_limit: a.scanLimit,
      is_active: a.isActive,
      sort_order: a.sortOrder,
      created_at: a.createdAt,
    }));
  }

  /**
   * Get a single activity by ID.
   */
  static async getActivityById(id: number) {
    const activity = await prisma.eventActivity.findUnique({ where: { id } });
    if (!activity) return null;

    return {
      ...activity,
      event_id: activity.eventId,
      scan_limit: activity.scanLimit,
      is_active: activity.isActive,
      sort_order: activity.sortOrder,
      created_at: activity.createdAt,
    };
  }

  /**
   * Update an activity.
   */
  static async updateActivity(id: number, input: UpdateActivityInput) {
    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.scanLimit !== undefined) updateData.scanLimit = input.scanLimit;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;

    const activity = await prisma.eventActivity.update({
      where: { id },
      data: updateData,
    });

    return {
      ...activity,
      event_id: activity.eventId,
      scan_limit: activity.scanLimit,
      is_active: activity.isActive,
      sort_order: activity.sortOrder,
      created_at: activity.createdAt,
    };
  }

  /**
   * Deactivate an activity.
   */
  static async deactivateActivity(id: number) {
    const activity = await prisma.eventActivity.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      ...activity,
      event_id: activity.eventId,
      scan_limit: activity.scanLimit,
      is_active: activity.isActive,
      sort_order: activity.sortOrder,
      created_at: activity.createdAt,
    };
  }
}
