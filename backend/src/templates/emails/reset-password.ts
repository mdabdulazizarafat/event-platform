export const ResetPasswordEmail = ({
  userName,
  verificationCode,
  resetUrl,
}: {
  userName: string;
  verificationCode: string;
  resetUrl?: string;
}) => {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Reset Your Password — Ayojok</title>
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
        <img src="https://ayojok.rongplan.com/ayojok-logo.svg" alt="Ayojok" width="130" style="height:auto;max-width:130px;display:block;margin:0 auto;">
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td class="body-pad" style="padding:32px 32px 8px 32px;background-color:#ffffff;">
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:30px;font-weight:700;color:#0d0e13;line-height:1.15;letter-spacing:-0.02em;margin:0 0 12px 0;">
          Reset <span style="color:#2BA361;">Password</span>
        </div>
        <p style="margin:0 0 24px 0;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:15px;color:rgba(13,14,19,0.58);line-height:1.6;font-weight:400;">
          Hi ${userName},<br/>We received a request to reset your password. Use the verification code below to complete the process.
        </p>

        <!-- InfoCard for Verification Code -->
        <div style="background-color:#FAFAFA;border-radius:8px;border:1px solid rgba(43,163,97,0.15);margin-bottom:4px;padding:18px 20px 18px 20px;text-align:center;">
          <div style="font-family:monospace;letter-spacing:8px;font-size:32px;font-weight:700;color:#0d0e13;">
            ${verificationCode}
          </div>
        </div>
        <p style="margin:24px 0 0 0;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:13px;color:rgba(13,14,19,0.58);line-height:1.6;font-weight:400;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </td>
    </tr>

    <!-- CTA (Optional if using code) -->
    ${resetUrl ? `
    <tr>
      <td class="cta-pad" align="center" style="padding:20px 32px 32px 32px;background-color:#ffffff;">
        <a href="${resetUrl}" class="cta-btn" style="display:inline-block;background-color:#2BA361;color:#ffffff;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:6px;">
          Reset Password
        </a>
      </td>
    </tr>
    ` : ''}

    <!-- FOOTER -->
    <tr>
      <td class="footer-pad" style="padding:32px;background-color:#FAFAFA;border-top:1px solid rgba(43,163,97,0.15);">
        <img src="https://ayojok.rongplan.com/ayojok-logo.svg" alt="Ayojok" width="90" style="height:auto;max-width:90px;display:block;margin-bottom:14px;">
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:12px;color:rgba(13,14,19,0.30);line-height:1.7;margin-bottom:20px;">
          &copy; 2026 <strong style="color:rgba(13,14,19,0.42);">Ayojok</strong>. All rights reserved.<br>
          Dhaka, Bangladesh.<br><br>
          You received this email because a password reset was requested for your account.
        </div>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
};


