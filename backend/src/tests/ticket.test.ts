import { describe, it, expect } from './harness';
import { TicketTypeService } from '../services/ticket-type.service';
import { RegistrationService } from '../services/registration.service';
import { createTestUser, createTestEvent } from './setup';

export async function runTicketTests() {
  await describe('TicketType & Registration (Month 1 Free Event) Suite', async () => {
    const organizerUsername = `ticket_host_${Date.now()}`;
    const attendeeUsername = `attendee_${Date.now()}`;
    let eventId: number;
    let freeTicketId: number;

    await it('should setup host and event for registration testing', async () => {
      await createTestUser(organizerUsername, 'ORGANIZER');
      const eventRes = await createTestEvent(organizerUsername, `test-event-reg-${Date.now()}`);
      eventId = eventRes.eventId;
    });

    await it('should create a free ticket type for Month 1 event model', async () => {
      const ticketType = await TicketTypeService.createTicketType({
        eventId,
        name: 'General Access (Free Month 1)',
        description: 'Free admission pass',
        price: 0,
        capacity: 100
      });
      expect(ticketType.id).toBeDefined();
      expect(Number(ticketType.price)).toBe(0);
      freeTicketId = ticketType.id;
    });

    await it('should register an attendee and generate secure QR Token', async () => {
      const attendee = await createTestUser(attendeeUsername, 'PARTICIPANT');
      const reg = await RegistrationService.registerForEvent(
        eventId,
        attendee.username,
        attendee.email,
        freeTicketId,
        {
          fullName: 'QA Test Attendee',
          organization: 'St. Gregorys College',
        }
      );

      expect(reg.registrationId).toBeDefined();
      expect(reg.qrToken).toBeDefined();
      expect(reg.qrToken.length).toBeGreaterThan(16);
    });
  });
}
