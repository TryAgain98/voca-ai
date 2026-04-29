# UI, UX & DESIGN SYSTEM (Linear Inspired)

## 🎨 Color Palette (Achromatic + Indigo Accent)

- **Backgrounds**: Marketing: `#08090a` | Panel: `#0f1011` | Surface: `#191a1b` | Hover: `#28282c`.
- **Text**: Primary: `#f7f8f8` (Near-white) | Secondary: `#d0d6e0` (Gray) | Muted: `#8a8f98`.
- **Accents**: Brand: `#5e6ad2` | Active/Links: `#7170ff` | Hover: `#828fff`.
- **Borders**: Subtle: `rgba(255,255,255,0.05)` | Standard: `rgba(255,255,255,0.08)`.
- **Status**: Success: `#10b981` (Emerald).

## Typography (Inter Variable)

- **Features**: Always enable `"cv01", "ss03"`. Use **Berkeley Mono** for code.
- **Weights**: Regular: 400 | **Signature (Emphasis): 510** | Strong: 590. (No 700/Bold).
- **Letter Spacing (Aggressive Negative)**:
  - 72px+: `-1.584px` | 48px: `-1.056px` | 32px: `-0.704px`.
  - Body (16px): `normal`.

## 🧱 Component Specs

- **Elevation**: Use background luminance steps (`0.02 → 0.04 → 0.05` white opacity). **No dark shadows**.
- **Buttons**: Ghost (default): `rgba(255,255,255,0.02)` bg + border. Radius: 6px.
- **Cards**: Translucent bg (`rgba(255,255,255,0.03)`) + `1px` standard border. Radius: 8px/12px.
- **Inputs**: `rgba(255,255,255,0.02)` bg. Padding: `12px 14px`. Radius: 6px.

## ✅ Do's & ❌ Don'ts

- **DO**: Use weight 510 for UI labels/navigation.
- **DO**: Use semi-transparent white borders on dark surfaces.
- **DON'T**: Use pure white (`#ffffff`) for text or solid colored bgs for buttons (except Primary CTA).
- **DON'T**: Use positive letter-spacing on display headings.
- **DON'T**: Introduce warm colors; keep it cool/achromatic.

## 🧪 Quality & Error Handling

- **Forms**: Use `@conform-to` + `Zod`. No hardcoded strings (use `i18n`).
- **Errors**: Catch in `onError` hooks. Show concise, actionable `sonner` toasts.
- **Testing**: Vitest for services/logic. Playwright for core CRUD flows.
