---
name: rongplan-design-system
description: Design system guidelines and tokens for the Rong Plan Light Mode ("The Luminous Canvas") premium dashboard theme.
---

# Rong Plan Design System ("The Luminous Canvas")

This skill documents the design principles, color palettes, spacing rules, and CSS helper tokens to construct UI screens complying with the high-key, luminous Rong Plan light theme.

## 1. Creative North Star: "The Luminous Canvas"

Instead of emerging from a dark space or space void, the light theme acts as a soft, radiant dashboard. Depth is achieved via tonal elevation, milky glass overlays, and faint boundaries rather than dark borders or shadows.

---

## 2. Color Palette & Custom CSS Variables

Implement the following design system tokens inside `:root`:

```css
:root {
  --background: #f7f5fd;                  /* Base canvas field */
  --foreground: #0d0e13;                  /* Primary text contrast */
  --primary: #7b55fa;                     /* Violet primary energy accent */
  --primary-container: #7b55fa;
  --on-primary-container: #ffffff;
  --secondary: #b4a1ff;                   /* Secondary lavender energy glow */
  --secondary-container: #f1eefc;
  --on-secondary-container: #7b55fa;
  --tertiary: #4ade80;                    /* Bright green accent */
  --error: #ba1a1a;
  --outline-variant: rgba(123, 85, 250, 0.08); /* 8% opacity primary border */
  --on-surface-variant: rgba(13, 14, 19, 0.75); /* Secondary text opacity */
  --surface-container-lowest: #ffffff;
  --surface-container-low: #f1eefc;
  --surface-container: #f7f5fd;
  --surface-container-high: #f1eefc;
  --surface-container-highest: #e9e5f9;
  --surface-soft: #f1eefc;
  --surface-elevated: #ffffff;
  --glass-fill: rgba(255, 255, 255, 0.6);  /* 60% opacity milky glass */
}
```

---

## 3. Boundaries & Shadow Philosophy

- **No Hard Separators**: Discourage heavy, high-contrast separation lines.
- **Tonal Elevation**: Separate adjacent cards or sections by placing a `surface-elevated` (#ffffff) card over a `surface-soft` (#f1eefc) background.
- **Ambient Shadows**: Use low-opacity dark shadows with large blur radius to mimic diffused daylight:
  `box-shadow: 0 10px 40px rgba(13, 14, 19, 0.04);`
- **Glass Edge Rule**: Give panels a subtle, primary-tinted border at 8% opacity:
  `border: 1px solid rgba(123, 85, 250, 0.08);`

---

## 4. Components Rules

### Rounded Hexagonal & Glass Cards
- **Milky Glass**: Use `rgba(255, 255, 255, 0.6)` with backdrop blur of `16px–24px` and a soft border of `rgba(123, 85, 250, 0.08)`.
- **Hover Transitions**: Add a smooth translate hover lift (`translateY(-2px)`) and a slight shadow glow scaling up.

### Custom Buttons
- **Primary**: Gradient of `#7b55fa` to `#b4a1ff` at `135°`, no border, and a shadow glow on hover (`rgba(123, 85, 250, 0.25)`).
- **Secondary**: `surface-soft` background, low-opacity primary border, primary text, transition hover.
- **Tertiary/Ghost**: Transparent background with primary/accent text.
- **Press Transition**: Scale components down on active state to `scale(0.97)` for responsive feedback.
