---
name: rongplan-design-system
description: Design system guidelines and tokens for the Luminous Precision (Rong Plan Light Mode) premium dashboard theme.
---

# Luminous Precision — Full Web Application Design System

> **A high-end, production-ready Design System & Component Library** built for modern React / Next.js web applications using Tailwind CSS and TypeScript. Designed with an editorial, architectural-layering aesthetic for tech-forward digital products.

---

## 1. Design System Philosophy & Core Guidelines

### The Creative North Star: "Luminous Precision"
Luminous Precision moves away from boxy, border-heavy SaaS templates by embracing **Architectural Layering**. Digital space is treated like an airy gallery:
* **The "No-Line" Rule:** Standard 1px solid section dividers are strictly avoided. Structural separation is achieved through subtle tonal surface shifts (e.g., from base surface `#FAFAFA` to container `#FFFFFF` or elevated `#F4F4F5`).
* **Ghost Borders:** When accessibility demands a border, use a 15–20% opacity tint (`rgba(43, 163, 97, 0.15)` in light mode, `rgba(43, 163, 97, 0.20)` in dark mode).
* **Strategic Scarcity of Color:** Emerald Green commands primary focus, Golden Saffron acts as interactive accent/highlight, and High-Energy Red is reserved for critical status and destructive actions.

---

## 2. Color Palette & Tonal Hierarchy

| Token Name | Hex / Value | Description |
| :--- | :--- | :--- |
| **Primary (Emerald Green)** | `#2BA361` | Brand identity, primary CTAs, active indicator bars |
| **Secondary (Golden Saffron)** | `#F7BB16` | Accent, secondary CTAs, badges, highlight states |
| **Tertiary (High-Energy Red)** | `#D32F2F` | Alerts, destructive actions, critical notifications |
| **Light Base Surface** | `#FAFAFA` | Page body background |
| **Light Card / Container** | `#FFFFFF` | Elevated cards, main panel content |
| **Light Elevated Surface** | `#F4F4F5` | Hover backgrounds, input backgrounds |
| **Dark Base Surface** | `#0A0F0D` | Dark mode body background |
| **Dark Container** | `#0F1813` | Dark mode surface background |
| **Dark Elevated / Card** | `#131F17` / `#1A2B20` | Dark mode card background |
| **Footer Surface** | `#0F1813` | High-contrast dark anchor footer |

---

## 3. Global CSS & Design Tokens (`globals.css`)

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  /* Fonts */
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-bangla: 'Hind Siliguri', 'Plus Jakarta Sans', sans-serif;

  /* Typography extensions */
  --tracking-tighter: -0.02em;
  --tracking-wider: 0.05em;
  --line-height-editorial: 1.6;

  /* Primary Colors */
  --color-primary: #2BA361;
  --color-primary-50: #e8f7ee;
  --color-primary-100: #c5ebd5;
  --color-primary-200: #9ddebb;
  --color-primary-300: #72d09e;
  --color-primary-400: #4dc487;
  --color-primary-500: #2BA361;
  --color-primary-600: #21874f;
  --color-primary-700: #176b3d;
  --color-primary-800: #0d4f2a;
  --color-primary-900: #043318;

  /* Secondary Colors */
  --color-secondary: #f7bb16;
  --color-secondary-50: #fef9e7;
  --color-secondary-100: #fdf0b8;
  --color-secondary-200: #fce789;
  --color-secondary-300: #fbdd5a;
  --color-secondary-400: #f9cf2e;
  --color-secondary-500: #f7bb16;
  --color-secondary-600: #d49c0a;
  --color-secondary-700: #b17d06;

  /* Tertiary / Danger Colors */
  --color-tertiary: #D32F2F;
  --color-tertiary-500: #D32F2F;
  --color-tertiary-600: #b01e1e;

  /* Surface Colors */
  --color-surface-50: #FFFFFF;
  --color-surface-100: #FAFAFA;
  --color-surface-200: #F4F4F5;
  --color-surface-300: #E4E4E7;
  --color-surface-400: #D4D4D8;
  --color-surface-500: #A1A1AA;

  /* Dark Colors */
  --color-dark-base: #0A0F0D;
  --color-dark-surface: #0F1813;
  --color-dark-card: #131F17;
  --color-dark-elevated: #1A2B20;
  --color-dark-border: #1E3327;

  /* Ambient Shadows */
  --shadow-ambient: 0 4px 24px rgba(0,0,0,0.04);
  --shadow-ambient-md: 0 8px 40px rgba(0,0,0,0.06);
  --shadow-ambient-lg: 0 16px 64px rgba(0,0,0,0.08);
  --shadow-glow-primary: 0 0 32px rgba(43,163,97,0.18);
  --shadow-glow-secondary: 0 0 32px rgba(247,187,22,0.18);

  /* Border Radius */
  --radius-default: 8px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
}

/* Theme variables */
:root {
  --bg-base: #FAFAFA;
  --bg-surface: #FFFFFF;
  --bg-card: #FFFFFF;
  --bg-elevated: #F4F4F5;
  --bg-footer: #0F1813;
  --text-primary: #0D1F15;
  --text-secondary: #3D5647;
  --text-muted: #6B7F75;
  --ghost-border: rgba(43, 163, 97, 0.15);
  --neutral-border: rgba(0, 0, 0, 0.12);
}

.dark {
  --bg-base: #0A0F0D;
  --bg-surface: #0F1813;
  --bg-card: #131F17;
  --bg-elevated: #1A2B20;
  --bg-footer: #060C09;
  --text-primary: #E8F7EE;
  --text-secondary: #A4C4B0;
  --text-muted: #6B8F79;
  --ghost-border: rgba(43, 163, 97, 0.20);
  --neutral-border: rgba(255, 255, 255, 0.12);
}

body {
  font-family: var(--font-sans);
  background-color: var(--bg-base);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.navbar-glass {
  -webkit-backdrop-filter: blur(10px) saturate(150%);
  backdrop-filter: blur(10px) saturate(150%);
  background: rgba(250, 250, 250, 0.7);
  border-bottom: 1px solid var(--ghost-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.dark .navbar-glass {
  background: rgba(10, 15, 13, 0.7);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
}

.ghost-border {
  border: 1px solid var(--ghost-border);
}

.card-hover {
  transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              box-shadow 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--ghost-border);
}

.gradient-text {
  background: linear-gradient(135deg, #2BA361 0%, #4dc487 50%, #f7bb16 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 4. Branding Assets

When referencing the brand logo and favicon, strictly use the following files:

- **Primary Logo (SVG):** `ayojokLogo.svg`
- **Email / Fallback Logo (PNG):** `public/ayojokLogo.png`
- **Favicon:** `ayojokFavicon.svg`
