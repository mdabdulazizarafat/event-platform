import prisma from '../lib/prisma';
import { TicketTypeService } from './ticket-type.service';
import { getEmailQueue, RegistrationService } from './registration.service';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('payment.service');

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

function generateTranId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RP-${timestamp}-${random}`;
}

export class PaymentService {
  static async initiatePayment(input: {
    eventId: number;
    eventSlug: string;
    eventTitle: string;
    ticketTypeIds: number[];
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
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Validate team and registration
      for (const ticketTypeId of input.ticketTypeIds) {
        await RegistrationService.validateTeamAndRegistration(
          tx,
          input.eventId,
          ticketTypeId,
          input.userId,
          input.teamName,
          input.teamMembers
        );
      }

      // 2. Validate ticket types and calculate price
      let totalPrice = 0;
      let currency = 'BDT';
      const ticketNames: string[] = [];

      for (const ticketTypeId of input.ticketTypeIds) {
        const ticketType = await TicketTypeService.getTicketTypeById(ticketTypeId);
        if (!ticketType || ticketType.event_id !== input.eventId) {
          throw new Error('Invalid ticket type for this event.');
        }
        if (!ticketType.is_active) {
          throw new Error('This ticket type is no longer available.');
        }

        totalPrice += Number(ticketType.price || 0);
        currency = ticketType.currency || currency;
        ticketNames.push(ticketType.name);

        if (ticketType.capacity) {
          const soldCount = await tx.registration.count({
            where: {
              ticketTypeId,
              eventId: input.eventId,
              status: { not: 'CANCELLED' },
            },
          });
          if (soldCount >= ticketType.capacity) {
            throw new Error(`Ticket type ${ticketType.name} is sold out.`);
          }
        }
      }

      if (totalPrice <= 0) {
        throw new Error('This registration is free. Use the direct registration endpoint.');
      }

      const primaryTicketTypeId = input.ticketTypeIds.length > 0 ? input.ticketTypeIds[0] : null;

      // 3. Check event capacity
      const event = await tx.event.findUnique({
        where: { id: input.eventId },
        select: { capacity: true },
      });

      const currentCount = await tx.registration.count({
        where: { eventId: input.eventId, status: { not: 'CANCELLED' } },
      });

      if (!event || currentCount >= event.capacity) {
        throw new Error('Event is at capacity.');
      }

      // 4. Create PENDING registration
      const registration = await tx.registration.create({
        data: {
          eventId: input.eventId,
          ticketTypeId: primaryTicketTypeId,
          userId: input.userId,
          email: input.email,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          fullName: input.customerName,
          phone: input.customerPhone || null,
          jobTitle: input.jobTitle || null,
          organization: input.organization || null,
          tshirtSize: input.tshirtSize || null,
          reference: input.reference || null,
          transactionId: input.transactionId || null,
        },
      });

      const registrationId = registration.id;
      const qrToken = registration.qrToken;

      // Join table
      if (input.ticketTypeIds.length > 0) {
        await tx.registrationTicketType.createMany({
          data: input.ticketTypeIds.map((tId) => ({
            registrationId,
            ticketTypeId: tId,
          })),
          skipDuplicates: true,
        });
      }

      // Team
      if (input.teamName && primaryTicketTypeId) {
        await RegistrationService.saveTeamAndMembers(
          tx,
          input.eventId,
          primaryTicketTypeId,
          registrationId,
          input.teamName,
          input.teamMembers
        );
      }

      // Create Payment record
      const tranId = generateTranId();
      await tx.payment.create({
        data: {
          registrationId,
          eventId: input.eventId,
          ticketTypeId: primaryTicketTypeId || 1,
          tranId,
          amount: totalPrice,
          currency,
          status: 'PENDING',
        },
      });

      return { registrationId, qrToken, tranId, totalPrice, currency, ticketNames };
    });

    let gatewayUrl = 'http://localhost:3000/payment/mock-gateway';
    if (process.env.NODE_ENV !== 'test' && process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD) {
      try {
        const sslcz = getSSLCommerz();
        const successUrl = process.env.SSLCOMMERZ_SUCCESS_URL || 'http://localhost:3000/payment/success';
        const failUrl = process.env.SSLCOMMERZ_FAIL_URL || 'http://localhost:3000/payment/fail';
        const cancelUrl = process.env.SSLCOMMERZ_CANCEL_URL || 'http://localhost:3000/payment/cancel';
        const ipnUrl = process.env.SSLCOMMERZ_IPN_URL || 'http://localhost:3001/api/v1/payments/ipn';

        const sslData = {
          total_amount: result.totalPrice,
          currency: result.currency,
          tran_id: result.tranId,
          success_url: successUrl,
          fail_url: failUrl,
          cancel_url: cancelUrl,
          ipn_url: ipnUrl,
          shipping_method: 'NO',
          product_name: `${input.eventTitle} - ${result.ticketNames.join(', ')}`,
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
          value_a: result.registrationId.toString(),
          value_b: input.eventId.toString(),
          value_c: input.eventSlug,
          value_d: result.qrToken,
        };

        const apiResponse = await sslcz.init(sslData);

        if (!apiResponse?.GatewayPageURL) {
          await prisma.registration.update({ where: { id: result.registrationId }, data: { status: 'CANCELLED' } });
          await prisma.payment.update({ where: { tranId: result.tranId }, data: { status: 'FAILED' } });
          throw new Error('Failed to initialize payment gateway. Please try again.');
        }
        gatewayUrl = apiResponse.GatewayPageURL;
      } catch (err) {
        await prisma.registration.update({ where: { id: result.registrationId }, data: { status: 'CANCELLED' } });
        await prisma.payment.update({ where: { tranId: result.tranId }, data: { status: 'FAILED' } });
        throw err;
      }
    }

    return {
      gatewayUrl,
      tranId: result.tranId,
      registrationId: Number(result.registrationId),
    };
  }

  static async completePayment(payload: {
    tranId: string;
    valId?: string;
    status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
    paymentMethod?: string;
    rawResponse?: any;
  }) {
    return await prisma.$transaction(async (tx: any) => {
      const payment = await tx.payment.findUnique({
        where: { tranId: payload.tranId },
        include: {
          registration: true,
          event: { select: { title: true } },
        },
      });

      if (!payment) {
        throw new Error(`Payment record not found for transaction ID: ${payload.tranId}`);
      }

      if (payment.status === 'COMPLETED' || payment.status === 'SUCCESS') {
        return { success: true, message: 'Payment already completed previously.', payment };
      }

      if (payload.status === 'SUCCESS') {
        const updatedPayment = await tx.payment.update({
          where: { tranId: payload.tranId },
          data: {
            status: 'COMPLETED',
            valId: payload.valId || null,
            paymentMethod: payload.paymentMethod || 'SSLCOMMERZ',
            gatewayResponse: payload.rawResponse || null,
            paidAt: new Date(),
          },
        });

        await tx.registration.update({
          where: { id: payment.registrationId },
          data: {
            status: 'CONFIRMED',
            paymentStatus: 'COMPLETED',
          },
        });

        // Enqueue email confirmation
        try {
          await getEmailQueue().add(
            'sendConfirmationEmail',
            {
              email: payment.registration.email,
              eventId: payment.eventId,
              registrationId: Number(payment.registrationId),
              qrToken: payment.registration.qrToken,
            },
            { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
          );
        } catch (queueErr) {
          logger.warn({ err: queueErr }, 'Failed to queue email notification after payment completion');
        }

        return { success: true, message: 'Payment completed successfully.', payment: updatedPayment };
      } else {
        const updatedPayment = await tx.payment.update({
          where: { tranId: payload.tranId },
          data: {
            status: payload.status,
            gatewayResponse: payload.rawResponse || null,
          },
        });

        await tx.registration.update({
          where: { id: payment.registrationId },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'FAILED',
          },
        });

        return { success: false, message: `Payment ${payload.status.toLowerCase()}.`, payment: updatedPayment };
      }
    });
  }

  static async getPaymentStatus(tranId: string) {
    const payment = await prisma.payment.findUnique({
      where: { tranId },
      include: {
        registration: {
          select: { status: true, email: true, qrToken: true },
        },
      },
    });

    if (!payment) return null;

    return {
      id: payment.id,
      tranId: payment.tranId,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      paidAt: payment.paidAt,
      registrationStatus: payment.registration.status,
      email: payment.registration.email,
      qrToken: payment.registration.qrToken,
    };
  }
}
