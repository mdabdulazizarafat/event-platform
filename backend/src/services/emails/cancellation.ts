export function getCancelEmailHtml(data: {
  event_name: string;
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
<title>Registration Cancelled — ${data.event_name}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  @media only screen and (max-width: 480px) {
    .email-card  { border-radius: 0 !important; }
    .header-pad  { padding: 20px 20px 16px 20px !important; }
    .body-pad    { padding: 24px 20px 8px 20px !important; }
    .footer-pad  { padding: 20px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#FAFAFA;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
  Your ticket for ${data.event_name} has been cancelled.
</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAFAFA;padding:0;">
<tr><td align="center" valign="top" style="padding:20px 12px;">

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-card" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 48px rgba(211,47,47,0.06),0 2px 12px rgba(0,0,0,0.04);">

    <!-- HEADER -->
    <tr>
      <td align="center" class="header-pad" style="padding:24px 24px 18px 24px;background-color:#D32F2F;">
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:18px;font-weight:800;color:#ffffff;">Ayojok</div>
        <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:11px;color:#ffcaca;margin-top:2px;">Powered by Rong Plan</div>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td class="body-pad" style="padding:28px 24px 32px 24px;background-color:#ffffff;">
        <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#D32F2F;margin:0 0 10px 0;">
          ✕ Invalidation notice
        </div>
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#0D1F15;line-height:1.3;letter-spacing:-0.3px;margin:0 0 10px 0;">
          Registration <span style="color:#D32F2F;">Cancelled</span>.
        </div>
        <p style="margin:0 0 16px 0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;color:#3D5647;line-height:1.6;font-weight:400;">
          Your registration for the event <strong style="color:#0D1F15;">${data.event_name}</strong> has been cancelled by the event host.
        </p>
        <p style="margin:0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;color:#6B7F75;line-height:1.6;">
          Your digital QR code ticket is now invalidated and cannot be used for venue check-in.
        </p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td class="footer-pad" style="padding:24px;background-color:#FAFAFA;border-top:1px solid rgba(211,47,47,0.09);">
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#0D1F15;margin-bottom:12px;">Ayojok</div>
        <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:11px;color:rgba(13,31,21,0.38);line-height:1.6;margin-bottom:16px;">
          Sent by Ayojok, powered by Rong Plan, on behalf of <strong style="color:rgba(13,31,21,0.55);">${data.organizer_name}</strong>.<br>
          ${data.organizer_address}<br><br>
          You received this because of a registration update on **Ayojok**.<br>
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
