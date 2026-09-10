export function getParticipantEmailHtml(data: {
  event_name: string;
  participant_name: string;
  qr_code_url: string;
  ticket_code: string;
  ticket_id: string;
  ticket_tier: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  venue_address: string;
  calendar_url: string;
  organizer_name: string;
  organizer_address: string;
  unsubscribe_url: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  support_email: string;
}) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>You're confirmed - ${data.event_name} - Somavesh</title>
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

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
  Your spot at ${data.event_name} is confirmed. Your entry QR code is inside.
</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAFAFA;padding:0;">
<tr><td align="center" valign="top" style="padding-top: 40px; padding-bottom: 40px;">

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-card" style="max-width:560px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);">

    <!-- HEADER -->
    <tr>
      <td align="center" class="header-pad" style="padding:32px 40px 20px 40px;background-color:#FAFAFA;">
        <img src="https://image.somavesh.com/SomaveshLogo.png" alt="Somavesh" height="80" style="width:auto;max-height:80px;display:block;margin:0 auto;">
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td class="body-pad" style="padding:32px 32px 8px 32px;background-color:#ffffff;">
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:30px;font-weight:700;color:#0d0e13;line-height:1.15;letter-spacing:-0.02em;margin:0 0 12px 0;">
          You're <span style="color:#2BA361;">Going</span>
        </div>
        <p style="margin:0 0 24px 0;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:15px;color:rgba(13,14,19,0.58);line-height:1.6;font-weight:400;">
          Hi ${data.participant_name},<br/><br/>
          Your spot at <strong style="color:#0d0e13;">${data.event_name}</strong> is locked in. Show the QR code below at the door.
        </p>

        <!-- QR Code InfoCard -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAFAFA;border-radius:8px;border:1px solid rgba(43,163,97,0.15);margin-bottom:16px;">
          <tr>
            <td align="center" style="padding:22px 20px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                <tr>
                  <td style="padding:12px;">
                    <img class="qr-img" src="${data.qr_code_url}" width="180" height="180" alt="Your entry QR code" style="display:block;width:180px;height:180px;">
                  </td>
                </tr>
              </table>
              <div style="font-family:'Courier New',monospace;font-size:22px;font-weight:700;letter-spacing:4px;color:#0d0e13;margin-top:16px;">
                ${data.ticket_code}
              </div>
              <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:13px;color:rgba(13,14,19,0.58);margin-top:6px;font-weight:500;">
                Ticket #${data.ticket_id} • ${data.ticket_tier}
              </div>
            </td>
          </tr>
        </table>

        <!-- Event Details InfoCard -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAFAFA;border-radius:8px;border:1px solid rgba(43,163,97,0.15);margin-bottom:4px;">
          <tr>
            <td style="padding:18px 20px 6px 20px;">
              <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:rgba(13,14,19,0.32);text-transform:uppercase;letter-spacing:1.5px;padding-bottom:12px;margin-bottom:14px;border-bottom:1px solid rgba(43,163,97,0.15);">
                Event Details
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="60" style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:14px;color:rgba(13,14,19,0.38);font-weight:500;vertical-align:top;padding-bottom:10px;">When:</td>
                  <td style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:14px;color:#0d0e13;font-weight:600;vertical-align:top;padding-bottom:10px;">${data.event_date} - ${data.event_time}</td>
                </tr>
                <tr>
                  <td width="60" style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:14px;color:rgba(13,14,19,0.38);font-weight:500;vertical-align:top;padding-bottom:6px;">Where:</td>
                  <td style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:14px;color:#0d0e13;font-weight:600;vertical-align:top;padding-bottom:6px;">${data.venue_name}, ${data.venue_address}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td class="cta-pad" style="padding:20px 32px 32px 32px;background-color:#ffffff;">
        <a href="${data.calendar_url}" class="cta-btn" style="display:inline-block;background-color:#2BA361;color:#ffffff;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:6px;">Add to Calendar</a>
        <p style="margin:20px 0 0 0;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:13px;color:rgba(13,14,19,0.50);line-height:1.6;">
          This QR code is unique to you - please don't forward this email. Bring a photo ID matching your registration name.
        </p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td class="footer-pad" style="padding:32px;background-color:#FAFAFA;border-top:1px solid rgba(43,163,97,0.15);">
        <img src="https://image.somavesh.com/SomaveshLogo.png" alt="Somavesh" height="60" style="width:auto;max-height:60px;display:block;margin-bottom:14px;">
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:12px;color:rgba(13,14,19,0.30);line-height:1.7;margin-bottom:20px;">
          &copy; ${new Date().getFullYear()} <strong style="color:rgba(13,14,19,0.42);">Somavesh</strong>. All rights reserved.<br>
          Dhaka, Bangladesh.<br><br>
          You received this because you registered for <strong style="color:rgba(13,14,19,0.42);">${data.event_name}</strong>.
        </div>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}


