---
name: ayojok-email
description: >
  Generate production-ready Ayojok (by Rong Plan) transactional HTML email
  templates that strictly conform to the Ayojok Luminous Precision design system.
---

# Ayojok Luminous Precision Email Template Skill

Every email template must strictly conform to the **Luminous Precision** theme guidelines.

---

## Brand Colors

| Token | Value |
|---|---|
| Primary | `#2BA361` (Emerald Green) |
| Primary Container (glow) | `#4dc487` |
| Surface | `#ffffff` |
| Surface Soft | `#FAFAFA` |
| Success | `#2BA361` |
| Warning / Accent | `#f7bb16` (Saffron) |
| Text Primary | `#0D1F15` |
| Text Muted | `#3D5647` |
| Text Faint | `#6B7F75` |
| Text Label | `rgba(13,31,21,0.38)` |
| Border Subtle | `rgba(43,163,97,0.09)` |
| Border Card | `rgba(43,163,97,0.15)` |

---

## Layout Specification

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
max-width: 480px
background-color: #ffffff
border-radius: 16px
overflow: hidden
box-shadow: 0 20px 48px rgba(43,163,97,0.06), 0 2px 12px rgba(0,0,0,0.04)
```

---

## Header Section
```
padding: 24px 24px 18px 24px
background-color: #2BA361
Wordmark: "Ayojok" Plus Jakarta Sans 800 18px #ffffff, centered
Subline: "Powered by Rong Plan" Inter 11px #c5ebd5, centered
```

---

## H1 style
```css
font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;
font-size: 22px; font-weight: 700; color: #0D1F15;
line-height: 1.3; letter-spacing: -0.3px; margin: 0 0 10px 0;
```
The key outcome word goes in a `<span style="color:#2BA361;">`.

---

## CTA Section Button
```css
display:inline-block;
background: linear-gradient(135deg,#2BA361 0%,#4dc487 100%);
color:#ffffff;
font-family:'Inter', Arial, Helvetica, sans-serif;
font-size:14px; font-weight:700;
text-decoration:none;
padding:14px 32px;
border-radius:8px;
letter-spacing:-0.1px;
```
VML fallback roundrect fillcolor `#2BA361`.
