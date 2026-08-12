import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { EventService } from '../services/event.service';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('payment.controller');

export class PaymentController {
  /**
   * Initiate a payment for a paid ticket type.
   * POST /api/v1/payments/initiate
   */
  static async initiate(req: Request, res: Response) {
    try {
      const { eventSlug, ticketTypeId, userId, email, customerName, customerPhone } = req.body;

      if (!eventSlug || !ticketTypeId || !userId || !email || !customerName) {
        return res.status(400).json({ error: 'Missing required fields: eventSlug, ticketTypeId, userId, email, and customerName are required.' });
      }

      const event = await EventService.getEventBySlug(eventSlug);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
        return res.status(400).json({ error: 'Registration deadline has passed' });
      }

      const result = await PaymentService.initiatePayment({
        eventId: event.id,
        eventSlug,
        eventTitle: event.title,
        ticketTypeId: parseInt(ticketTypeId),
        userId,
        email,
        customerName,
        customerPhone,
      });

      return res.status(200).json({
        message: 'Payment session initiated',
        gatewayUrl: result.gatewayUrl,
        tranId: result.tranId,
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Error initiating payment');
      return res.status(500).json({ error: error.message || 'Failed to initiate payment' });
    }
  }

  /**
   * SSLCommerz success callback.
   * POST /api/v1/payments/success (form-encoded POST from SSLCommerz)
   */
  static async success(req: Request, res: Response) {
    try {
      const { tran_id, val_id } = req.body;

      if (!tran_id || !val_id) {
        return res.status(400).json({ error: 'Invalid callback data' });
      }

      const result = await PaymentService.validateAndComplete(tran_id, val_id);

      // Redirect to frontend success page with transaction info
      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const payment = await PaymentService.getPaymentByTranId(tran_id);
      const eventSlug = payment?.event_slug || 'event';
      const redirectUrl = `${frontendBaseUrl}/events/${eventSlug}/checkout/confirmation?tran_id=${encodeURIComponent(tran_id)}`;
      return res.redirect(redirectUrl);
    } catch (error: any) {
      logger.error({ err: error }, 'Error processing payment success');
      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendBaseUrl}/payment/fail?error=${encodeURIComponent(error.message)}`);
    }
  }

  /**
   * SSLCommerz fail callback.
   * POST /api/v1/payments/fail
   */
  static async fail(req: Request, res: Response) {
    try {
      const { tran_id } = req.body;
      if (tran_id) {
        await PaymentService.handleFailure(tran_id);
      }

      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendBaseUrl}/payment/fail?tran_id=${encodeURIComponent(tran_id || '')}`);
    } catch (error: any) {
      logger.error({ err: error }, 'Error processing payment failure');
      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendBaseUrl}/payment/fail`);
    }
  }

  /**
   * SSLCommerz cancel callback.
   * POST /api/v1/payments/cancel
   */
  static async cancel(req: Request, res: Response) {
    try {
      const { tran_id } = req.body;
      if (tran_id) {
        await PaymentService.handleCancellation(tran_id);
      }

      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendBaseUrl}/payment/cancel?tran_id=${encodeURIComponent(tran_id || '')}`);
    } catch (error: any) {
      logger.error({ err: error }, 'Error processing payment cancellation');
      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendBaseUrl}/payment/cancel`);
    }
  }

  /**
   * SSLCommerz IPN (Instant Payment Notification) webhook.
   * POST /api/v1/payments/ipn
   */
  static async ipn(req: Request, res: Response) {
    try {
      const { tran_id, val_id, status } = req.body;

      if (!tran_id) {
        return res.status(400).json({ error: 'Missing tran_id' });
      }

      if (status === 'VALID' || status === 'VALIDATED') {
        await PaymentService.validateAndComplete(tran_id, val_id);
      } else if (status === 'FAILED') {
        await PaymentService.handleFailure(tran_id);
      } else if (status === 'CANCELLED') {
        await PaymentService.handleCancellation(tran_id);
      }

      return res.status(200).json({ message: 'IPN processed' });
    } catch (error: any) {
      logger.error({ err: error }, 'Error processing IPN');
      // Always respond 200 to IPN to prevent retries for already-processed transactions
      return res.status(200).json({ error: error.message });
    }
  }

  /**
   * Get payment status by transaction ID (for frontend polling).
   * GET /api/v1/payments/status/:tranId
   */
  static async getStatus(req: Request, res: Response) {
    try {
      const { tranId } = req.params;
      const payment = await PaymentService.getPaymentByTranId(tranId);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      return res.status(200).json({
        tranId: payment.tran_id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        ticketName: payment.ticket_name,
        eventTitle: payment.event_title,
        eventSlug: payment.event_slug,
        qrToken: payment.qr_token,
        email: payment.email,
        paymentMethod: payment.payment_method,
        paidAt: payment.paid_at,
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Error fetching payment status');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
