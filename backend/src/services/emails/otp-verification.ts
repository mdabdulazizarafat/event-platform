export function getOtpVerificationHtml(data: {
  otp_code: string;
  purpose_text: string;
  support_email: string;
}) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<title>Your Verification Code</title>
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
  Your verification code is ${data.otp_code}.
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
      <td class="body-pad" style="padding:32px 32px 24px 32px;">
        <h1 style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#0D1F15;line-height:1.3;letter-spacing:-0.3px;margin:0 0 10px 0;text-align:center;">
          Verification <span style="color:#2BA361;">Code</span>
        </h1>
        <p style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;color:#3D5647;line-height:1.6;margin:0 0 24px 0;text-align:center;">
          Use the 6-digit code below to ${data.purpose_text}. This code will expire in 10 minutes.
        </p>
        
        <div style="background-color:#F4F4F5;border:1px solid rgba(43,163,97,0.15);border-radius:12px;padding:24px;text-align:center;margin:0 0 24px 0;">
          <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:32px;font-weight:800;letter-spacing:6px;color:#0D1F15;">
            ${data.otp_code}
          </div>
        </div>

        <p style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;color:#6B7F75;line-height:1.5;margin:0;text-align:center;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td class="footer-pad" align="center" style="padding:24px 32px;background-color:#FAFAFA;border-top:1px solid rgba(43,163,97,0.09);">
        <p style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:11px;color:#6B7F75;line-height:1.6;margin:0 0 16px 0;">
          &copy; ${new Date().getFullYear()} Rong Plan. All rights reserved.<br>
          Dhaka, Bangladesh
        </p>
        <div style="margin-bottom:0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
              <td style="padding:0 8px;">
                <a href="mailto:${data.support_email}"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg" width="18" height="18" alt="Email" style="filter: invert(0%) sepia(0%) saturate(0%) brightness(30%) contrast(100%); opacity: 0.45; border: 0; outline: none;" /></a>
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  </table>

</td></tr>
</table>
</body>
</html>`;
}
