---
name: ayojok-email
description: >
  Generate production-ready Rong Plan transactional HTML email templates that
  strictly conform to the Luminous Precision design system. Use this skill whenever the
  user asks to create, write, build, or update any Bangla Innovator email — including
  welcome, password reset, account deletion, notification,
  or any other transactional email for the Bangla Innovator platform.
---

# Bangla Innovator Email Template Skill

You are generating HTML email templates for **Bangla Innovator**. Every template must be pixel-perfect against the Luminous Precision design system. No deviation is allowed.

---

## Brand Identity

- **Tone:** High-end editorial, airy, intentional, quiet. Minimalist and tech-forward.
- **Subject lines:** Max 6–10 words, outcome-focused.
- **CTA text:** Minimal — "Log In" / "Reset Password" / "Get Started" / "View Profile"

---

## Assets

| Asset | Value |
|---|---|
| Logo URL | `https://placehold.co/130x40/2BA361/FFF?text=Bangla+Innovator` |
| Header logo width | `130px` |
| Footer logo width | `90px` |
| Support email | `support@banglainnovator.com` |
| Office address | `Dhaka, Bangladesh` |
| Fonts | Plus Jakarta Sans via Google Fonts |

---

## Brand Colors (Luminous Precision)

| Token | Value |
|---|---|
| Primary (Emerald Green) | `#2BA361` |
| Secondary (Golden Saffron) | `#f7bb16` |
| Tertiary (High-Energy Red) | `#D32F2F` |
| Base Surface | `#FAFAFA` |
| Elevated | `#ffffff` |
| Text Primary | `#0d0e13` |
| Text Muted | `rgba(13,14,19,0.58)` |
| Ghost Border | `rgba(43,163,97,0.15)` |

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
```css
max-width: 560px;
background-color: #ffffff;
border-radius: 8px; /* Moderate roundedness */
overflow: hidden;
box-shadow: 0 10px 30px rgba(0,0,0,0.05); /* Ambient Shadows */
```

### Section Order
1. **HEADER** — logo on base surface bg
2. **BODY** — H1 + paragraph + optional InfoCard
3. **CTA** — button (omit section if no CTA)
4. **FOOTER** — logo + legal + social icons

All sections are `<tr><td>` inside the card table. Use `role="presentation"` on
all tables.

---

## Section Specs

### HEADER
```css
padding: 32px 40px 20px 40px;
background-color: #FAFAFA;
```
Logo: width=130, centered (margin:0 auto), display:block

### BODY
```css
padding: 32px 32px 8px 32px;
background-color: #ffffff;
```

**H1 style:**
```css
font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;
font-size: 30px; font-weight: 700; color: #0d0e13;
line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 12px 0;
```
Always place the **key action word** in a `<span style="color:#2BA361;">`.

**Body paragraph style:**
```css
font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;
font-size: 15px; color: rgba(13,14,19,0.58); line-height: 1.6; font-weight: 400;
margin: 0 0 24px 0;
```

### InfoCard (optional — use when showing structured data rows)
```css
background-color: #FAFAFA;
border-radius: 8px;
border: 1px solid rgba(43,163,97,0.15); /* Ghost Border */
margin-bottom: 4px;
padding: 18px 20px 6px 20px;
```

### CTA Section
```css
padding: 20px 32px 32px 32px;
background-color: #ffffff;
```

**Button:**
```css
display: inline-block;
background-color: #2BA361;
color: #ffffff;
font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;
font-size: 15px; font-weight: 600;
text-decoration: none;
padding: 14px 40px;
border-radius: 6px;
```

### FOOTER
```css
padding: 32px;
background-color: #FAFAFA;
border-top: 1px solid rgba(43,163,97,0.15);
```

**Legal block:**
```css
font-family: 'Plus Jakarta Sans'; font-size: 12px;
color: rgba(13,14,19,0.30); line-height: 1.7; margin-bottom: 20px;
```
```html
&copy; 2026 <strong>Bangla Innovator</strong>. All rights reserved.<br>
Dhaka, Bangladesh.
```

---

## Complete HTML Shell

Use this shell for every new template. Replace placeholders as needed.

```html
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>{TITLE} — Bangla Innovator</title>
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
          {H1_MAIN} <span style="color:#2BA361;">{H1_ACCENT}</span>
        </div>
        <p style="margin:0 0 24px 0;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:15px;color:rgba(13,14,19,0.58);line-height:1.6;font-weight:400;">
          {BODY_COPY}
        </p>
        {INFOCARD}
      </td>
    </tr>

    <!-- CTA -->
    {CTA_SECTION}

    <!-- FOOTER -->
    <tr>
      <td class="footer-pad" style="padding:32px;background-color:#FAFAFA;border-top:1px solid rgba(43,163,97,0.15);">
        <img src="https://placehold.co/90x30/2BA361/FFF?text=BI" alt="Bangla Innovator" width="90" style="height:auto;max-width:90px;display:block;margin-bottom:14px;">
        <div style="font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;font-size:12px;color:rgba(13,14,19,0.30);line-height:1.7;margin-bottom:20px;">
          &copy; 2026 <strong style="color:rgba(13,14,19,0.42);">Bangla Innovator</strong>. All rights reserved.<br>
          Dhaka, Bangladesh.<br><br>
          {FOOTER_REASON}
        </div>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>
```
