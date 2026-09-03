import prisma from '../lib/prisma';

export class EventTeamService {
  /**
   * Invite a user to join an event's team with a specific role.
   */
  static async inviteManager(eventId: number, username: string, invitedBy: string, role: string = 'SCANNER') {
    const validRoles = ['ORGANIZER', 'MANAGER', 'SCANNER'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { username: true, role: true },
    });
    if (!targetUser) {
      throw new Error(`User "${username}" does not exist on the platform.`);
    }

    if (role === 'ORGANIZER' && !['ORGANIZER', 'ADMIN', 'SUPER_ADMIN'].includes(targetUser.role)) {
      throw new Error('Only users with a global Organizer or Admin role can be invited as a Co-Organizer.');
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerUsername: true },
    });
    if (event && event.organizerUsername === username) {
      throw new Error('The event owner is already the organizer.');
    }

    const teamMember = await prisma.eventTeam.upsert({
      where: {
        eventId_username: { eventId, username },
      },
      update: { role, invitedBy },
      create: { eventId, username, role, invitedBy },
    });

    return teamMember;
  }

  /**
   * Get all members of an event's team including primary organizer.
   */
  static async getTeam(eventId: number) {
    const [teamMembers, event] = await Promise.all([
      prisma.eventTeam.findMany({
        where: { eventId },
        include: {
          user: {
            select: { name: true, email: true, avatar: true, bio: true },
          },
        },
        orderBy: [{ role: 'desc' }, { joinedAt: 'asc' }],
      }),
      prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organizer: {
            select: { username: true, name: true, email: true, avatar: true, bio: true },
          },
        },
      }),
    ]);

    const result = teamMembers.map((t: any) => ({
      username: t.username,
      role: t.role,
      invited_by: t.invitedBy,
      joined_at: t.joinedAt,
      name: t.user.name,
      email: t.user.email,
      avatar: t.user.avatar,
      bio: t.user.bio,
    }));

    // Check if primary organizer is in team list
    if (event && event.organizer) {
      const alreadyInTeam = result.some((r: any) => r.username === event.organizerUsername);
      if (!alreadyInTeam) {
        result.unshift({
          username: event.organizer.username,
          role: 'ORGANIZER',
          invited_by: null,
          joined_at: event.createdAt,
          name: event.organizer.name,
          email: event.organizer.email,
          avatar: event.organizer.avatar,
          bio: event.organizer.bio,
        });
      }
    }

    return result;
  }

  /**
   * Remove a member from the event's team.
   */
  static async removeMember(eventId: number, username: string) {
    const member = await prisma.eventTeam.findUnique({
      where: { eventId_username: { eventId, username } },
    });

    if (!member) {
      throw new Error('Team member not found.');
    }

    if (member.role === 'ORGANIZER') {
      throw new Error('Cannot remove the Event Organizer from the team.');
    }

    return await prisma.eventTeam.delete({
      where: { eventId_username: { eventId, username } },
    });
  }
}
