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
  return `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're confirmed for ${eventName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; background-color: #f0f3ff; }
    table { border-collapse: collapse; }
    @media only screen and (max-width: 480px) {
      .email-card  { border-radius: 0 !important; width: 100% !important; max-width: 100% !important; }
      .header-pad  { padding: 20px 20px 16px 20px !important; }
      .body-pad    { padding: 24px 20px 8px 20px !important; }
      .cta-pad     { padding: 4px 20px 24px 20px !important; }
      .footer-pad  { padding: 20px !important; }
      .cta-btn     { display: block !important; text-align: center !important; }
      .qr-img      { width: 160px !important; height: 160px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f0f3ff;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0f3ff; padding:0;">
    <tr>
      <td align="center" valign="top" style="padding: 40px 10px;">
        <!-- Email Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="email-card" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 48px rgba(53,37,205,0.10), 0 2px 12px rgba(0,0,0,0.05);">
          
          <!-- HEADER -->
          <tr>
            <td class="header-pad" style="padding: 24px 24px 18px 24px; background-color: #3525cd; text-align: center;">
              <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 18px; font-weight: 800; color: #ffffff; margin: 0;">Ayojok</div>
              <div style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #c3c0ff; margin-top: 4px;">Powered by Rong Plan</div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td class="body-pad" style="padding: 28px 24px 8px 24px; background-color: #ffffff;">
              <p style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #00714d; margin: 0 0 10px 0;">✓ Registration confirmed</p>
              
              <h1 style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 22px; font-weight: 700; color: #111c2d; line-height: 1.3; letter-spacing: -0.3px; margin: 0 0 10px 0;">
                You're <span style="color:#3525cd;">Going</span>, ${participantName}.
              </h1>
              
              <p style="font-family: 'Inter', Arial, sans-serif; font-size: 15px; color: #464555; line-height: 1.6; font-weight: 400; margin: 0 0 20px 0;">
                You are confirmed for ${eventName}. Present the QR code below at the venue for quick check-in.
              </p>

              <!-- QR InfoCard -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0f3ff; border-radius: 12px; border: 1px solid rgba(53,37,205,0.12); margin-bottom: 16px;">
                <tr>
                  <td align="center" style="padding: 24px 20px;">
                    <div style="background-color: #ffffff; border-radius: 10px; padding: 12px; display: inline-block; border: 1px solid rgba(53,37,205,0.12);">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrToken}" width="180" height="180" class="qr-img" style="display: block; width: 180px; height: 180px;" alt="QR Code" />
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; letter-spacing: 3px; font-size: 18px; font-weight: 700; color: #111c2d; margin-top: 16px; text-transform: uppercase;">
                      ${qrToken.substring(0, 8)}
                    </div>
                    <div style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #777587; margin-top: 6px;">
                      Ticket #${ticketId} • ${ticketName}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Details InfoCard -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0f3ff; border-radius: 12px; border: 1px solid rgba(53,37,205,0.12); margin-bottom: 16px;">
                <tr>
                  <td style="padding: 18px 20px 6px 20px;">
                    <div style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; font-weight: 700; color: rgba(17,28,45,0.38); text-transform: uppercase; letter-spacing: 0.04em; padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid rgba(53,37,205,0.10);">
                      Event Details
                    </div>
                    
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="60" style="font-family: 'Inter', Arial, sans-serif; font-size: 13px; color: #777587; font-weight: 500; padding-bottom: 10px; vertical-align: top;">When</td>
                        <td style="font-family: 'Inter', Arial, sans-serif; font-size: 13px; color: #111c2d; font-weight: 600; padding-bottom: 10px; vertical-align: top;">
                          ${eventDate}<br/>${eventTime}
                        </td>
                      </tr>
                      <tr>
                        <td width="60" style="font-family: 'Inter', Arial, sans-serif; font-size: 13px; color: #777587; font-weight: 500; padding-bottom: 6px; vertical-align: top;">Where</td>
                        <td style="font-family: 'Inter', Arial, sans-serif; font-size: 13px; color: #111c2d; font-weight: 600; padding-bottom: 6px; vertical-align: top;">
                          ${eventLocation}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td class="cta-pad" align="center" style="padding: 4px 24px 28px 24px; background-color: #ffffff;">
              <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${calendarUrl}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="16%" stroke="f" fillcolor="#3525cd">
                  <w:anchorlock/>
                  <center>
                <![endif]-->
                    <a href="${calendarUrl}" class="cta-btn" style="display: inline-block; background: linear-gradient(135deg, #3525cd 0%, #4f46e5 100%); color: #ffffff; font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; letter-spacing: -0.1px;">
                      Add to Calendar
                    </a>
                <!--[if mso]>
                  </center>
                </v:roundrect>
              <![endif]-->
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="footer-pad" style="padding: 24px; background-color: #f9f9ff; border-top: 1px solid rgba(53,37,205,0.09);">
              <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #111c2d; margin-bottom: 12px;">Ayojok</div>
              
              <div style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: rgba(17,28,45,0.35); line-height: 1.6; margin-bottom: 16px;">
                Sent by Ayojok, powered by Rong Plan, on behalf of <strong style="color: rgba(17,28,45,0.55);">${organizerName}</strong>.<br/>
                ${organizerAddress}<br/><br/>
                You received this because you registered for <strong>${eventName}</strong>.<br/>
                <a href="{{unsubscribe_url}}" style="color: rgba(17,28,45,0.35); text-decoration: underline;">Unsubscribe</a>
              </div>

              <!-- Social row -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right: 16px;">
                    <a href="{{facebook_url}}"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg" width="18" height="18" alt="Facebook" style="filter: invert(0%) sepia(0%) saturate(0%) brightness(30%) contrast(100%); opacity: 0.45; border: 0; outline: none;" /></a>
                  </td>
                  <td style="padding-right: 16px;">
                    <a href="{{instagram_url}}"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg" width="18" height="18" alt="Instagram" style="filter: invert(0%) sepia(0%) saturate(0%) brightness(30%) contrast(100%); opacity: 0.45; border: 0; outline: none;" /></a>
                  </td>
                  <td style="padding-right: 16px;">
                    <a href="{{linkedin_url}}"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg" width="18" height="18" alt="LinkedIn" style="filter: invert(0%) sepia(0%) saturate(0%) brightness(30%) contrast(100%); opacity: 0.45; border: 0; outline: none;" /></a>
                  </td>
                  <td>
                    <a href="mailto:{{support_email}}"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg" width="18" height="18" alt="Email" style="filter: invert(0%) sepia(0%) saturate(0%) brightness(30%) contrast(100%); opacity: 0.45; border: 0; outline: none;" /></a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
