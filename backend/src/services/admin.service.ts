import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

export class AdminService {
  /**
   * Log an administrative action to the audit trail.
   */
  static async logAction(adminUsername: string, action: string, targetType: string, targetId: string, details?: any) {
    await prisma.adminLog.create({
      data: {
        adminUsername,
        action,
        targetType,
        targetId,
        details: details || null,
      },
    });
  }

  /**
   * List all users on the platform with pagination.
   */
  static async listUsers(options: { page?: number; limit?: number; search?: string; role?: string } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options.role) {
      where.role = options.role;
    }

    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { username: { contains: options.search, mode: 'insensitive' } },
        { mobile: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          username: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          mobile: true,
          org: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const formattedData = data.map((u: any) => ({
      ...u,
      created_at: u.createdAt,
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
   * Update a user's platform role.
   */
  static async updateUserRole(username: string, newRole: string, adminUsername: string) {
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'ORGANIZER', 'USER'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}`);
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new Error(`User "${username}" not found.`);
    }

    const updated = await prisma.user.update({
      where: { username },
      data: { role: newRole },
      select: { username: true, name: true, email: true, role: true },
    });

    await this.logAction(adminUsername, 'UPDATE_USER_ROLE', 'USER', username, { newRole });
    return updated;
  }

  /**
   * List all events on the platform for moderation with pagination.
   */
  static async listEvents(options: { page?: number; limit?: number; search?: string; status?: string } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options.status) {
      where.status = options.status;
    }

    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { location: { contains: options.search, mode: 'insensitive' } },
        { organizerUsername: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: { name: true, email: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const formattedData = events.map((e: any) => ({
      ...e,
      organizer_username: e.organizerUsername,
      organizer_name: e.organizer?.name || null,
      organizer_email: e.organizer?.email || null,
      created_at: e.createdAt,
      updated_at: e.updatedAt,
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
   * Update event status (Publish, Unpublish, Cancel, Flag).
   */
  static async updateEventStatus(slug: string, newStatus: string, adminUsername: string, rejectionReason?: string) {
    const validStatuses = ['DRAFT', 'PUBLISHED', 'REJECTED', 'SUSPENDED', 'REGISTRATION_CLOSED', 'LIVE', 'ENDED', 'ARCHIVED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) {
      throw new Error(`Event with slug "${slug}" not found.`);
    }

    const updated = await prisma.event.update({
      where: { slug },
      data: {
        status: newStatus,
        rejectionReason: rejectionReason !== undefined ? rejectionReason : event.rejectionReason,
      },
    });

    await this.logAction(adminUsername, 'UPDATE_EVENT_STATUS', 'EVENT', slug, {
      oldStatus: event.status,
      newStatus,
      rejectionReason,
    });
    return updated;
  }

  /**
   * Delete an event permanently from the platform.
   */
  static async deleteEvent(slug: string, adminUsername: string) {
    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) {
      throw new Error(`Event with slug "${slug}" not found.`);
    }

    await prisma.event.delete({ where: { slug } });

    await this.logAction(adminUsername, 'DELETE_EVENT', 'EVENT', slug, { title: event.title });
    return { message: `Event "${event.title}" deleted successfully.` };
  }

  /**
   * List pending organizer applications.
   */
  static async getPendingOrganizers() {
    const users = await prisma.user.findMany({
      where: { organizerStatus: 'PENDING' },
      select: {
        username: true,
        name: true,
        email: true,
        mobile: true,
        org: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        organizerStatus: true,
        rejectionCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u: any) => ({
      ...u,
      organizer_status: u.organizerStatus,
      rejection_count: u.rejectionCount,
      created_at: u.createdAt,
    }));
  }

  /**
   * Approve an organizer application.
   */
  static async approveOrganizer(username: string, adminUsername: string) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new Error(`User "${username}" not found.`);
    }

    const updated = await prisma.user.update({
      where: { username },
      data: {
        role: 'ORGANIZER',
        organizerStatus: 'APPROVED',
      },
    });

    await this.logAction(adminUsername, 'APPROVE_ORGANIZER', 'USER', username);
    return updated;
  }

  /**
   * Reject an organizer application.
   */
  static async rejectOrganizer(username: string, adminUsername: string) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new Error(`User "${username}" not found.`);
    }

    const updated = await prisma.user.update({
      where: { username },
      data: {
        organizerStatus: 'REJECTED',
        rejectionCount: { increment: 1 },
      },
    });

    await this.logAction(adminUsername, 'REJECT_ORGANIZER', 'USER', username);
    return updated;
  }

  /**
   * Suspend an organizer account.
   */
  static async suspendOrganizer(username: string, adminUsername: string) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new Error(`User "${username}" not found.`);
    }

    const updated = await prisma.user.update({
      where: { username },
      data: {
        status: 'SUSPENDED',
        organizerStatus: 'SUSPENDED',
      },
    });

    await this.logAction(adminUsername, 'SUSPEND_ORGANIZER', 'USER', username);
    return updated;
  }

  /**
   * Fetch system audit logs with pagination.
   */
  static async getAuditLogs(options: { page?: number; limit?: number } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      prisma.adminLog.count(),
      prisma.adminLog.findMany({
        include: {
          admin: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const formattedData = logs.map((l: any) => ({
      ...l,
      admin_name: l.admin?.name || null,
      admin_email: l.admin?.email || null,
      created_at: l.createdAt,
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
   * Create a new administrator account (Platform Admin).
   */
  static async createAdmin(input: { username: string; name: string; email: string; password: string; role?: string }, creatorUsername: string) {
    const creator = await prisma.user.findUnique({ where: { username: creatorUsername } });
    if (!creator || creator.role !== 'SUPER_ADMIN') {
      throw new Error('Unauthorized: Only Super Admins can create new Admin accounts.');
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username: input.username }, { email: input.email }] },
    });
    if (existing) {
      throw new Error('User with this username or email already exists.');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const role = input.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';

    const newAdmin = await prisma.user.create({
      data: {
        username: input.username,
        name: input.name,
        email: input.email,
        passwordHash,
        role,
        status: 'ACTIVE',
      },
      select: { username: true, name: true, email: true, role: true, createdAt: true },
    });

    await this.logAction(creatorUsername, 'CREATE_ADMIN', 'USER', input.username, { role });
    return newAdmin;
  }

  /**
   * Delete a user account (Admin moderation).
   */
  static async deleteUser(username: string, adminUsername: string) {
    const [target, admin] = await Promise.all([
      prisma.user.findUnique({ where: { username } }),
      prisma.user.findUnique({ where: { username: adminUsername } }),
    ]);

    if (!target) {
      throw new Error(`User "${username}" not found.`);
    }

    if (target.role === 'SUPER_ADMIN' && admin?.role !== 'SUPER_ADMIN') {
      throw new Error('Unauthorized: Only Super Admins can delete Super Admin accounts.');
    }

    await prisma.user.delete({ where: { username } });
    await this.logAction(adminUsername, 'DELETE_USER', 'USER', username);

    return { username: target.username, name: target.name, email: target.email };
  }

  /**
   * Get global platform statistics in parallel.
   */
  static async getDashboardStats() {
    const [totalUsers, totalEvents, revenueAggregate] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: { in: ['SUCCESS', 'COMPLETED', 'SETTLED'] } },
      }),
    ]);

    return {
      totalUsers,
      totalEvents,
      totalRevenue: Number(revenueAggregate._sum.amount || 0),
      apiHealth: '99.9%',
    };
  }

  /**
   * Get detailed financial stats and payouts ledger.
   */
  static async getFinanceStats() {
    const revenueAggregate = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: { in: ['SUCCESS', 'COMPLETED', 'SETTLED'] } },
    });

    const volume = Number(revenueAggregate._sum.amount || 0);
    const commission = volume * 0.05;
    const settlements = volume * 0.95;

    const payments = await prisma.payment.findMany({
      where: { status: { in: ['SUCCESS', 'COMPLETED', 'SETTLED'] } },
      include: {
        event: {
          select: { organizerUsername: true },
        },
      },
    });

    // Group by host
    const hostMap = new Map<string, { amount: number; lastPaid: Date | null }>();
    for (const p of payments) {
      const host = p.event?.organizerUsername || 'unknown';
      const pAmt = Number(p.amount);
      const current = hostMap.get(host) || { amount: 0, lastPaid: null };

      const paidAtDate = p.paidAt || p.createdAt;
      const lastPaid = !current.lastPaid || (paidAtDate && paidAtDate > current.lastPaid) ? paidAtDate : current.lastPaid;

      hostMap.set(host, { amount: current.amount + pAmt, lastPaid });
    }

    const ledger = Array.from(hostMap.entries()).map(([host, val]) => ({
      host,
      amount: val.amount,
      fee: val.amount * 0.05,
      netPayout: val.amount * 0.95,
      status: 'SETTLED',
      date: val.lastPaid ? val.lastPaid.toISOString().split('T')[0] : '2026-08-01',
    })).sort((a, b) => b.amount - a.amount);

    return {
      consolidatedVolume: volume,
      platformCommission: commission,
      payoutSettlements: settlements,
      ledger,
    };
  }

  /**
   * Get dynamic infrastructure telemetry.
   */
  static async getInfrastructureHealth() {
    const os = require('os');

    let dbStatus = 'ONLINE';
    let dbPing = '1ms';
    const startTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbPing = `${Date.now() - startTime}ms`;
    } catch {
      dbStatus = 'DEGRADED';
      dbPing = 'TIMEOUT';
    }

    return {
      dbStatus,
      dbPing,
      uptime: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
      cpuUsage: `${Math.round(os.loadavg()[0] * 10)}%`,
      memoryUsage: `${Math.round((process.memoryUsage().heapUsed / 1024 / 1024))}MB`,
    };
  }
}
