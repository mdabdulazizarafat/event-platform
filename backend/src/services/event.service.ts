import prisma from '../lib/prisma';
import { getRedisClient } from '../lib/redis';

export interface CreateEventInput {
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  contactEmail?: string;
  contactPhone?: string;
  organizerUsername: string;
  description?: string;
  thumbnail?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  formPhone?: boolean;
  formJobTitle?: boolean;
  formOrganization?: boolean;
  formTshirtSize?: boolean;
  formReference?: boolean;
  formTransactionId?: boolean;
  isPrivate?: boolean;
  eventFor?: string;
  studentCategory?: string;
  category?: string | string[];
  paymentInstructions?: string;
  bkashNumber?: string;
  rejectionReason?: string;
}

export async function invalidateEventCache(): Promise<void> {
  try {
    const redisClient = await getRedisClient();
    const stream = redisClient.scanStream({ match: 'cache:events:*', count: 100 });
    stream.on('data', async (resultKeys: string[]) => {
      if (resultKeys.length > 0) {
        await redisClient.del(...resultKeys);
      }
    });
  } catch (e) {
    // Ignore Redis errors
  }
}

export class EventService {
  /**
   * Creates a new event and provisions default event team & scanning activities atomically via Prisma.
   */
  static async createEvent(input: CreateEventInput): Promise<number> {
    const categoryString = Array.isArray(input.category)
      ? input.category.join(',')
      : input.category || 'Tech';

    const defaultActivities = ['Check-in', 'Food', 'Gift', 'Certificate'];

    const event = await prisma.$transaction(async (tx: any) => {
      const createdEvent = await tx.event.create({
        data: {
          slug: input.slug,
          title: input.title,
          description: input.description || null,
          thumbnail: input.thumbnail || null,
          date: input.date,
          time: input.time,
          startDate: input.startDate || null,
          endDate: input.endDate || null,
          registrationDeadline: input.registrationDeadline || null,
          location: input.location,
          capacity: input.capacity,
          contactEmail: input.contactEmail || null,
          contactPhone: input.contactPhone || null,
          organizerUsername: input.organizerUsername,
          status: input.status || 'DRAFT',
          formPhone: input.formPhone !== undefined ? input.formPhone : true,
          formJobTitle: input.formJobTitle !== undefined ? input.formJobTitle : true,
          formOrganization: input.formOrganization !== undefined ? input.formOrganization : true,
          formTshirtSize: input.formTshirtSize !== undefined ? input.formTshirtSize : false,
          formReference: input.formReference !== undefined ? input.formReference : false,
          formTransactionId: input.formTransactionId !== undefined ? input.formTransactionId : false,
          isPrivate: input.isPrivate !== undefined ? input.isPrivate : false,
          eventFor: input.eventFor || 'BOTH',
          studentCategory: input.studentCategory || null,
          category: categoryString,
          paymentInstructions: input.paymentInstructions || null,
          bkashNumber: input.bkashNumber || null,
          rejectionReason: input.rejectionReason || null,
        },
      });

      // Add creator to event_team as ORGANIZER
      await tx.eventTeam.create({
        data: {
          eventId: createdEvent.id,
          username: input.organizerUsername,
          role: 'ORGANIZER',
        },
      });

      // Create default activities
      await tx.eventActivity.createMany({
        data: defaultActivities.map((name, index) => ({
          eventId: createdEvent.id,
          name,
          scanLimit: 1,
          sortOrder: index,
        })),
      });

      return createdEvent;
    });

    await invalidateEventCache();
    return event.id;
  }

  static async updateEvent(
    slug: string,
    organizerUsername: string,
    input: {
      title?: string;
      description?: string;
      thumbnail?: string;
      date?: string;
      time?: string;
      location?: string;
      capacity?: number;
      contactEmail?: string;
      contactPhone?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      registrationDeadline?: string;
      formPhone?: boolean;
      formJobTitle?: boolean;
      formOrganization?: boolean;
      formTshirtSize?: boolean;
      formReference?: boolean;
      formTransactionId?: boolean;
      isPrivate?: boolean;
      eventFor?: string;
      studentCategory?: string;
      category?: string | string[];
      paymentInstructions?: string;
      bkashNumber?: string;
      rejectionReason?: string;
    },
    userRole?: string
  ) {
    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) {
      throw new Error('Event not found');
    }

    const computed = this.computeEventStatus(event);
    if (computed.status === 'ENDED') {
      if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
        throw new Error('This event has ended and is read-only. Only platform admins can edit ended events.');
      }
    }

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.thumbnail !== undefined) updateData.thumbnail = input.thumbnail;
    if (input.date !== undefined) updateData.date = input.date;
    if (input.time !== undefined) updateData.time = input.time;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.capacity !== undefined) updateData.capacity = input.capacity;
    if (input.contactEmail !== undefined) updateData.contactEmail = input.contactEmail;
    if (input.contactPhone !== undefined) updateData.contactPhone = input.contactPhone;
    if (input.status !== undefined) {
      if (
        input.status === 'PUBLISHED' &&
        userRole !== 'SUPER_ADMIN' &&
        userRole !== 'ADMIN'
      ) {
        const isPaid =
          event.paymentInstructions ||
          event.bkashNumber ||
          input.paymentInstructions ||
          input.bkashNumber;
        
        let hasPaidTickets = false;
        const tickets = await prisma.ticketType.findMany({ where: { eventId: event.id } });
        if (tickets.some((t: any) => Number(t.price) > 0)) {
          hasPaidTickets = true;
        }

        if (isPaid || hasPaidTickets || event.status === 'REJECTED' || event.status === 'UNDER_REVIEW' || event.rejectionReason) {
          updateData.status = 'UNDER_REVIEW';
        } else {
          updateData.status = input.status;
        }
      } else {
        updateData.status = input.status;
      }
    }
    if (input.startDate !== undefined) updateData.startDate = input.startDate;
    if (input.endDate !== undefined) updateData.endDate = input.endDate;
    if (input.registrationDeadline !== undefined) updateData.registrationDeadline = input.registrationDeadline;
    if (input.formPhone !== undefined) updateData.formPhone = input.formPhone;
    if (input.formJobTitle !== undefined) updateData.formJobTitle = input.formJobTitle;
    if (input.formOrganization !== undefined) updateData.formOrganization = input.formOrganization;
    if (input.formTshirtSize !== undefined) updateData.formTshirtSize = input.formTshirtSize;
    if (input.formReference !== undefined) updateData.formReference = input.formReference;
    if (input.formTransactionId !== undefined) updateData.formTransactionId = input.formTransactionId;
    if (input.isPrivate !== undefined) updateData.isPrivate = input.isPrivate;
    if (input.eventFor !== undefined) updateData.eventFor = input.eventFor;
    if (input.studentCategory !== undefined) updateData.studentCategory = input.studentCategory;
    if (input.category !== undefined) {
      updateData.category = Array.isArray(input.category) ? input.category.join(',') : input.category;
    }
    if (input.paymentInstructions !== undefined) updateData.paymentInstructions = input.paymentInstructions;
    if (input.bkashNumber !== undefined) updateData.bkashNumber = input.bkashNumber;
    if (input.rejectionReason !== undefined) updateData.rejectionReason = input.rejectionReason;

    const updated = await prisma.event.update({
      where: { slug },
      data: updateData,
    });

    await invalidateEventCache();
    return updated;
  }

  static computeEventStatus(event: any) {
    if (
      event.status === 'PUBLISHED' ||
      event.status === 'REGISTRATION_CLOSED' ||
      event.status === 'LIVE' ||
      event.status === 'ENDED'
    ) {
      const now = new Date();
      let endDateTime: Date | null = null;
      if (event.endDate) {
        endDateTime = new Date(event.endDate);
      } else if (event.date) {
        endDateTime = new Date(event.date);
        if (!isNaN(endDateTime.getTime()) && !event.time) {
          endDateTime.setHours(23, 59, 59, 999);
        }
      }

      if (endDateTime && !isNaN(endDateTime.getTime()) && endDateTime < now) {
        return { ...event, status: 'ENDED' };
      }
      if (event.startDate && new Date(event.startDate) <= now) {
        return { ...event, status: 'LIVE' };
      }
      if (event.registrationDeadline && new Date(event.registrationDeadline) < now) {
        return { ...event, status: 'REGISTRATION_CLOSED' };
      }
      if (event.status === 'REGISTRATION_CLOSED') {
        return { ...event, status: 'PUBLISHED' };
      }
    }
    return event;
  }

  static async getEvents(
    usernameOrOptions?:
      | string
      | {
          username?: string;
          role?: string;
          page?: number;
          limit?: number;
          cursor?: number;
          search?: string;
          status?: string;
          category?: string;
          mine?: boolean;
        },
    roleParam?: string,
    pageParam?: number,
    limitParam?: number
  ) {
    let username: string | undefined;
    let role: string | undefined;
    let page: number | undefined;
    let limit: number | undefined;
    let cursor: number | undefined;
    let search: string | undefined;
    let statusFilter: string | undefined;
    let categoryFilter: string | undefined;
    let mine: boolean | undefined;

    if (typeof usernameOrOptions === 'object' && usernameOrOptions !== null) {
      username = usernameOrOptions.username;
      role = usernameOrOptions.role;
      page = usernameOrOptions.page;
      limit = usernameOrOptions.limit;
      cursor = usernameOrOptions.cursor;
      search = usernameOrOptions.search;
      statusFilter = usernameOrOptions.status;
      categoryFilter = usernameOrOptions.category;
      mine = usernameOrOptions.mine;
    } else {
      username = usernameOrOptions;
      role = roleParam;
      page = pageParam;
      limit = limitParam;
    }

    const limitNum = Math.min(100, Math.max(1, limit || 12));
    const pageNum = Math.max(1, page || 1);
    const skip = cursor ? 1 : (pageNum - 1) * limitNum;

    // Cache lookup for public list queries
    let redisClient: any = null;
    let cacheKey = '';
    if (!username && !search && !cursor) {
      try {
        redisClient = await getRedisClient();
        cacheKey = `cache:events:list:p${pageNum}:l${limitNum}:s${statusFilter || 'all'}:c${categoryFilter || 'all'}`;
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {
        // Ignore cache errors
      }
    }

    // Build Prisma where condition
    const where: any = {};

    if (username) {
      if (mine) {
        where.OR = [
          { organizerUsername: username },
          { team: { some: { username } } },
          { registrations: { some: { userId: username } } },
        ];
      } else if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        where.OR = [
          { status: { not: 'DRAFT' }, isPrivate: false },
          { organizerUsername: username },
          { team: { some: { username } } },
          { registrations: { some: { userId: username } } },
        ];
      }
    } else {
      where.status = { not: 'DRAFT' };
      where.isPrivate = false;
    }

    if (statusFilter && statusFilter !== 'All' && statusFilter !== 'all') {
      where.status = statusFilter;
    }

    if (categoryFilter && categoryFilter !== 'All' && categoryFilter !== 'all') {
      where.category = { contains: categoryFilter, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        ...(where.OR || []),
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.event.count({ where });

    const queryOptions: any = {
      where,
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      skip,
      include: {
        organizer: {
          select: {
            username: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            mobile: true,
            avatar: true,
          },
        },
        team: username ? { where: { username } } : false,
        registrations: username ? { where: { userId: username } } : false,
      },
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
    }

    const events = await prisma.event.findMany(queryOptions);

    const items = events.map((e: any) => {
      const computed = this.computeEventStatus(e);
      const isOrganizer = username ? e.organizerUsername === username : false;
      const teamRecord = username && e.team ? e.team[0] : null;
      const isTeamMember = !!teamRecord;
      const regRecord = username && e.registrations ? e.registrations[0] : null;
      const isRegistered = !!regRecord;

      return {
        ...computed,
        organizer_username: e.organizerUsername,
        contact_email: e.contactEmail,
        contact_phone: e.contactPhone,
        start_date: e.startDate,
        end_date: e.endDate,
        registration_deadline: e.registrationDeadline,
        form_phone: e.formPhone,
        form_job_title: e.formJobTitle,
        form_organization: e.formOrganization,
        form_tshirt_size: e.formTshirtSize,
        form_reference: e.formReference,
        form_transaction_id: e.formTransactionId,
        is_private: e.isPrivate,
        event_for: e.eventFor,
        student_category: e.studentCategory,
        payment_instructions: e.paymentInstructions,
        bkash_number: e.bkashNumber,
        rejection_reason: e.rejectionReason,
        created_at: e.createdAt,
        updated_at: e.updatedAt,
        is_organizer: isOrganizer,
        is_team_member: isTeamMember,
        is_registered: isRegistered,
        registration_id: regRecord ? Number(regRecord.id) : null,
        team_role: teamRecord ? teamRecord.role : null,
      };
    });

    const nextCursor = items.length === limitNum ? items[items.length - 1].id : null;
    const hasMore = nextCursor !== null;
    const totalPages = Math.ceil(total / limitNum);

    const result = {
      data: items,
      nextCursor,
      hasMore,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    };

    if (redisClient && cacheKey) {
      redisClient.setex(cacheKey, 15, JSON.stringify(result)).catch(() => {});
    }

    return result;
  }

  static async getEventBySlug(slug: string, username?: string, role?: string) {
    let redisClient: any = null;
    let cacheKey = '';
    if (!username) {
      try {
        redisClient = await getRedisClient();
        cacheKey = `cache:events:slug:${slug}`;
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {
        // Ignore cache errors
      }
    }

    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        organizer: {
          select: {
            username: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            mobile: true,
            avatar: true,
          },
        },
        team: username ? { where: { username } } : false,
        registrations: username ? { where: { userId: username } } : false,
      },
    });

    if (!event) return null;

    if (event.status === 'DRAFT') {
      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && event.organizerUsername !== username) {
        if (username) {
          const teamMember = await prisma.eventTeam.findFirst({
            where: { eventId: event.id, username },
          });
          if (!teamMember) return null;
        } else {
          return null;
        }
      }
    }

    const computed = this.computeEventStatus(event);
    const isOrganizer = username ? event.organizerUsername === username : false;
    const teamRecord = username && event.team ? event.team[0] : null;
    const isTeamMember = !!teamRecord;
    const regRecord = username && event.registrations ? event.registrations[0] : null;
    const isRegistered = !!regRecord;

    const formattedEvent = {
      ...computed,
      organizer_username: event.organizerUsername,
      organizer_first_name: event.organizer?.firstName || null,
      organizer_last_name: event.organizer?.lastName || null,
      organizer_name: event.organizer?.name || null,
      organizer_email: event.organizer?.email || null,
      organizer_phone: event.organizer?.mobile || null,
      contact_email: event.contactEmail,
      contact_phone: event.contactPhone,
      start_date: event.startDate,
      end_date: event.endDate,
      registration_deadline: event.registrationDeadline,
      form_phone: event.formPhone,
      form_job_title: event.formJobTitle,
      form_organization: event.formOrganization,
      form_tshirt_size: event.formTshirtSize,
      form_reference: event.formReference,
      form_transaction_id: event.formTransactionId,
      is_private: event.isPrivate,
      event_for: event.eventFor,
      student_category: event.studentCategory,
      payment_instructions: event.paymentInstructions,
      bkash_number: event.bkashNumber,
      rejection_reason: event.rejectionReason,
      created_at: event.createdAt,
      updated_at: event.updatedAt,
      is_organizer: isOrganizer,
      is_team_member: isTeamMember,
      team_role: teamRecord ? teamRecord.role : null,
      is_registered: isRegistered,
    };

    if (redisClient && cacheKey && formattedEvent) {
      redisClient.setex(cacheKey, 30, JSON.stringify(formattedEvent)).catch(() => {});
    }

    return formattedEvent;
  }
}
