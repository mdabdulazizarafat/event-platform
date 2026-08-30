import { Resend } from 'resend';
import { createChildLogger } from '../lib/logger';
import { getParticipantEmailHtml, getCancelEmailHtml, getOtpVerificationHtml } from './emails';

const logger = createChildLogger('email.service');

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_your_resend_api_key') {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface TicketEmailPayload {
  email: string;
  eventTitle: string;
  qrCodeUrl: string;
  participantName?: string;
  ticketCode?: string;
  ticketId?: string;
  ticketTier?: string;
  eventDate?: string;
  eventTime?: string;
  venueName?: string;
  venueAddress?: string;
}

export interface CancellationEmailPayload {
  email: string;
  eventTitle: string;
}

export class EmailService {
  private static fromEmail = process.env.RESEND_FROM_EMAIL || 'Rong Plan <onboarding@resend.dev>';

  /**
   * Sends transactional ticket confirmation email via Resend
   */
  static async sendTicketConfirmation(payload: TicketEmailPayload): Promise<void> {
    const htmlContent = getParticipantEmailHtml({
      event_name: payload.eventTitle,
      participant_name: payload.participantName || 'Guest',
      qr_code_url: payload.qrCodeUrl,
      ticket_code: payload.ticketCode || 'TICKET-CODE',
      ticket_id: payload.ticketId || '1000',
      ticket_tier: payload.ticketTier || 'General Admission',
      event_date: payload.eventDate || 'TBA',
      event_time: payload.eventTime || 'TBA',
      venue_name: payload.venueName || 'TBA',
      venue_address: payload.venueAddress || 'TBA',
      calendar_url: 'https://calendar.google.com/',
      organizer_name: 'Ayojok',
      organizer_address: 'Dhaka, Bangladesh',
      unsubscribe_url: 'https://ayojok.com/unsubscribe',
      facebook_url: 'https://facebook.com/ayojok',
      instagram_url: 'https://instagram.com/ayojok',
      linkedin_url: 'https://linkedin.com/ayojok',
      support_email: process.env.SUPPORT_EMAIL || process.env.RESEND_FROM_EMAIL || 'support@rongplan.com'
    });

    const client = getResendClient();
    if (!client) {
      logger.info({ to: payload.email, subject: `Ticket Confirmed - ${payload.eventTitle}`, qrCodeUrl: payload.qrCodeUrl }, 'Mock email sent (no Resend key)');
      return;
    }

    try {
      const { data, error } = await client.emails.send({
        from: this.fromEmail,
        to: [payload.email],
        subject: `You're confirmed for ${payload.eventTitle}`,
        html: htmlContent,
      });

      if (error) {
        throw new Error(error.message);
      }

      logger.info({ id: data?.id }, 'Resend email sent successfully');
    } catch (err: any) {
      logger.error({ err }, 'Resend delivery failed');
    }
  }

  /**
   * Sends transactional cancellation email via Resend
   */
  static async sendTicketCancellation(payload: CancellationEmailPayload): Promise<void> {
    const htmlContent = getCancelEmailHtml({
      event_name: payload.eventTitle,
      organizer_name: 'Ayojok',
      organizer_address: 'Dhaka, Bangladesh',
      unsubscribe_url: 'https://ayojok.com/unsubscribe',
      facebook_url: 'https://facebook.com/ayojok',
      instagram_url: 'https://instagram.com/ayojok',
      linkedin_url: 'https://linkedin.com/ayojok',
      support_email: process.env.SUPPORT_EMAIL || process.env.RESEND_FROM_EMAIL || 'support@rongplan.com'
    });

    const client = getResendClient();
    if (!client) {
      logger.info({ to: payload.email, subject: `Registration Cancelled - ${payload.eventTitle}` }, 'Mock cancellation email sent (no Resend key)');
      return;
    }

    try {
      const { data, error } = await client.emails.send({
        from: this.fromEmail,
        to: [payload.email],
        subject: `Registration Cancelled: ${payload.eventTitle}`,
        html: htmlContent,
      });

      if (error) {
        throw new Error(error.message);
      }

      logger.info({ id: data?.id }, 'Resend cancellation email sent successfully');
    } catch (err: any) {
      logger.error({ err }, 'Resend delivery failed');
    }
  }

  /**
   * Sends OTP verification code email via Resend
   */
  static async sendVerificationCode(email: string, code: string, purpose: 'SIGNUP' | 'PASSWORD_RESET'): Promise<void> {
    const purposeText = purpose === 'SIGNUP' ? 'verify your email and complete your registration' : 'reset your password';
    const htmlContent = getOtpVerificationHtml({
      otp_code: code,
      purpose_text: purposeText,
      support_email: process.env.SUPPORT_EMAIL || process.env.RESEND_FROM_EMAIL || 'support@rongplan.com'
    });

    const client = getResendClient();
    const subject = purpose === 'SIGNUP' ? 'Verify your Ayojok Account' : 'Reset your Ayojok Password';

    if (!client) {
      logger.info({ to: email, subject, code }, 'Mock OTP email sent (no Resend key)');
      return;
    }

    try {
      const { data, error } = await client.emails.send({
        from: this.fromEmail,
        to: [email],
        subject,
        html: htmlContent,
      });

      if (error) {
        throw new Error(error.message);
      }

      logger.info({ id: data?.id, to: email, purpose }, 'Resend OTP email sent successfully');
    } catch (err: any) {
      logger.error({ err }, 'Resend OTP delivery failed');
    }
  }
}

