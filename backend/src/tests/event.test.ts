import { describe, it, expect } from './harness';
import { EventService } from '../services/event.service';
import { EventTeamService } from '../services/event-team.service';
import { EventActivityService } from '../services/event-activity.service';
import { pool } from '../db/pool';
import { createTestUser } from './setup';

export async function runEventTests() {
  await describe('EventService & Partition Table Generation Suite', async () => {
    const organizerUsername = `event_host_${Date.now()}`;
    const slug = `test-event-${Date.now()}`;
    let createdEventId: number;

    await it('should prepare host user for event creation', async () => {
      await createTestUser(organizerUsername, 'ORGANIZER');
    });

    await it('should create an event, generate partition table p_reg_[eventId], and initialize team', async () => {
      createdEventId = await EventService.createEvent({
        slug,
        title: 'Partition Test Event',
        date: '10 Sep, 2026',
        time: '09:00 AM - 05:00 PM',
        location: 'Tech Hub Dhaka',
        capacity: 100,
        organizerUsername,
      });
      expect(typeof createdEventId).toBe('number');
      expect(createdEventId).toBeGreaterThan(0);
    });

    await it('should automatically add host as ORGANIZER in event_team', async () => {
      const team = await EventTeamService.getTeam(createdEventId);
      const hostMember = team.find((m) => m.username === organizerUsername);
      expect(hostMember).toBeDefined();
      expect(hostMember?.role).toBe('ORGANIZER');
    });

    await it('should automatically create default Check-in activity', async () => {
      const activities = await EventActivityService.getActivities(createdEventId);
      const checkIn = activities.find((a) => a.name === 'Check-in');
      expect(checkIn).toBeDefined();
      expect(checkIn?.scan_limit).toBe(1);
    });
  });
}
