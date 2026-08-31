---
name: ayojok-email
description: >
  Generate production-ready Ayojok transactional HTML email templates that
  strictly conform to the Ayojok design system (Luminous Precision). Use this skill whenever the
  user asks to create, write, build, or update any Ayojok email — including
  welcome, password reset, account deletion, profile approval, notification,
  or any other transactional email for the Ayojok platform. Also trigger
  when the user says "email template", "transactional email", or references
  Ayojok emails in any context. Do NOT generate Ayojok emails without
  consulting this skill first — the brand specs are precise and must be
  followed exactly.
---

# Ayojok Email Template Skill

You are generating HTML email templates for **Ayojok** — a premium event management platform powered by Rong Plan. Every template must be pixel-perfect against
the canonical design system below. No deviation is allowed.

---

## Brand Identity

- **Tone:** High-end editorial, airy, intentional, quiet. Minimalist and tech-forward.
- **Subject lines:** Max 6–10 words, outcome-focused.
- **CTA text:** Minimal — "Log In" / "Reset Password" / "Get Started" / "View Profile"

---

## Assets

| Asset | Value |
|---|---|
| Logo URL | `https://ayojok.com/ayojokLogo.svg` (or fallback to `https://image.banglainnovator.com/logo/black-logo-36f83cd2-ad3a-4a82-bda0-5d79920820b8.svg`) |
| Header logo width | `130px` |
| Footer logo width | `90px` |
| Support email | `support@ayojok.com` |
| Office address | `Dhaka, Bangladesh` |
| Social — Facebook | `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg` · link: `https://facebook.com/ayojok` |
| Social — LinkedIn | `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg` · link: `https://linkedin.com/company/ayojok` |
| Social — Instagram | `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg` · link: `https://instagram.com/ayojok` |
| Social — Gmail | `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg` · link: `mailto:support@ayojok.com` |
| Fonts | Plus Jakarta Sans (headlines) + Inter (body/labels) via Google Fonts |

---

## Brand Colors (Luminous Precision)

| Token | Value |
|---|---|
| Primary | `#2BA361` |
| Secondary Glow | `#4dc487` |
| Surface | `#FAFAFA` |
| Surface Soft | `#F4F4F5` |
| Elevated | `#ffffff` |
| Text Primary | `#0D1F15` |
| Text Muted | `rgba(13,31,21,0.58)` |
| Text Faint | `rgba(13,31,21,0.38)` |
| Text Label | `rgba(13,31,21,0.32)` |
| Text Footer | `rgba(13,31,21,0.30)` |
| Text Footer Bold | `rgba(13,31,21,0.42)` |
| Border Subtle | `rgba(43,163,97,0.09)` |
| Border Card | `rgba(43,163,97,0.15)` |

---

## Layout Specifications

### Outer Wrapper
```html
<table role="presentation" cellpadding="0" cellspacing="0" border="0"
  width="100%" style="background-color:#FAFAFA;padding:0;">
  <tr><td align="center" valign="top">
    <!-- EMAIL CARD inside here -->
  </td></tr>
</table>
```

### Email Card
```
max-width: 560px
background-color: #ffffff
border-radius: 16px
overflow: hidden
box-shadow: 0 20px 48px rgba(43,163,97,0.06), 0 2px 12px rgba(0,0,0,0.04)
```

### Section Order
1. **HEADER** — logo on surface bg
2. **BODY** — H1 + paragraph + optional InfoCard
3. **CTA** — button (omit section if no CTA)
4. **FOOTER** — logo + legal + social icons

All sections are `<tr><td>` inside the card table. Use `role="presentation"` on
all tables.

---

## Section Specs

### HEADER
```
padding: 32px 40px 20px 40px
background-color: #FAFAFA
border-bottom: 1px solid rgba(43,163,97,0.09)
Logo: width=130, centered (margin:0 auto), display:block
Mobile class header-pad → 28px 20px 18px 20px
```

### BODY
```
padding: 24px 32px 8px 32px   ← Welcome / Account Deleted
padding: 32px 32px 8px 32px   ← Password Reset / security-type emails
background-color: #ffffff
```

**H1 style:**
```css
font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;
font-size: 30px; font-weight: 700; color: #0D1F15;
line-height: 1.15; letter-spacing: -0.8px; margin: 0 0 12px 0;
```
Always place the **key action word** in a `<span style="color:#2BA361;">`.
Examples: Welcome **Aboard**, Reset Your **Password**, Account **Deleted**,
Profile **Approved**.

**Body paragraph style:**
```css
font-family: 'Inter', Arial, Helvetica, sans-serif;
font-size: 15px; color: rgba(13,31,21,0.58); line-height: 1.7; font-weight: 400;
margin: 0 0 24px 0;
```

### InfoCard (optional — use when showing structured data rows)
```
background-color: #FAFAFA
border-radius: 12px
border: 1px solid rgba(43,163,97,0.15)
margin-bottom: 4px
inner padding: 18px 20px 6px 20px
```

**Card header label:**
```css
font-family: 'Inter'; font-size: 10px; font-weight: 700;
color: rgba(13,31,21,0.32); text-transform: uppercase; letter-spacing: 1.5px;
padding-bottom: 12px; margin-bottom: 14px;
border-bottom: 1px solid rgba(43,163,97,0.09);
```

**Data rows** (label + value):
```
Label col: width=60, Inter 14px, color rgba(13,31,21,0.38), weight 500
Value col: Inter 14px, color #0D1F15, weight 600
Row padding-bottom: 10px (non-last), 6px (last)
```

### CTA Section
```
padding: 20px 32px 32px 32px   ← standard
padding: 20px 32px 36px 32px   ← password reset
background-color: #ffffff
```

**Button:**
```css
display: inline-block;
background: linear-gradient(135deg, #2BA361 0%, #4dc487 100%);
color: #ffffff;
font-family: 'Plus Jakarta Sans', 'Inter', Arial, Helvetica, sans-serif;
font-size: 15px; font-weight: 600;
text-decoration: none;
padding: 14px 40px;
border-radius: 10px;
letter-spacing: -0.1px;
```

Always include **VML fallback** for Outlook (arcsize 19%, fillcolor #2BA361).
Mobile class `cta-btn` → `display:block; text-align:center`.

### FOOTER
```
padding: 32px (all sides)
background-color: #FAFAFA
border-top: 1px solid rgba(43,163,97,0.09)
```

Footer logo: width=90, display:block, margin-bottom:14px

**Legal block:**
```css
font-family: 'Plus Jakarta Sans', 'Inter', Arial, Helvetica, sans-serif; font-size: 12px;
color: rgba(13,31,21,0.30); line-height: 1.7; margin-bottom: 20px;
```
```
© 2026 **Ayojok**. All rights reserved.
Dhaka, Bangladesh.

[template-specific reason line — see below]
```

**Reason line per template:**
| Template | Reason line |
|---|---|
| Welcome | You received this because you registered on **Ayojok**. |
| Password Reset | You received this because a password reset was requested for your **Ayojok** account. |
| Account Deleted | You received this because an account deletion was requested for your **Ayojok** account. |
| Profile Approved | You received this because your **Ayojok** profile was reviewed and approved. |
| *(new template)* | You received this because *(relevant reason)* for your **Ayojok** account. |

**Social icons row:**
```
table > tr > td (pr:18px each, last td no pr)
Each icon: <img> 20×20, filter: brightness(30%) opacity:0.45
No rounded bg. Left-aligned.
```
Icon filter CSS: `filter:invert(0%) sepia(0%) saturate(0%) brightness(30%) contrast(100%);opacity:0.45;`

---

## Responsive / Mobile

Always include in `<head>`:
```html
<style>
  @media only screen and (max-width: 600px) {
    .email-card   { border-radius: 0 !important; }
    .header-pad   { padding: 28px 20px 18px 20px !important; }
    .body-pad     { padding: 24px 20px 8px 20px !important; }
    .cta-pad      { padding: 16px 20px 28px 20px !important; }
    .footer-pad   { padding: 28px 20px 28px 20px !important; }
    .cta-btn      { display: block !important; text-align: center !important; }
    h1            { font-size: 24px !important; }
    .notice-text  { font-size: 13px !important; }
  }
</style>
```

Add class `email-card` to the card table, `header-pad` to header TD,
`body-pad` to body TD, `cta-pad` to CTA TD, `footer-pad` to footer TD,
`cta-btn` to the CTA anchor.

---

## Template Catalogue

### 1. Welcome
- Subject: `Welcome to Ayojok`
- H1: `Welcome <span>Aboard</span>`
- Body padding: `24px 32px 8px 32px`
- InfoCard label: `Profile Information`
- Rows: `User: {username}` · `Email: {email}`
- CTA: `Log In` → `{login_url}` · padding `20px 32px 32px 32px`

### 2. Password Reset
- Subject: `Reset your Ayojok password`
- H1: `Reset Your <span>Password</span>`
- Body padding: `32px 32px 8px 32px`
- Body copy: `Click the button below to set a new password. This link expires in **30 minutes**.`
- InfoCard label: `Security Notice` (text-only body, no data rows)
- InfoCard copy: `If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.`
- CTA: `Reset Password` → `{password_reset_link}` · padding `20px 32px 36px 32px`

### 3. Account Deleted
- Subject: `Your Ayojok account has been deleted`
- H1: `Account <span>Deleted</span>`
- Body padding: `24px 32px 8px 32px`
- InfoCard label: `Deletion Summary`
- Rows: `Status: Permanently deleted` · `Data: All profile data, event links, and contacts have been removed. This action cannot be undone.`
  - Data row value uses `rgba(13,31,21,0.70)` color and weight 500 (long warning text)
- No CTA button
- Security note (in place of CTA section): Inter 14px `rgba(13,31,21,0.50)`, padding `20px 32px 20px 32px`
  - `Didn't request this? Contact our security team immediately at <a href="mailto:support@ayojok.com">support@ayojok.com</a>`

---

## Complete HTML Shell

Use this shell for every new template. Replace `{TITLE}`, `{BODY_PAD}`,
`{H1_MAIN}`, `{H1_ACCENT}`, `{BODY_COPY}`, `{INFOCARD}`, `{CTA_SECTION}`,
`{FOOTER_REASON}` tokens.

```html
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>{TITLE} - Ayojok</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @media only screen and (max-width: 600px) {
      .email-card  { border-radius: 0 !important; }
      .header-pad  { padding: 28px 20px 18px 20px !important; }
      .body-pad    { padding: 24px 20px 8px 20px !important; }
      .cta-pad     { padding: 16px 20px 28px 20px !important; }
      .footer-pad  { padding: 28px 20px 28px 20px !important; }
      .cta-btn     { display: block !important; text-align: center !important; }
      h1           { font-size: 24px !important; }
      .notice-text { font-size: 13px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#FAFAFA;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAFAFA;padding:0;">
<tr><td align="center" valign="top">

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-card" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 48px rgba(43,163,97,0.06),0 2px 12px rgba(0,0,0,0.04);">

    <!-- HEADER -->
    <tr>
      <td align="center" class="header-pad" style="padding:32px 40px 20px 40px;background-color:#FAFAFA;border-bottom:1px solid rgba(43,163,97,0.09);">
        <img src="https://ayojok.com/ayojokLogo.svg" alt="Ayojok" width="130" style="height:auto;max-width:130px;display:block;margin:0 auto;">
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td class="body-pad" style="padding:{BODY_PAD};background-color:#ffffff;">
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:30px;font-weight:700;color:#0D1F15;line-height:1.15;letter-spacing:-0.8px;margin:0 0 12px 0;">
          {H1_MAIN} <span style="color:#2BA361;">{H1_ACCENT}</span>
        </div>
        <p style="margin:0 0 24px 0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;color:rgba(13,31,21,0.58);line-height:1.7;font-weight:400;">
          {BODY_COPY}
        </p>
        {INFOCARD}
      </td>
    </tr>

    {CTA_SECTION}

    <!-- FOOTER -->
    <tr>
      <td class="footer-pad" style="padding:32px;background-color:#FAFAFA;border-top:1px solid rgba(43,163,97,0.09);">
        <img src="https://ayojok.com/ayojokLogo.svg" alt="Ayojok" width="90" style="height:auto;max-width:90px;display:block;margin-bottom:14px;">
        <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:12px;color:rgba(13,31,21,0.30);line-height:1.7;margin-bottom:20px;">
          &copy; 2026 <strong style="color:rgba(13,31,21,0.42);">Ayojok</strong>. All rights reserved.<br>
          Dhaka, Bangladesh.<br><br>
          {FOOTER_REASON}
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-right:18px;vertical-align:middle;">
              <a href="https://facebook.com/ayojok" style="text-decoration:none;display:inline-block;line-height:0;">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg" width="20" height="20" alt="Facebook" style="display:block;filter:invert(0%) sepia(0%) saturate(0%) brightness(30%) contrast(100%);opacity:0.45;">
              </a>
            </td>
            <td style="padding-right:18px;vertical-align:middle;">
              <a href="https://linkedin.com/company/ayojok" style="text-decoration:none;display:inline-block;line-height:0;">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg" width="20" height="20" alt="LinkedIn" style="display:block;filter:invert(0%) sepia(0%) saturate(0%) brightness(30%) contrast(100%);opacity:0.45;">
              </a>
            </td>
            <td style="padding-right:18px;vertical-align:middle;">
              <a href="https://instagram.com/ayojok" style="text-decoration:none;display:inline-block;line-height:0;">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg" width="20" height="20" alt="Instagram" style="display:block;filter:invert(0%) sepia(0%) saturate(0%) brightness(30%) contrast(100%);opacity:0.45;">
              </a>
            </td>
            <td style="vertical-align:middle;">
              <a href="mailto:support@ayojok.com" style="text-decoration:none;display:inline-block;line-height:0;">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg" width="20" height="20" alt="Email" style="display:block;filter:invert(0%) sepia(0%) saturate(0%) brightness(30%) contrast(100%);opacity:0.45;">
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
</html>
```

---

## CTA Section Snippet (copy-paste ready)

### With button:
```html
<tr>
  <td class="cta-pad" style="padding:20px 32px 32px 32px;background-color:#ffffff;">
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
      href="{CTA_URL}" style="height:52px;v-text-anchor:middle;width:200px;" arcsize="19%" stroke="f" fillcolor="#2BA361">
      <w:anchorlock/>
      <center style="color:#ffffff;font-family:Inter,sans-serif;font-size:15px;font-weight:600;">{CTA_TEXT}</center>
    </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-->
    <a href="{CTA_URL}" class="cta-btn" style="display:inline-block;background:linear-gradient(135deg,#2BA361 0%,#4dc487 100%);color:#ffffff;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:10px;letter-spacing:-0.1px;">{CTA_TEXT}</a>
    <!--<![endif]-->
  </td>
</tr>
```

### Security note (no button — Account Deleted):
```html
<tr>
  <td style="padding:20px 32px 20px 32px;background-color:#ffffff;">
    <p style="margin:0 0 20px 0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;color:rgba(13,31,21,0.50);line-height:1.7;">
      Didn't request this? Contact our security team immediately at
      <a href="mailto:support@ayojok.com" style="color:#2BA361;text-decoration:none;font-weight:600;">support@ayojok.com</a>
    </p>
  </td>
</tr>
```

---

## InfoCard Snippet (copy-paste ready)

```html
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
  style="background-color:#FAFAFA;border-radius:12px;border:1px solid rgba(43,163,97,0.15);margin-bottom:4px;">
  <tr>
    <td style="padding:18px 20px 6px 20px;">
      <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:rgba(13,31,21,0.32);text-transform:uppercase;letter-spacing:1.5px;padding-bottom:12px;margin-bottom:14px;border-bottom:1px solid rgba(43,163,97,0.09);">
        {CARD_LABEL}
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td width="60" style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;color:rgba(13,31,21,0.38);font-weight:500;vertical-align:top;padding-bottom:10px;">{ROW_LABEL}:</td>
          <td style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;color:#0D1F15;font-weight:600;vertical-align:top;padding-bottom:10px;">{ROW_VALUE}</td>
        </tr>
        <!-- repeat <tr> for additional rows; last row uses padding-bottom:6px -->
      </table>
    </td>
  </tr>
</table>
```

---

## Quality Checklist

Before finalising any template, verify:

- [ ] `<html>` has `xmlns="http://www.w3.org/1999/xhtml"` and `lang="en"`
- [ ] All tables have `role="presentation" cellpadding="0" cellspacing="0" border="0"`
- [ ] Card `background-color` is `#ffffff` (not `#fffffff`)
- [ ] H1 accent word wrapped in `<span style="color:#2BA361;">`
- [ ] InfoCard has correct inner padding `18px 20px 6px 20px`
- [ ] CTA includes VML fallback for Outlook
- [ ] Mobile `<style>` block present in `<head>`
- [ ] All four social icons present in footer
- [ ] Footer reason line matches template type
- [ ] No placeholder tokens left unreplaced in final output
- [ ] `word-break:break-all` on email value cells
