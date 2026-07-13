import { Resend } from 'resend';

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
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 24px; color: #111c2d; max-width: 600px; margin: 0 auto; border: 1px solid #c7c4d8; border-radius: 16px;">
        <h2 style="color: #3525cd; font-family: 'Plus Jakarta Sans', sans-serif;">Your Ticket is Confirmed!</h2>
        <p>Thank you for registering for <strong>${payload.eventTitle}</strong>.</p>
        <p>Here is your digital entry pass QR code. Present it at check-in:</p>
        <div style="margin: 24px 0; text-align: center;">
          <img src="${payload.qrCodeUrl}" alt="Check-in QR Code" style="width: 200px; height: 200px; border: 4px solid #3525cd; border-radius: 12px; padding: 8px; background: white;" />
        </div>
        <hr style="border: 0; border-top: 1px solid #c7c4d8; margin: 24px 0;" />
        <p style="font-size: 11px; color: #464555;">Best regards,<br/>Rong Plan Event Infrastructure Team</p>
      </div>
    `;

    const client = getResendClient();
    if (!client) {
      console.warn(`[MOCK EMAIL] To: ${payload.email} | Subject: Ticket Confirmed - ${payload.eventTitle}`);
      console.log(`[MOCK EMAIL] QR Code Link: ${payload.qrCodeUrl}`);
      return;
    }

    try {
      const { data, error } = await client.emails.send({
        from: this.fromEmail,
        to: [payload.email],
        subject: `Your Ticket: ${payload.eventTitle}`,
        html: htmlContent,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log(`Resend email sent successfully: ${data?.id}`);
    } catch (err: any) {
      console.error('Resend delivery failed, falling back to log warning:', err.message);
    }
  }

  /**
   * Sends transactional cancellation email via Resend
   */
  static async sendTicketCancellation(payload: CancellationEmailPayload): Promise<void> {
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 24px; color: #111c2d; max-width: 600px; margin: 0 auto; border: 1px solid #ff4d4d; border-radius: 16px;">
        <h2 style="color: #ff4d4d; font-family: 'Plus Jakarta Sans', sans-serif;">Registration Cancelled</h2>
        <p>This is to inform you that your registration for the event <strong>${payload.eventTitle}</strong> has been cancelled by the organizer.</p>
        <p>As a result, your digital ticket QR code is now invalidated and cannot be used for entry.</p>
        <hr style="border: 0; border-top: 1px solid #c7c4d8; margin: 24px 0;" />
        <p style="font-size: 11px; color: #464555;">Best regards,<br/>Rong Plan Event Infrastructure Team</p>
      </div>
    `;

    const client = getResendClient();
    if (!client) {
      console.warn(`[MOCK EMAIL] To: ${payload.email} | Subject: Registration Cancelled - ${payload.eventTitle}`);
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

      console.log(`Resend cancellation email sent successfully: ${data?.id}`);
    } catch (err: any) {
      console.error('Resend delivery failed, falling back to log warning:', err.message);
    }
  }
}

