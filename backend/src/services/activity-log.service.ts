import prisma from '../lib/prisma';
import { EventActivityService } from './event-activity.service';

export interface ScanInput {
  eventId: number;
  activityId: number;
  qrToken: string;
  scannedBy: string;
}

export class ActivityLogService {
  /**
   * Scans a QR token for a specific activity checkpoint.
   * Atomic Prisma transaction handling duplicate scan detection.
   */
  static async scanQrToken(input: ScanInput) {
    return await prisma.$transaction(async (tx: any) => {
      // 1. Verify activity exists and is active
      const activity = await EventActivityService.getActivityById(input.activityId);
      if (!activity || activity.event_id !== input.eventId) {
        throw new Error('Activity not found or does not belong to this event.');
      }
      if (!activity.is_active) {
        throw new Error('This scanning checkpoint is currently inactive.');
      }

      // 2. Look up registration strictly by secure QR token for this event
      const registration = await tx.registration.findFirst({
        where: {
          eventId: input.eventId,
          qrToken: input.qrToken,
          status: { not: 'CANCELLED' },
        },
        include: {
          ticketType: { select: { name: true } },
        },
      });

      if (!registration) {
        throw new Error('Invalid ticket: Registration not found for this event.');
      }

      // 3. Verify registration is confirmed
      if (registration.status !== 'CONFIRMED' && registration.status !== 'CHECKED_IN') {
        throw new Error(`Ticket is ${registration.status}. Entry denied.`);
      }

      // 4. Verify payment status
      if (registration.paymentStatus === 'PENDING') {
        throw new Error('Ticket payment is pending. Entry denied.');
      }
      if (registration.paymentStatus === 'FAILED') {
        throw new Error('Ticket payment failed. Entry denied.');
      }

      // 5. Handle duplicate scan checking
      const existingScan = await tx.activityScan.findFirst({
        where: {
          registrationId: registration.id,
          activityId: input.activityId,
        },
        include: {
          scanner: { select: { name: true } },
        },
      });

      if (existingScan) {
        const timeStr = existingScan.scannedAt
          ? new Date(existingScan.scannedAt).toLocaleTimeString()
          : 'earlier';
        const scannerName = existingScan.scanner?.name || 'another scanner';

        throw new Error(`Already scanned! Checked by ${scannerName} at ${timeStr}.`);
      }

      const newScan = await tx.activityScan.create({
        data: {
          registrationId: registration.id,
          eventId: input.eventId,
          activityId: input.activityId,
          scannedBy: input.scannedBy,
        },
      });

      // Automatically update registration status to CHECKED_IN if activity is Check-in
      if (activity.name.toLowerCase() === 'check-in') {
        await tx.registration.update({
          where: { id: registration.id },
          data: { status: 'CHECKED_IN' },
        });
      }

      return {
        success: true,
        message: `${activity.name} approved.`,
        registration: {
          id: Number(registration.id),
          email: registration.email,
          userId: registration.userId,
          ticketName: registration.ticketType?.name || 'Standard Admission',
        },
        scannedAt: newScan.scannedAt,
      };
    });
  }

  /**
   * Get scan activity logs for an event with pagination.
   */
  static async getLogsForEvent(eventId: number, options: { page?: number; limit?: number } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      prisma.activityScan.count({ where: { eventId } }),
      prisma.activityScan.findMany({
        where: { eventId },
        include: {
          registration: {
            select: {
              email: true,
              userId: true,
              fullName: true,
              ticketType: { select: { name: true } },
            },
          },
          activity: { select: { name: true } },
          scanner: { select: { name: true } },
        },
        orderBy: { scannedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const formattedData = logs.map((l: any) => ({
      ...l,
      id: Number(l.id),
      registration_id: Number(l.registrationId),
      scanned_at: l.scannedAt,
      email: l.registration.email,
      user_id: l.registration.userId,
      full_name: l.registration.fullName,
      ticket_name: l.registration.ticketType?.name || null,
      activity_name: l.activity.name,
      scanner_name: l.scanner.name,
    }));

    return {
      data: formattedData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get analytics scan counts grouped by activity.
   */
  static async getScanStats(eventId: number) {
    const activities = await prisma.eventActivity.findMany({
      where: { eventId, isActive: true },
      include: {
        _count: { select: { scans: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return activities.map((a: any) => ({
      activity_id: a.id,
      activity_name: a.name,
      scan_count: a._count.scans,
    }));
  }
}
