export function getReminderEmailHtml(data: {
  event_name: string;
  participant_name: string;
  countdown_days: number;
  countdown_label: string;
  event_date: string;
  event_time: string;
  gate_time: string;
  venue_name: string;
  venue_address: string;
  directions_url: string;
  ticket_id: string;
  ticket_url: string;
  event_details_url: string;
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
<title>${data.event_name} is ${data.countdown_days} days away</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  @media only screen and (max-width: 480px) {
    .email-card  { border-radius: 0 !important; }
    .header-pad  { padding: 20px 20px 16px 20px !important; }
    .body-pad    { padding: 24px 20px 8px 20px !important; }
    .cta-pad     { padding: 4px 20px 24px 20px !important; }
    .footer-pad  { padding: 20px !important; }
    .cta-btn     { display: block !important; text-align: center !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#FAFAFA;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
  ${data.countdown_days} days to go until ${data.event_name}. Here's what to know.
</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAFAFA;padding:0;">
<tr><td align="center" valign="top" style="padding:20px 12px;">

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-card" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 48px rgba(43,163,97,0.06),0 2px 12px rgba(0,0,0,0.04);">

    <!-- HEADER -->
    <tr>
      <td align="center" class="header-pad" style="padding:24px 24px 18px 24px;background-color:#2BA361;">
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:18px;font-weight:800;color:#ffffff;">Ayojok</div>
        <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:11px;color:#c5ebd5;margin-top:2px;">Powered by Rong Plan</div>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td class="body-pad" style="padding:28px 24px 8px 24px;background-color:#ffffff;">
        <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#f7bb16;margin:0 0 10px 0;">
          ${data.countdown_label} · ${data.countdown_days} days to go
        </div>
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#0D1F15;line-height:1.3;letter-spacing:-0.3px;margin:0 0 10px 0;">
          Almost <span style="color:#2BA361;">Time</span>, ${data.participant_name}.
        </div>
        <p style="margin:0 0 20px 0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;color:#3D5647;line-height:1.6;font-weight:400;">
          A quick refresher on <strong style="color:#0D1F15;">${data.event_name}</strong> so the day goes smoothly.
        </p>

        <!-- Event details InfoCard -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
          style="background-color:#FAFAFA;border-radius:12px;border:1px solid rgba(43,163,97,0.15);margin-bottom:16px;">
          <tr>
            <td style="padding:18px 20px 6px 20px;">
              <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:rgba(13,31,21,0.38);text-transform:uppercase;letter-spacing:0.04em;padding-bottom:10px;margin-bottom:12px;border-bottom:1px solid rgba(43,163,97,0.09);">
                Event Details
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="60" style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;color:#6B7F75;font-weight:500;vertical-align:top;padding-bottom:10px;">When:</td>
                  <td style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;color:#0D1F15;font-weight:600;vertical-align:top;padding-bottom:10px;">${data.event_date} · ${data.event_time}</td>
                </tr>
                <tr>
                  <td width="60" style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;color:#6B7F75;font-weight:500;vertical-align:top;padding-bottom:10px;">Gates:</td>
                  <td style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;color:#0D1F15;font-weight:600;vertical-align:top;padding-bottom:10px;">Open at ${data.gate_time}</td>
                </tr>
                <tr>
                  <td width="60" style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;color:#6B7F75;font-weight:500;vertical-align:top;padding-bottom:6px;">Where:</td>
                  <td style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;color:#0D1F15;font-weight:600;vertical-align:top;padding-bottom:6px;">
                    ${data.venue_name}, ${data.venue_address}<br>
                    <a href="${data.directions_url}" style="color:#2BA361;font-weight:700;text-decoration:none;">Get directions →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Ticket reminder strip -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
          style="border:1px solid rgba(43,163,97,0.15);border-radius:12px;margin-bottom:16px;">
          <tr>
            <td style="padding:16px 18px;">
              <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#0D1F15;">Your entry QR code</div>
              <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:12px;color:#6B7F75;margin:2px 0 10px 0;">Ticket #${data.ticket_id} · have it ready at the door</div>
              <a href="${data.ticket_url}" style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#2BA361;text-decoration:none;">View Ticket →</a>
            </td>
          </tr>
        </table>

        <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:rgba(13,31,21,0.38);text-transform:uppercase;letter-spacing:0.04em;margin:0 0 8px 0;">
          What to bring
        </div>
        <p style="margin:0 0 4px 0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;color:#3D5647;line-height:1.6;">
          Photo ID · QR ticket · charged phone
        </p>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td class="cta-pad" style="padding:20px 24px 28px 24px;background-color:#ffffff;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
          href="${data.event_details_url}" style="height:48px;v-text-anchor:middle;width:230px;" arcsize="16%" stroke="f" fillcolor="#2BA361">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:Inter,sans-serif;font-size:14px;font-weight:700;">View Full Event Details</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="${data.event_details_url}" class="cta-btn" style="display:inline-block;background:linear-gradient(135deg,#2BA361 0%,#4dc487 100%);color:#ffffff;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:-0.1px;">View Full Event Details</a>
        <!--<![endif]-->
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td class="footer-pad" style="padding:24px;background-color:#FAFAFA;border-top:1px solid rgba(43,163,97,0.09);">
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#0D1F15;margin-bottom:12px;">Ayojok</div>
        <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:11px;color:rgba(13,31,21,0.38);line-height:1.6;margin-bottom:16px;">
          Sent by Ayojok, powered by Rong Plan, on behalf of <strong style="color:rgba(13,31,21,0.55);">${data.organizer_name}</strong>.<br>
          ${data.organizer_address}<br><br>
          You received this because you're registered for <strong style="color:rgba(13,31,21,0.55);">${data.event_name}</strong>, happening soon.<br>
          <a href="${data.unsubscribe_url}" style="color:rgba(13,31,21,0.38);text-decoration:underline;">Unsubscribe</a>
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-right:16px;vertical-align:middle;">
              <a href="${data.facebook_url}" style="text-decoration:none;display:inline-block;line-height:0;">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg" width="18" height="18" alt="Facebook" style="display:block;filter:invert(0%) sepia(0%) saturate(0%) brightness(30%) contrast(100%);opacity:0.45;">
              </a>
            </td>
            <td style="padding-right:16px;vertical-align:middle;">
              <a href="${data.instagram_url}" style="text-decoration:none;display:inline-block;line-height:0;">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg" width="18" height="18" alt="Instagram" style="display:block;filter:invert(0%) sepia(0%) saturate(0%) brightness(30%) contrast(100%);opacity:0.45;">
              </a>
            </td>
            <td style="padding-right:16px;vertical-align:middle;">
              <a href="${data.linkedin_url}" style="text-decoration:none;display:inline-block;line-height:0;">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg" width="18" height="18" alt="LinkedIn" style="display:block;filter:invert(0%) sepia(0%) saturate(0%) brightness(30%) contrast(100%);opacity:0.45;">
              </a>
            </td>
            <td style="vertical-align:middle;">
              <a href="mailto:${data.support_email}" style="text-decoration:none;display:inline-block;line-height:0;">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg" width="18" height="18" alt="Email" style="display:block;filter:invert(0%) sepia(0%) saturate(0%) brightness(30%) contrast(100%);opacity:0.45;">
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}


