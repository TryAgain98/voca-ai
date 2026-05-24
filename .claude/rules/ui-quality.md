# UI, UX & DESIGN SYSTEM (Linear Inspired)

## 🎨 Color Palette (Achromatic + Indigo Accent)

- **Backgrounds**: Marketing: `#08090a` | Panel: `#0f1011` | Surface: `#191a1b` | Hover: `#28282c`.
- **Text**: Primary: `#f7f8f8` (Near-white) | Secondary: `#d0d6e0` (Gray) | Muted: `#8a8f98`.
- **Accents**: Brand: `#5e6ad2` | Active/Links: `#7170ff` | Hover: `#828fff`.
- **Borders (dark surface)**: Subtle: `rgba(255,255,255,0.05)` | Standard: `rgba(255,255,255,0.08)` | Emphasis: `rgba(255,255,255,0.15)`.
- **Borders (light surface)**: Subtle: `rgba(0,0,0,0.06)` | Standard: `rgba(0,0,0,0.1)` | Emphasis: `rgba(0,0,0,0.16)`.
- **Text (light surface)**: Primary: `#0f1011` | Secondary: `#28282c` | Muted: `#6b7180`.
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
- **DO**: Use semi-transparent white borders on dark surfaces. Use semi-transparent black borders on light surfaces.
- **DON'T**: Use pure white (`#ffffff`) for text or solid colored bgs for buttons (except Primary CTA).
- **DON'T**: Use `rgba(255,255,255,N)` borders on light surfaces — they are invisible.
- **DON'T**: Use positive letter-spacing on display headings.
- **DON'T**: Introduce warm colors; keep it cool/achromatic.

## ⚠️ Theme-Safety Rule (Recurring Bug Prevention)

**NEVER hardcode colors in `style={}`** for backgrounds, borders, or text. This bypasses the theme system and is the root cause of light-theme breakage every time.

- **WRONG**: `style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)', color: '#d0d6e0' }}`
- **RIGHT**: `className="bg-card border-border text-muted-foreground"`

Use Tailwind semantic tokens that auto-adapt: `bg-card`, `bg-muted`, `border`, `border-border`, `text-foreground`, `text-muted-foreground`, `text-secondary-foreground`. Reserve `style={}` only for dynamic computed values (e.g., widths from JS, animation transforms).

## 🧪 Quality & Error Handling

- **Forms**: Use `@conform-to` + `Zod`. No hardcoded strings (use `i18n`).
- **Errors**: Catch in `onError` hooks. Show concise, actionable `sonner` toasts.
- **Testing**: Vitest for services/logic. Playwright for core CRUD flows.
