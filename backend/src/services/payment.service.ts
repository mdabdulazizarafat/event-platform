import { pool } from '../db/pool';
import { TicketTypeService } from './ticket-type.service';
import { getEmailQueue, RegistrationService } from './registration.service';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('payment.service');

// SSLCommerz is loaded dynamically to avoid issues if not installed yet
let SSLCommerzPayment: any = null;

function getSSLCommerz() {
  if (!SSLCommerzPayment) {
    SSLCommerzPayment = require('sslcommerz-lts');
  }
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD;
  const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';

  if (!storeId || !storePasswd) {
    throw new Error('SSLCommerz credentials are not configured. Set SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD in .env');
  }

  return new SSLCommerzPayment(storeId, storePasswd, isLive);
}

/**
 * Generate a unique transaction ID for SSLCommerz.
 */
function generateTranId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RP-${timestamp}-${random}`;
}

export class PaymentService {
  /**
   * Initiate a payment session for a paid ticket.
   * Creates a PENDING registration and PENDING payment record,
   * then calls SSLCommerz init() to get the GatewayPageURL.
   */
  static async initiatePayment(input: {
    eventId: number;
    eventSlug: string;
    eventTitle: string;
    ticketTypeId: number;
    userId: string;
    email: string;
    customerName: string;
    customerPhone?: string;
    jobTitle?: string;
    organization?: string;
    tshirtSize?: string;
    reference?: string;
    transactionId?: string;
    teamName?: string;
    teamMembers?: string[];
  }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Validate team and registration
      await RegistrationService.validateTeamAndRegistration(
        client,
        input.eventId,
        input.ticketTypeId,
        input.userId,
        input.teamName,
        input.teamMembers
      );

      // 2. Validate ticket type
      const ticketType = await TicketTypeService.getTicketTypeById(input.ticketTypeId);
      if (!ticketType || ticketType.event_id !== input.eventId) {
        throw new Error('Invalid ticket type for this event.');
      }
      if (!ticketType.is_active) {
        throw new Error('This ticket type is no longer available.');
      }
      if (parseFloat(ticketType.price) <= 0) {
        throw new Error('This is a free ticket. Use the direct registration endpoint.');
      }

      // 3. Check per-ticket-type capacity
      if (ticketType.capacity) {
        const countRes = await client.query(
          "SELECT COUNT(*) FROM registrations WHERE ticket_type_id = $1 AND event_id = $2 AND status != 'CANCELLED'",
          [input.ticketTypeId, input.eventId]
        );
        const soldCount = parseInt(countRes.rows[0].count);
        if (soldCount >= ticketType.capacity) {
          throw new Error('This ticket type is sold out.');
        }
      }

      // 4. Check global event capacity
      const capacityRes = await client.query(
        "SELECT capacity, (SELECT COUNT(*) FROM registrations WHERE event_id = $1 AND status != 'CANCELLED') as current_count FROM events WHERE id = $1",
        [input.eventId]
      );
      if (capacityRes.rows[0]) {
        const { capacity, current_count } = capacityRes.rows[0];
        if (parseInt(current_count) >= capacity) {
          throw new Error('Event is at capacity.');
        }
      }

      // 5. Create PENDING registration
      const registerQuery = `
        INSERT INTO registrations (
          event_id, ticket_type_id, user_id, email, status, payment_status,
          full_name, phone, job_title, organization, tshirt_size, reference, transaction_id
        )
        VALUES ($1, $2, $3, $4, 'PENDING', 'PENDING', $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, qr_token;
      `;
      const regRes = await client.query(registerQuery, [
        input.eventId,
        input.ticketTypeId,
        input.userId,
        input.email,
        input.customerName,
        input.customerPhone || null,
        input.jobTitle || null,
        input.organization || null,
        input.tshirtSize || null,
        input.reference || null,
        input.transactionId || null,
      ]);
      const { id: registrationId, qr_token: qrToken } = regRes.rows[0];

      // Save team and team members if applicable
      if (input.teamName) {
        await RegistrationService.saveTeamAndMembers(
          client,
          input.eventId,
          input.ticketTypeId,
          registrationId,
          input.teamName,
          input.teamMembers
        );
      }

      // 6. Create PENDING payment record
      const tranId = generateTranId();
      const paymentQuery = `
        INSERT INTO payments (registration_id, event_id, ticket_type_id, tran_id, amount, currency, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
        RETURNING id;
      `;
      await client.query(paymentQuery, [
        registrationId,
        input.eventId,
        input.ticketTypeId,
        tranId,
        ticketType.price,
        ticketType.currency || 'BDT',
      ]);

      await client.query('COMMIT');

      // 6. Call SSLCommerz init() to get GatewayPageURL
      let gatewayUrl = 'http://localhost:3000/payment/mock-gateway';
      if (process.env.NODE_ENV !== 'test' && process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD) {
        const sslcz = getSSLCommerz();
        const successUrl = process.env.SSLCOMMERZ_SUCCESS_URL || 'http://localhost:3000/payment/success';
        const failUrl = process.env.SSLCOMMERZ_FAIL_URL || 'http://localhost:3000/payment/fail';
        const cancelUrl = process.env.SSLCOMMERZ_CANCEL_URL || 'http://localhost:3000/payment/cancel';
        const ipnUrl = process.env.SSLCOMMERZ_IPN_URL || 'http://localhost:3001/api/v1/payments/ipn';

        const sslData = {
          total_amount: parseFloat(ticketType.price),
          currency: ticketType.currency || 'BDT',
          tran_id: tranId,
          success_url: successUrl,
          fail_url: failUrl,
          cancel_url: cancelUrl,
          ipn_url: ipnUrl,
          shipping_method: 'NO',
          product_name: `${input.eventTitle} - ${ticketType.name}`,
          product_category: 'Event Ticket',
          product_profile: 'non-physical-goods',
          cus_name: input.customerName,
          cus_email: input.email,
          cus_add1: 'N/A',
          cus_city: 'N/A',
          cus_postcode: 'N/A',
          cus_country: 'Bangladesh',
          cus_phone: input.customerPhone || 'N/A',
          ship_name: 'N/A',
          ship_add1: 'N/A',
          ship_city: 'N/A',
          ship_postcode: 'N/A',
          ship_country: 'Bangladesh',
          value_a: registrationId.toString(),
          value_b: input.eventId.toString(),
          value_c: input.eventSlug,
          value_d: qrToken,
        };

        const apiResponse = await sslcz.init(sslData);

        if (!apiResponse?.GatewayPageURL) {
          // Rollback registration + payment if SSLCommerz init fails
          await pool.query("UPDATE registrations SET status = 'CANCELLED' WHERE id = $1 AND event_id = $2", [registrationId, input.eventId]);
          await pool.query("UPDATE payments SET status = 'FAILED' WHERE tran_id = $1", [tranId]);
          throw new Error('Failed to initialize payment gateway. Please try again.');
        }
        gatewayUrl = apiResponse.GatewayPageURL;
      }

      return {
        gatewayUrl,
        tranId,
        registrationId,
      };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Validate and complete a payment after SSLCommerz callback.
   */
  static async validateAndComplete(tranId: string, valId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Find the payment record
      const paymentRes = await client.query('SELECT * FROM payments WHERE tran_id = $1', [tranId]);
      if (paymentRes.rowCount === 0) {
        throw new Error('Payment record not found for this transaction.');
      }
      const payment = paymentRes.rows[0];

      if (payment.status === 'COMPLETED') {
        // Already processed (idempotent)
        await client.query('COMMIT');
        return { alreadyProcessed: true, registrationId: payment.registration_id, eventId: payment.event_id };
      }

      // 2. Validate with SSLCommerz API
      const sslcz = getSSLCommerz();
      const validationResponse = await sslcz.validate({ val_id: valId });

      if (validationResponse.status !== 'VALID' && validationResponse.status !== 'VALIDATED') {
        // Payment not valid
        await client.query("UPDATE payments SET status = 'FAILED', gateway_response = $1, updated_at = CURRENT_TIMESTAMP WHERE tran_id = $2", 
          [JSON.stringify(validationResponse), tranId]);
        await client.query("UPDATE registrations SET status = 'CANCELLED', payment_status = 'FAILED' WHERE id = $1 AND event_id = $2", 
          [payment.registration_id, payment.event_id]);
        await client.query('COMMIT');
        throw new Error('Payment validation failed.');
      }

      // 3. Update payment record to COMPLETED
      await client.query(
        `UPDATE payments 
         SET status = 'COMPLETED', val_id = $1, payment_method = $2, gateway_response = $3, paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
         WHERE tran_id = $4`,
        [valId, validationResponse.card_type || 'Unknown', JSON.stringify(validationResponse), tranId]
      );

      // 4. Confirm registration
      await client.query(
        "UPDATE registrations SET status = 'CONFIRMED', payment_status = 'COMPLETED' WHERE id = $1 AND event_id = $2",
        [payment.registration_id, payment.event_id]
      );

      // 5. Get QR token for email
      const regRes = await client.query('SELECT qr_token, email FROM registrations WHERE id = $1 AND event_id = $2', [payment.registration_id, payment.event_id]);
      const { qr_token: qrToken, email } = regRes.rows[0];

      await client.query('COMMIT');

      // 6. Queue confirmation email (non-blocking)
      try {
        await getEmailQueue().add(
          'sendConfirmationEmail',
          { email, eventId: payment.event_id, registrationId: payment.registration_id, qrToken },
          { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
        );
      } catch (queueError: any) {
        logger.warn({ err: queueError }, 'Failed to queue email after payment (Redis offline)');
      }

      return { alreadyProcessed: false, registrationId: payment.registration_id, eventId: payment.event_id, qrToken };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Handle payment failure — mark payment and registration as failed.
   */
  static async handleFailure(tranId: string) {
    const res = await pool.query("UPDATE payments SET status = 'FAILED', updated_at = CURRENT_TIMESTAMP WHERE tran_id = $1 AND status != 'COMPLETED' RETURNING registration_id, event_id", [tranId]);
    if (res.rowCount && res.rowCount > 0) {
      const { registration_id, event_id } = res.rows[0];
      await pool.query("UPDATE registrations SET status = 'CANCELLED', payment_status = 'FAILED' WHERE id = $1 AND event_id = $2 AND status != 'CONFIRMED'", [registration_id, event_id]);
    }
  }

  /**
   * Handle payment cancellation — mark payment and registration as cancelled.
   */
  static async handleCancellation(tranId: string) {
    const res = await pool.query("UPDATE payments SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE tran_id = $1 AND status != 'COMPLETED' RETURNING registration_id, event_id", [tranId]);
    if (res.rowCount && res.rowCount > 0) {
      const { registration_id, event_id } = res.rows[0];
      await pool.query("UPDATE registrations SET status = 'CANCELLED', payment_status = 'CANCELLED' WHERE id = $1 AND event_id = $2 AND status != 'CONFIRMED'", [registration_id, event_id]);
    }
  }

  /**
   * Get payment details by transaction ID.
   */
  static async getPaymentByTranId(tranId: string) {
    const res = await pool.query(
      `SELECT p.*, tt.name as ticket_name, e.title as event_title, e.slug as event_slug, r.qr_token, r.email, r.user_id
       FROM payments p
       JOIN ticket_types tt ON p.ticket_type_id = tt.id
       JOIN events e ON p.event_id = e.id
       JOIN registrations r ON p.registration_id = r.id AND p.event_id = r.event_id
       WHERE p.tran_id = $1`,
      [tranId]
    );
    return res.rows[0] || null;
  }
}
