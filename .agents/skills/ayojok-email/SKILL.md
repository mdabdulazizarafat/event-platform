---
name: ayojok-email
description: >
  Generate production-ready Ayojok (by Rong Plan) transactional HTML email
  templates that strictly conform to the Ayojok design system. Use whenever
  asked to create, write, build, or update any Ayojok email — participant
  confirmation, event reminder, certificate delivery, waitlist, cancellation,
  team invite, or any other transactional email for the Ayojok platform.
  Trigger on "email template", "transactional email", or any reference to
  Ayojok/Rong Plan emails. Do not generate Ayojok emails without consulting
  this skill first — the structure and tokens below must be followed exactly.
---

# Ayojok Email Template Skill

You are generating HTML email templates for **Ayojok** — the participant-
facing event platform powered by Rong Plan's Event Management SaaS. Every
template must be pixel-perfect against the system below.

---

## Brand Identity

- **Tone:** Clear, organized, reassuring. Short sentences. Action-oriented.
  No hype ("epic", "unmissable"). Prefer: "you're confirmed / here's what's
  next / show this at the door."
- **Event framing:** Position Ayojok as the organizer's trusted operator.
  The participant should always know exactly what to do next.
- **Subject lines:** Max 6–10 words, outcome-focused ("You're confirmed for
  {{event_name}}", "{{event_name}} is 2 days away").
- **CTA text:** Minimal — "View Ticket" / "Add to Calendar" / "Download
  Certificate" / "Get Directions".

---

## Assets

| Asset | Value |
|---|---|
| Logo | Text wordmark "Ayojok" (Plus Jakarta Sans 800) — swap for `{{logo_url}}` once a lockup exists. Header size 18px, footer size 14px. |
| Support email | `{{support_email}}` |
| Office address | `{{organizer_address}}` |
| Social — Facebook | `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg` → `{{facebook_url}}` |
| Social — Instagram | `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg` → `{{instagram_url}}` |
| Social — LinkedIn | `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg` → `{{linkedin_url}}` |
| Social — Email | `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg` → `mailto:{{support_email}}` |
| Fonts | Plus Jakarta Sans (headlines) + Inter (body/labels) via Google Fonts |

---

## Brand Colors

| Token | Value |
|---|---|
| Primary | `#3525cd` |
| Primary Container (glow) | `#4f46e5` |
| Surface | `#f9f9ff` |
| Surface Soft | `#f0f3ff` |
| Elevated | `#ffffff` |
| Success | `#00714d` / container `#6cf8bb` |
| Warning / Accent | `#885500` / container `#ffd4a4` |
| Text Primary | `#111c2d` |
| Text Muted | `#464555` |
| Text Faint | `#777587` |
| Text Label | `rgba(17,28,45,0.38)` |
| Text Footer | `rgba(17,28,45,0.35)` |
| Text Footer Bold | `rgba(17,28,45,0.55)` |
| Border Subtle | `rgba(53,37,205,0.09)` |
| Border Card | `rgba(53,37,205,0.12)` |

---

## Layout Specification

### Outer Wrapper
```html
<table role="presentation" cellpadding="0" cellspacing="0" border="0"
  width="100%" style="background-color:#f0f3ff;padding:0;">
  <tr><td align="center" valign="top">
    <!-- EMAIL CARD inside here -->
  </td></tr>
</table>
```

### Email Card
```
max-width: 480px
background-color: #ffffff
border-radius: 16px
overflow: hidden
box-shadow: 0 20px 48px rgba(53,37,205,0.10), 0 2px 12px rgba(0,0,0,0.05)
```

### Section Order
1. **HEADER** — wordmark on surface bg
2. **BODY** — H1 (accent span) + paragraph + optional InfoCard(s)
3. **CTA** — button (omit section if no CTA)
4. **FOOTER** — wordmark + legal + reason line + social icons

All sections are `<tr><td>` inside the card table. Every table uses
`role="presentation" cellpadding="0" cellspacing="0" border="0"`.

---

## Section Specs

### HEADER
```
padding: 24px 24px 18px 24px
background-color: #3525cd
Wordmark: "Ayojok" Plus Jakarta Sans 800 18px #ffffff, centered
Subline: "Powered by Rong Plan" Inter 11px #c3c0ff, centered
Mobile class header-pad → 20px 20px 16px 20px
```

### BODY
```
padding: 28px 24px 8px 24px
background-color: #ffffff
```

**H1 style:**
```css
font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;
font-size: 22px; font-weight: 700; color: #111c2d;
line-height: 1.3; letter-spacing: -0.3px; margin: 0 0 10px 0;
```
The **key outcome word** goes in a `<span style="color:#3525cd;">`.
Examples: You're **Confirmed**, {{event_name}} is **Almost Here**,
Certificate **Ready**.

**Eyebrow label (status line above H1):**
```css
font-family:'Inter'; font-size:12px; font-weight:700;
letter-spacing:0.04em; text-transform:uppercase;
color: <status color — #00714d success, #885500 upcoming>;
margin: 0 0 10px 0;
```

**Body paragraph style:**
```css
font-family: 'Inter', Arial, Helvetica, sans-serif;
font-size: 15px; color: #464555; line-height: 1.6; font-weight: 400;
margin: 0 0 20px 0;
```

### InfoCard (structured data — event details, ticket info, certificate meta)
```
background-color: #f0f3ff
border-radius: 12px
border: 1px solid rgba(53,37,205,0.12)
margin-bottom: 16px
inner padding: 18px 20px 6px 20px
```

**Card header label:**
```css
font-family:'Inter'; font-size:11px; font-weight:700;
color: rgba(17,28,45,0.38); text-transform:uppercase; letter-spacing:0.04em;
padding-bottom:10px; margin-bottom:12px;
border-bottom:1px solid rgba(53,37,205,0.10);
```

**Data rows** (label + value):
```
Label col: width=60, Inter 13px, color #777587, weight 500
Value col: Inter 13px, color #111c2d, weight 600
Row padding-bottom: 10px (non-last), 6px (last)
```

### QR InfoCard (variant — participant confirmation only)
```
Same shell as InfoCard, but content is centered:
- white inset tile (border-radius:10px, padding:12px) holding the QR <img>
  width=180 height=180
- ticket code below in Courier New, letter-spacing 3px, 18px, weight 700
- ticket id / tier caption below in Inter 12px #777587
```

### CTA Section
```
padding: 4px 24px 28px 24px
background-color: #ffffff
```

**Button:**
```css
display:inline-block;
background: linear-gradient(135deg,#3525cd 0%,#4f46e5 100%);
color:#ffffff;
font-family:'Inter', Arial, Helvetica, sans-serif;
font-size:14px; font-weight:700;
text-decoration:none;
padding:14px 32px;
border-radius:8px;
letter-spacing:-0.1px;
```
Always include **VML fallback** for Outlook (arcsize 16%, fillcolor
`#3525cd`). Mobile class `cta-btn` → `display:block; text-align:center`.

### FOOTER
```
padding: 24px (all sides)
background-color: #f9f9ff
border-top: 1px solid rgba(53,37,205,0.09)
```
Footer wordmark: "Ayojok" Plus Jakarta Sans 700 14px #111c2d,
margin-bottom:12px

**Legal block:**
```css
font-family:'Inter'; font-size:11px;
color: rgba(17,28,45,0.35); line-height:1.6; margin-bottom:16px;
```
```
Sent by Ayojok, powered by Rong Plan, on behalf of
<strong style="color:rgba(17,28,45,0.55);">{{organizer_name}}</strong>.
{{organizer_address}}

[template-specific reason line — see below]
```

**Reason line per template:**
| Template | Reason line |
|---|---|
| Participant Confirmation | You received this because you registered for **{{event_name}}**. |
| Event Reminder | You received this because you're registered for **{{event_name}}**, happening soon. |
| Certificate Delivery | You received this because you completed **{{event_name}}**. |
| *(new template)* | You received this because *(relevant reason)* on **Ayojok**. |

Always end the legal block with an unsubscribe link:
`<a href="{{unsubscribe_url}}" style="color:rgba(17,28,45,0.35);text-decoration:underline;">Unsubscribe</a>`

**Social icons row:**
```
table > tr > td (pr:16px each, last td no pr)
Each icon: <img> 18×18, filter: brightness(30%) opacity:0.45
Left-aligned, no rounded bg.
```
Icon filter CSS:
`filter:invert(0%) sepia(0%) saturate(0%) brightness(30%) contrast(100%);opacity:0.45;`

---

## Responsive / Mobile

Always include in `<head>`:
```html
<style>
  @media only screen and (max-width: 480px) {
    .email-card  { border-radius: 0 !important; }
    .header-pad  { padding: 20px 20px 16px 20px !important; }
    .body-pad    { padding: 24px 20px 8px 20px !important; }
    .cta-pad     { padding: 4px 20px 24px 20px !important; }
    .footer-pad  { padding: 20px !important; }
    .cta-btn     { display: block !important; text-align: center !important; }
    .qr-img      { width: 160px !important; height: 160px !important; }
  }
</style>
```
Card is already mobile-width by default (max-width 480px) — the card
never needs to "become" mobile, it just loses its outer margin on very
small screens.

---

## Template Catalogue

### 1. Participant Confirmation
- Subject: `You're confirmed for {{event_name}}`
- Eyebrow: `✓ Registration confirmed` (success color)
- H1: `You're <span>Going</span>, {{participant_name}}.`
- Body: one line pointing to the QR ticket below.
- QR InfoCard: ticket code, ticket id, tier
- Second InfoCard: When / Where rows
- CTA: `Add to Calendar` → `{{calendar_url}}`
- Footer reason: Participant Confirmation row above

### 2. Event Reminder
- Subject: `{{event_name}} is {{countdown_days}} days away`
- Eyebrow: countdown label (warning/accent color), big number under H1 optional
- H1: `Almost <span>Time</span>, {{participant_name}}.`
- InfoCard: When / Where / Gate time rows
- Secondary strip: ticket reminder line + `View Ticket` link
- CTA: `View Full Event Details` → `{{event_details_url}}`
- Footer reason: Event Reminder row above

### 3. Certificate Delivery
- Subject: `Your certificate for {{event_name}} is ready`
- Eyebrow: `✓ Certificate ready` (success color)
- H1: `Well <span>Done</span>, {{participant_name}}.`
- Certificate InfoCard variant: bordered preview block (name, event, date, cert id) instead of label/value rows
- CTA: `Download Certificate` → `{{certificate_download_url}}`
- Secondary link under CTA: `Share on LinkedIn` → `{{linkedin_share_url}}`
- Footer reason: Certificate Delivery row above

---

## Quality Checklist

Before finalising any template, verify:

- [ ] `<html>` has `xmlns="http://www.w3.org/1999/xhtml"` and `lang="en"`
- [ ] All tables have `role="presentation" cellpadding="0" cellspacing="0" border="0"`
- [ ] Card `background-color` is `#ffffff`
- [ ] H1 accent word wrapped in `<span style="color:#3525cd;">`
- [ ] InfoCard has correct inner padding `18px 20px 6px 20px`
- [ ] CTA includes VML fallback for Outlook
- [ ] Mobile `<style>` block present in `<head>`
- [ ] All social icons present in footer, correct opacity/filter
- [ ] Footer reason line matches template type
- [ ] No placeholder tokens left unreplaced in final output
- [ ] Card stays legible at 320px width (no horizontal scroll)
