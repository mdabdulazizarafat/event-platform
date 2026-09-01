export const WelcomeEmail = ({
  userName,
  dashboardUrl,
}: {
  userName: string;
  dashboardUrl: string;
}) => {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Welcome to Ayojok</title>
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
        <img src="https://ayojok.rongplan.com/ayojokLogo.png" alt="Ayojok" width="130" style="height:auto;max-width:130px;display:block;margin:0 auto;">
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td class="body-pad" style="padding:32px 32px 8px 32px;background-color:#ffffff;">
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:30px;font-weight:700;color:#0d0e13;line-height:1.15;letter-spacing:-0.02em;margin:0 0 12px 0;">
          Welcome to <span style="color:#2BA361;">Ayojok</span>, ${userName}.
        </div>
        <p style="margin:0 0 24px 0;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:15px;color:rgba(13,14,19,0.58);line-height:1.6;font-weight:400;">
          We're excited to have you on board. Start exploring events, managing registrations, and connecting with the community.
        </p>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td class="cta-pad" align="center" style="padding:20px 32px 32px 32px;background-color:#ffffff;">
        <a href="${dashboardUrl}" class="cta-btn" style="display:inline-block;background-color:#2BA361;color:#ffffff;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:6px;">
          Get Started
        </a>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td class="footer-pad" style="padding:32px;background-color:#FAFAFA;border-top:1px solid rgba(43,163,97,0.15);">
        <img src="https://ayojok.rongplan.com/ayojokLogo.png" alt="Ayojok" width="90" style="height:auto;max-width:90px;display:block;margin-bottom:14px;">
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:12px;color:rgba(13,14,19,0.30);line-height:1.7;margin-bottom:20px;">
          &copy; 2026 <strong style="color:rgba(13,14,19,0.42);">Ayojok</strong>. All rights reserved.<br>
          Dhaka, Bangladesh.<br><br>
          You are receiving this email because you recently created a new account on our platform.
        </div>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
};


