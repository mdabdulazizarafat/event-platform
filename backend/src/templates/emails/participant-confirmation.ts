export const ParticipantConfirmationEmail = ({
  participantName,
  eventName,
  eventDate,
  eventTime,
  eventLocation,
  ticketName,
  ticketId,
  qrToken,
  organizerName,
  organizerAddress,
  calendarUrl,
}: {
  participantName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketName: string;
  ticketId: string;
  qrToken: string;
  organizerName: string;
  organizerAddress: string;
  calendarUrl: string;
}) => {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>You're confirmed for ${eventName} — Bangla Innovator</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @media only screen and (max-width: 600px) {
      .email-card  { border-radius: 0 !important; }
      .header-pad  { padding: 28px 20px 18px 20px !important; }
      .body-pad    { padding: 24px 20px 8px 20px !important; }
      .cta-pad     { padding: 16px 20px 28px 20px !important; }
      .footer-pad  { padding: 28px 20px 28px 20px !important; }
      .cta-btn     { display: block !important; text-align: center !important; }
      h1           { font-size: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#FAFAFA;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAFAFA;padding:0;">
<tr><td align="center" valign="top" style="padding-top: 40px; padding-bottom: 40px;">

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-card" style="max-width:560px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);">

    <!-- HEADER -->
    <tr>
      <td align="center" class="header-pad" style="padding:32px 40px 20px 40px;background-color:#FAFAFA;">
        <img src="https://placehold.co/130x40/2BA361/FFF?text=Bangla+Innovator" alt="Bangla Innovator" width="130" style="height:auto;max-width:130px;display:block;margin:0 auto;">
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td class="body-pad" style="padding:32px 32px 8px 32px;background-color:#ffffff;">
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:30px;font-weight:700;color:#0d0e13;line-height:1.15;letter-spacing:-0.02em;margin:0 0 12px 0;">
          You're <span style="color:#2BA361;">Confirmed</span>, ${participantName}.
        </div>
        <p style="margin:0 0 24px 0;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:15px;color:rgba(13,14,19,0.58);line-height:1.6;font-weight:400;">
          You are confirmed for ${eventName}. Present the QR code below at the venue for quick check-in.
        </p>
        
        <!-- InfoCard for QR and Event Details -->
        <div style="background-color:#FAFAFA;border-radius:8px;border:1px solid rgba(43,163,97,0.15);margin-bottom:4px;padding:18px 20px 6px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="center" style="padding-bottom: 20px; border-bottom: 1px solid rgba(43,163,97,0.15);">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrToken}" width="160" height="160" style="display:block;border-radius:8px;border:1px solid rgba(43,163,97,0.15);" alt="QR Code" />
                <div style="font-family:monospace;letter-spacing:3px;font-size:16px;font-weight:700;color:#0d0e13;margin-top:12px;text-transform:uppercase;">
                  ${qrToken.substring(0, 8)}
                </div>
                <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:13px;color:rgba(13,14,19,0.58);margin-top:4px;">
                  Ticket #${ticketId} • ${ticketName}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 20px; padding-bottom: 14px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td width="60" style="font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:13px;color:rgba(13,14,19,0.58);font-weight:500;padding-bottom:10px;vertical-align:top;">When</td>
                    <td style="font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:13px;color:#0d0e13;font-weight:600;padding-bottom:10px;vertical-align:top;">
                      ${eventDate}<br/>${eventTime}
                    </td>
                  </tr>
                  <tr>
                    <td width="60" style="font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:13px;color:rgba(13,14,19,0.58);font-weight:500;padding-bottom:6px;vertical-align:top;">Where</td>
                    <td style="font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:13px;color:#0d0e13;font-weight:600;padding-bottom:6px;vertical-align:top;">
                      ${eventLocation}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td class="cta-pad" align="center" style="padding:20px 32px 32px 32px;background-color:#ffffff;">
        <a href="${calendarUrl}" class="cta-btn" style="display:inline-block;background-color:#2BA361;color:#ffffff;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:6px;">
          Add to Calendar
        </a>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td class="footer-pad" style="padding:32px;background-color:#FAFAFA;border-top:1px solid rgba(43,163,97,0.15);">
        <img src="https://placehold.co/90x30/2BA361/FFF?text=BI" alt="Bangla Innovator" width="90" style="height:auto;max-width:90px;display:block;margin-bottom:14px;">
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:12px;color:rgba(13,14,19,0.30);line-height:1.7;margin-bottom:20px;">
          &copy; 2026 <strong style="color:rgba(13,14,19,0.42);">Bangla Innovator</strong>. All rights reserved.<br>
          Dhaka, Bangladesh.<br><br>
          Sent by Bangla Innovator on behalf of <strong style="color:rgba(13,14,19,0.55);">${organizerName}</strong>.<br/>
          ${organizerAddress}<br/><br/>
          You received this because you registered for <strong>${eventName}</strong>.<br/>
          <a href="{{unsubscribe_url}}" style="color:rgba(13,14,19,0.30);text-decoration:underline;">Unsubscribe</a>
        </div>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
};
