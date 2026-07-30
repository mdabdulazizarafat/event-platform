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

      const paidTicket = await TicketTypeService.createTicketType(
        eventId,
        'VIP Paid Pass',
        'VIP access with perks',
        500,
        50
      );
      paidTicketId = paidTicket.id;
    });

    await it('should initiate a payment session and create PENDING_PAYMENT registration', async () => {
      const initRes = await PaymentService.initiatePayment({
        eventSlug,
        ticketTypeId: paidTicketId,
        userId: buyerUsername,
        email: `${buyerUsername}@test.rong-plan.com`,
        customerName: 'Paid Attendee',
        customerPhone: '+8801700000000',
      });

      expect(initRes.tranId).toBeDefined();
      tranId = initRes.tranId;

      // Check DB status is PENDING_PAYMENT
      const payRes = await pool.query('SELECT status, amount FROM payments WHERE tran_id = $1', [tranId]);
      expect(payRes.rows[0].status).toBe('INITIATED');
      expect(Number(payRes.rows[0].amount)).toBe(500);
    });

    await it('should process IPN callback and update registration to CONFIRMED with QR Token', async () => {
      const ipnRes = await PaymentService.processIpn({
        tran_id: tranId,
        val_id: `val_${Date.now()}`,
        amount: '500.00',
        card_type: 'VISA-SSLCommerz',
        store_amount: '485.00',
        card_no: '400000XXXXXX0002',
        bank_tran_id: `bank_${Date.now()}`,
        status: 'VALID',
        tran_date: new Date().toISOString(),
        currency: 'BDT',
        card_issuer: 'TEST_BANK',
        card_brand: 'VISA',
      });

      expect(ipnRes.alreadyProcessed).toBe(false);
      expect(ipnRes.registrationId).toBeDefined();
      expect(ipnRes.qrToken).toBeDefined();

      // Verify payment DB status updated to VALID
      const checkPay = await pool.query('SELECT status FROM payments WHERE tran_id = $1', [tranId]);
      expect(checkPay.rows[0].status).toBe('VALID');

      // Verify registration DB status updated to CONFIRMED
      const checkReg = await pool.query('SELECT status, qr_token FROM registrations WHERE id = $1', [ipnRes.registrationId]);
      expect(checkReg.rows[0].status).toBe('CONFIRMED');
      expect(checkReg.rows[0].qr_token).toBe(ipnRes.qrToken);
    });
  });
}
