export function getOtpVerificationHtml(data: {
  otp_code: string;
  purpose_text: string;
  support_email: string;
}) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Verify your Somavesh email - Somavesh</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
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
      Your verification code is ${data.otp_code}.
    </div>
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      border="0"
      width="100%"
      style="background-color:#FAFAFA;padding:0;"
    >
      <tr>
        <td align="center" valign="top" style="padding-top: 40px; padding-bottom: 40px;">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
            class="email-card"
            style="max-width:560px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);"
          >
            <!-- HEADER -->
            <tr>
              <td align="center" class="header-pad" style="padding:32px 40px 20px 40px;background-color:#FAFAFA;">
                <img src="https://image.somavesh.com/SomaveshLogo.png" alt="Somavesh" height="80" style="width:auto;max-height:80px;display:block;margin:0 auto;">
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td class="body-pad" style="padding:32px 32px 8px 32px;background-color:#ffffff;">
                <div
                  style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:30px;font-weight:700;color:#0d0e13;line-height:1.15;letter-spacing:-0.02em;margin:0 0 12px 0;"
                >
                  Verify Your <span style="color:#2BA361;">Email</span>
                </div>
                <p
                  style="margin:0 0 24px 0;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:15px;color:rgba(13,14,19,0.58);line-height:1.6;font-weight:400;"
                >
                  Hi there,<br /><br />
                  Thank you for joining Somavesh. To ${data.purpose_text}, please
                  use the 6-digit verification code below. This code will expire in <strong>10 minutes</strong>.
                </p>

                <table
                  role="presentation"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  width="100%"
                  style="background-color:#FAFAFA;border-radius:8px;border:1px solid rgba(43,163,97,0.15);margin-bottom:4px;"
                >
                  <tr>
                    <td style="padding:18px 20px 6px 20px;">
                      <div
                        style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:rgba(13,14,19,0.32);text-transform:uppercase;letter-spacing:1.5px;padding-bottom:12px;margin-bottom:14px;border-bottom:1px solid rgba(43,163,97,0.15);"
                      >
                        Security Notice
                      </div>
                      <p
                        style="margin:0 0 12px 0;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:14px;color:#0d0e13;font-weight:500;line-height:1.6;"
                      >
                        If you didn't request this code, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CODE BLOCK -->
            <tr>
              <td class="cta-pad" align="center" style="padding:20px 32px 32px 32px;background-color:#ffffff;">
                <div
                  style="display:inline-block;background-color:#FAFAFA;color:#2BA361;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:32px;font-weight:700;letter-spacing:6px;padding:16px 40px;border-radius:8px;border:2px dashed #2BA361;"
                >
                  ${data.otp_code}
                </div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td
                class="footer-pad"
                style="padding:32px;background-color:#FAFAFA;border-top:1px solid rgba(43,163,97,0.15);"
              >
                <img src="https://image.somavesh.com/SomaveshLogo.png" alt="Somavesh" height="60" style="width:auto;max-height:60px;display:block;margin-bottom:14px;">
                <div
                  style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:12px;color:rgba(13,14,19,0.30);line-height:1.7;margin-bottom:20px;"
                >
                  &copy; ${new Date().getFullYear()} <strong style="color:rgba(13,14,19,0.42);">Somavesh</strong>. All rights
                  reserved.<br />
                  Dhaka, Bangladesh.<br /><br />
                  You received this because an account registration or password reset was requested for
                  <strong>Somavesh</strong> using this email.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}


