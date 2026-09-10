import prisma from '../lib/prisma';
import { Queue } from 'bullmq';
import { createChildLogger } from '../lib/logger';
import { generateSecureQrToken } from '../lib/crypto';

const logger = createChildLogger('registration.service');

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
   * Batched team and registration validation to prevent N+1 queries.
   */
  static async validateTeamAndRegistration(
    tx: any,
    eventId: number,
    ticketTypeId: number,
    userId: string,
    teamName?: string,
    teamMembers?: string[]
  ) {
    // 1. Validate if user is already registered for this segment
    const hasReg = await tx.registration.findFirst({
      where: {
        eventId,
        ticketTypeId,
        userId,
        status: { not: 'CANCELLED' },
      },
    });
    if (hasReg) {
      throw new Error(`User ${userId} is already registered for this category.`);
    }

    // 2. Validate if user is already in a team for this segment
    const hasTeam = await tx.registrationTeamMember.findFirst({
      where: {
        username: userId,
        team: {
          eventId,
          ticketTypeId,
        },
      },
    });
    if (hasTeam) {
      throw new Error(`User ${userId} is already a member of a team for this category.`);
    }

    // 3. Validate ticket type
    const ticketType = await tx.ticketType.findFirst({
      where: { id: ticketTypeId, eventId, isActive: true },
    });
    if (!ticketType) {
      throw new Error('Invalid or inactive ticket type.');
    }

    if (ticketType.isTeam) {
      if (!teamName || !teamName.trim()) {
        throw new Error('Team name is required for team registration.');
      }

      const rawMembers = (teamMembers || []).map((m) => m.trim()).filter(Boolean);
      const totalSize = 1 + rawMembers.length;

      if (ticketType.maxTeamSize && totalSize > ticketType.maxTeamSize) {
        throw new Error(`Team size exceeds the maximum allowed size of ${ticketType.maxTeamSize}.`);
      }

      if (rawMembers.length > 0) {
        // BATCH QUERY 1: Fetch all team member users by email in ONE query
        const memberUsers = await tx.user.findMany({
          where: { email: { in: rawMembers } },
          select: { username: true, email: true },
        });

        const foundEmailsMap = new Map<string, string>(memberUsers.map((u: any) => [u.email.toLowerCase(), u.username]));

        // Ensure all member emails exist
        for (const email of rawMembers) {
          const lower = email.toLowerCase();
          if (!foundEmailsMap.has(lower)) {
            throw new Error(`User with email "${email}" does not exist on Somavesh.`);
          }
          const memberUsername = foundEmailsMap.get(lower)!;
          if (memberUsername.toLowerCase() === userId.toLowerCase()) {
            throw new Error('You cannot add yourself as an additional team member.');
          }
        }

        const memberUsernames = Array.from(foundEmailsMap.values());

        // BATCH QUERY 2: Check existing registrations for all members in ONE query
        const existingMemberRegs = await tx.registration.findMany({
          where: {
            eventId,
            ticketTypeId,
            userId: { in: memberUsernames },
            status: { not: 'CANCELLED' },
          },
          select: { userId: true },
        });
        if (existingMemberRegs.length > 0) {
          throw new Error(`One or more team members are already registered for this category.`);
        }

        // BATCH QUERY 3: Check team memberships for all members in ONE query
        const existingMemberTeams = await tx.registrationTeamMember.findMany({
          where: {
            username: { in: memberUsernames },
            team: { eventId, ticketTypeId },
          },
          select: { username: true },
        });
        if (existingMemberTeams.length > 0) {
          throw new Error(`One or more team members are already part of another team for this category.`);
        }
      }
    }
  }

  static async saveTeamAndMembers(
    tx: any,
    eventId: number,
    ticketTypeId: number,
    registrationId: bigint | number,
    teamName: string,
    teamMembers?: string[]
  ) {
    const regIdBigInt = BigInt(registrationId);

    const team = await tx.registrationTeam.create({
      data: {
        eventId,
        ticketTypeId,
        leaderRegistrationId: regIdBigInt,
        teamName: teamName.trim(),
      },
    });

    const rawMembers = (teamMembers || []).map((m) => m.trim()).filter(Boolean);
    if (rawMembers.length > 0) {
      const users = await tx.user.findMany({
        where: { email: { in: rawMembers } },
        select: { username: true },
      });

      if (users.length > 0) {
        await tx.registrationTeamMember.createMany({
          data: users.map((u: any) => ({
            teamId: team.id,
            username: u.username,
          })),
        });
      }
    }
  }

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
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Validate all ticket types
      if (ticketTypeIds.length > 0) {
        for (const ticketTypeId of ticketTypeIds) {
          await this.validateTeamAndRegistration(
            tx,
            eventId,
            ticketTypeId,
            userId,
            details?.teamName,
            details?.teamMembers
          );

          const ticketType = await tx.ticketType.findFirst({
            where: { id: ticketTypeId, eventId, isActive: true },
          });

          if (!ticketType) {
            throw new Error('Invalid or inactive ticket type.');
          }

          if (Number(ticketType.price) > 0) {
            if (!details?.transactionId || !details.transactionId.trim()) {
              throw new Error(
                `Ticket type "${ticketType.name}" requires payment. Please enter your mobile banking (bKash/Nagad) transaction ID.`
              );
            }
          }

          // Per-ticket-type capacity enforcement
          if (ticketType.capacity) {
            const soldCount = await tx.registration.count({
              where: {
                eventId,
                status: { not: 'CANCELLED' },
                OR: [
                  { ticketTypeId },
                  { ticketTypesJoinTable: { some: { ticketTypeId } } },
                ],
              },
            });

            if (soldCount >= ticketType.capacity) {
              throw new Error(`Ticket type "${ticketType.name}" is sold out.`);
            }
          }
        }
      }

      const primaryTicketTypeId = ticketTypeIds.length > 0 ? ticketTypeIds[0] : null;
      const hasPaidTicket = ticketTypeIds.length > 0 && details?.transactionId?.trim();
      const paymentStatus = hasPaidTicket ? 'COMPLETED' : 'NOT_REQUIRED';
      const cleanTransactionId = details?.transactionId ? details.transactionId.trim() : null;

      // Check existing registration
      const existingReg = await tx.registration.findFirst({
        where: { eventId, userId, status: { not: 'CANCELLED' } },
      });

      let registrationId: bigint;
      let qrToken: string;

      if (existingReg) {
        registrationId = existingReg.id;
        qrToken = existingReg.qrToken || generateSecureQrToken();

        await tx.registration.update({
          where: { id: existingReg.id },
          data: {
            fullName: details?.fullName || existingReg.fullName,
            phone: details?.phone || existingReg.phone,
            jobTitle: details?.jobTitle || existingReg.jobTitle,
            organization: details?.organization || existingReg.organization,
            tshirtSize: details?.tshirtSize || existingReg.tshirtSize,
            reference: details?.reference || existingReg.reference,
            transactionId: cleanTransactionId || existingReg.transactionId,
            paymentStatus: cleanTransactionId ? 'COMPLETED' : existingReg.paymentStatus,
          },
        });
      } else {
      // 2. Atomic Event Fetch & Row Locking to prevent overbooking race conditions
      const event = await tx.$queryRaw<Array<{ capacity: number }>>`
        SELECT capacity FROM events WHERE id = ${eventId} FOR UPDATE
      `;

      if (!event || event.length === 0) {
        throw new Error('Registration failed: Event does not exist.');
      }

      const activeCount = await tx.registration.count({
        where: { eventId, status: { not: 'CANCELLED' } },
      });

      if (activeCount >= event[0].capacity) {
        throw new Error('Registration failed: Event is at capacity.');
      }

      qrToken = generateSecureQrToken();

        const createdReg = await tx.registration.create({
          data: {
            eventId,
            ticketTypeId: primaryTicketTypeId,
            userId,
            email,
            status: 'CONFIRMED',
            paymentStatus,
            fullName: details?.fullName || null,
            phone: details?.phone || null,
            jobTitle: details?.jobTitle || null,
            organization: details?.organization || null,
            tshirtSize: details?.tshirtSize || null,
            reference: details?.reference || null,
            transactionId: cleanTransactionId,
            qrToken,
          },
        });

        registrationId = createdReg.id;
      }

      // Batch save join table
      if (ticketTypeIds.length > 0) {
        await tx.registrationTicketType.createMany({
          data: ticketTypeIds.map((tId) => ({
            registrationId,
            ticketTypeId: tId,
          })),
          skipDuplicates: true,
        });
      }

      // Save team if applicable
      if (ticketTypeIds.length > 0 && details?.teamName) {
        await this.saveTeamAndMembers(
          tx,
          eventId,
          ticketTypeIds[0],
          registrationId,
          details.teamName,
          details.teamMembers
        );
      }

      return { registrationId: Number(registrationId), qrToken };
    });

    // Queue email confirmation job safely
    try {
      await getEmailQueue().add(
        'sendConfirmationEmail',
        { email, eventId, registrationId: result.registrationId, qrToken: result.qrToken },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      );
    } catch (queueError: any) {
      logger.warn({ err: queueError }, 'Failed to queue email confirmation job (Redis offline)');
    }

    return result;
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
    const skip = (pageNum - 1) * limitNum;

    const where: any = { eventId };

    if (statusFilter) {
      where.status = statusFilter;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { userId: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.registration.count({ where }),
      prisma.registration.findMany({
        where,
        include: {
          ticketType: {
            select: { name: true, price: true },
          },
        },
        orderBy: { registeredAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    const formattedData = items.map((r: any) => ({
      ...r,
      id: Number(r.id),
      registered_at: r.registeredAt,
      full_name: r.fullName,
      user_id: r.userId,
      tshirt_size: r.tshirtSize,
      transaction_id: r.transactionId,
      job_title: r.jobTitle,
      ticket_type_name: r.ticketType?.name || null,
      ticket_price: r.ticketType ? Number(r.ticketType.price) : 0,
    }));

    return {
      data: formattedData,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}
