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
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { 
        eventSlug, ticketTypeId, ticketTypeIds: incomingTicketTypeIds,
        customerName, customerPhone, jobTitle, organization, tshirtSize, reference, transactionId,
        teamName, teamMembers
      } = req.body;

      const userId = req.user.username;
      const email = req.user.email;

      const ticketTypeIds = incomingTicketTypeIds || (ticketTypeId ? [ticketTypeId] : []);

      if (!eventSlug || ticketTypeIds.length === 0 || !customerName) {
        return res.status(400).json({ error: 'Missing required fields: eventSlug, ticketTypeId, and customerName are required.' });
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
        ticketTypeIds: ticketTypeIds.map((id: any) => parseInt(id)),
        userId,
        email,
        customerName,
        customerPhone,
        jobTitle,
        organization,
        tshirtSize,
        reference,
        transactionId,
        teamName,
        teamMembers,
      });

      return res.status(200).json({
        message: 'Payment session initiated',
        gatewayUrl: result.gatewayUrl,
        tranId: result.tranId,
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Error initiating payment');
      return res.status(500).json({ error: error.message || 'Payment initiation failed' });
    }
  }

  /**
   * Payment success callback from SSLCommerz.
   * POST /api/v1/payments/success
   */
  static async handleSuccess(req: Request, res: Response) {
    try {
      const { tran_id: tranId, val_id: valId } = req.body;
      if (!tranId || !valId) {
        return res.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/checkout/fail?reason=missing_params`);
      }

      const result = await PaymentService.completePayment({ tranId, valId, status: 'SUCCESS' });
      const redirectUrl = `${process.env.APP_URL || 'http://localhost:3000'}/checkout/success?tranId=${tranId}&regId=${result.payment?.registrationId || ''}`;
      return res.redirect(redirectUrl);
    } catch (error: any) {
      logger.error({ err: error }, 'Error handling payment success');
      return res.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/checkout/fail?reason=${encodeURIComponent(error.message)}`);
    }
  }

  /**
   * Payment fail callback from SSLCommerz.
   * POST /api/v1/payments/fail
   */
  static async handleFail(req: Request, res: Response) {
    try {
      const { tran_id: tranId, error } = req.body;
      if (tranId) {
        await PaymentService.completePayment({ tranId, status: 'FAILED', rawResponse: { error: error || 'Payment failed at gateway' } });
      }
      return res.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/checkout/fail?tranId=${tranId || ''}`);
    } catch (err: any) {
      logger.error({ err }, 'Error handling payment fail callback');
      return res.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/checkout/fail`);
    }
  }

  /**
   * Payment cancel callback from SSLCommerz.
   * POST /api/v1/payments/cancel
   */
  static async handleCancel(req: Request, res: Response) {
    try {
      const { tran_id: tranId } = req.body;
      if (tranId) {
        await PaymentService.completePayment({ tranId, status: 'CANCELLED' });
      }
      return res.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/checkout/cancel?tranId=${tranId || ''}`);
    } catch (err: any) {
      logger.error({ err }, 'Error handling payment cancel callback');
      return res.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/checkout/cancel`);
    }
  }

  /**
   * IPN (Instant Payment Notification) webhook from SSLCommerz.
   * POST /api/v1/payments/ipn
   */
  static async handleIPN(req: Request, res: Response) {
    try {
      const { tran_id: tranId, val_id: valId, status } = req.body;

      if (!tranId || !valId) {
        return res.status(400).json({ error: 'Missing tran_id or val_id' });
      }

      if (status === 'VALID' || status === 'VALIDATED') {
        await PaymentService.completePayment({ tranId, valId, status: 'SUCCESS' });
      } else {
        await PaymentService.completePayment({ tranId, status: 'FAILED', rawResponse: { error: `IPN status: ${status}` } });
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
      const payment = await PaymentService.getPaymentStatus(tranId);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      const isAuthorized = req.user && (
        req.user.username === payment.userId || 
        req.user.role === 'SUPER_ADMIN' || 
        req.user.role === 'ADMIN'
      );

      return res.status(200).json({
        tranId: payment.tranId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        ticketName: payment.ticketName,
        eventTitle: payment.eventTitle,
        eventSlug: payment.eventSlug,
        qrToken: isAuthorized ? payment.qrToken : undefined,
        email: isAuthorized ? payment.email : undefined,
        paymentMethod: payment.paymentMethod,
        paidAt: payment.paidAt,
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Error fetching payment status');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
