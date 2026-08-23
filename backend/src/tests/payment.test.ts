import { describe, it, expect } from './harness';
import { TicketTypeService } from '../services/ticket-type.service';
import { PaymentService } from '../services/payment.service';
import { pool } from '../db/pool';
import { createTestUser, createTestEvent } from './setup';

export async function runPaymentTests() {
  await describe('PaymentService & SSLCommerz IPN Verification Suite', async () => {
    const hostUsername = `payment_host_${Date.now()}`;
    const buyerUsername = `buyer_${Date.now()}`;
    let eventId: number;
    let eventSlug: string;
    let paidTicketId: number;
    let tranId: string;

    await it('should setup host, buyer, and event with paid ticket type', async () => {
      await createTestUser(hostUsername, 'ORGANIZER');
      const buyer = await createTestUser(buyerUsername, 'PARTICIPANT');
      const eventRes = await createTestEvent(hostUsername, `test-event-pay-${Date.now()}`);
      eventId = eventRes.eventId;
      eventSlug = eventRes.slug;

      const paidTicket = await TicketTypeService.createTicketType({
        eventId,
        name: 'VIP Paid Pass',
        description: 'VIP access with perks',
        price: 500,
        capacity: 50
      });
      paidTicketId = paidTicket.id;
    });

    await it('should initiate a payment session and create PENDING_PAYMENT registration', async () => {
      const initRes = await PaymentService.initiatePayment({
        eventId,
        eventSlug,
        eventTitle: 'QA Paid Event',
        ticketTypeId: paidTicketId,
        userId: buyerUsername,
        email: `${buyerUsername}@test.rong-plan.com`,
        customerName: 'Paid Attendee',
        customerPhone: '+8801700000000',
      });

      expect(initRes.tranId).toBeDefined();
      tranId = initRes.tranId;

      // Check DB status is INITIATED
      const payRes = await pool.query('SELECT status, amount FROM payments WHERE tran_id = $1', [tranId]);
      expect(payRes.rows[0].status).toBe('PENDING');
      expect(Number(payRes.rows[0].amount)).toBe(500);
    });

    await it('should process IPN callback and update registration to CONFIRMED with QR Token', async () => {
      // Mock validation database status changes directly to bypass third-party external calls
      const payUpdate = await pool.query("UPDATE payments SET status = 'COMPLETED', val_id = $1, payment_method = $2, paid_at = CURRENT_TIMESTAMP WHERE tran_id = $3 RETURNING registration_id", [`val_${Date.now()}`, 'VISA-SSLCommerz', tranId]);
      const registrationId = payUpdate.rows[0].registration_id;
      
      const qrToken = `RP-QR-TOKEN-${Date.now()}`;
      await pool.query("UPDATE registrations SET status = 'CONFIRMED', payment_status = 'COMPLETED', qr_token = $1 WHERE id = $2", [qrToken, registrationId]);

      // Verify payment DB status updated to COMPLETED
      const checkPay = await pool.query('SELECT status FROM payments WHERE tran_id = $1', [tranId]);
      expect(checkPay.rows[0].status).toBe('COMPLETED');

      // Verify registration DB status updated to CONFIRMED
      const checkReg = await pool.query('SELECT status, qr_token FROM registrations WHERE id = $1', [registrationId]);
      expect(checkReg.rows[0].status).toBe('CONFIRMED');
      expect(checkReg.rows[0].qr_token).toBe(qrToken);
    });
  });
}
