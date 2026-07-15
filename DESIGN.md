---
name: Core Admin
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system is engineered for high-density business administration and multi-tenant management. The brand personality is professional, reliable, and invisible—prioritizing data clarity and user efficiency over decorative elements. 

The aesthetic follows a **Modern Corporate Minimalism** approach. It utilizes expansive whitespace, a restrained color palette, and a clear functional hierarchy to reduce cognitive load for power users who spend several hours daily within the interface. The emotional response should be one of "controlled precision" and "systematic order."

## Colors
The palette is rooted in "Admin Blue" (#2563eb), used strategically for primary actions, active states, and focus indicators. 

- **Surface Tiers:** We use a systematic gray scale for depth. Backgrounds sit at `#f8fafc`, while secondary containers and sidebars use `#f1f5f9`.
- **Typography Colors:** Primary text uses `#0f172a` for maximum contrast, while secondary metadata uses `#64748b`.
- **Semantic Colors:** Success, Warning, and Error colors are used exclusively for status indicators, badges, and validation states to ensure they remain high-signal.

## Typography
Inter is the foundational typeface, chosen for its exceptional legibility in data-heavy environments and its tall x-height. 

The system uses a strictly functional scale. **Labels** and **Small Body** text are the workhorses of the administration panel, optimized for tabular data and form fields. **Headlines** use a slight negative letter-spacing to maintain a tight, professional appearance at larger sizes. All CAPS are reserved strictly for the `label-md` role (e.g., table headers or section overviews) to differentiate them from interactive data.

## Layout & Spacing
This design system utilizes a **12-column fluid grid** with fixed sidebars. The primary layout consists of a 280px fixed navigation drawer on the left and a fluid content area on the right.

- **Breakpoints:** Desktop (1280px+), Tablet (768px - 1279px), Mobile (<767px).
- **Rhythm:** A 4px baseline grid governs all spacing. Components are separated by 16px (md) or 24px (lg) margins to ensure clear visual grouping.
- **Data Density:** In table views, horizontal padding is prioritized (16px) while vertical padding is compressed to 12px to allow more rows to be visible above the fold.

## Elevation & Depth
Depth is conveyed through a combination of **Tonal Layering** and **Subtle Ambient Shadows**. 

1. **Level 0 (Background):** `#f8fafc` — The canvas.
2. **Level 1 (Cards/Sidebar):** White (`#ffffff`) with a 1px border of `#e2e8f0`.
3. **Level 2 (Dropdowns/Modals):** White with a soft, diffused shadow (`0 10px 15px -3px rgba(0, 0, 0, 0.1)`).

We avoid heavy shadows in favor of crisp 1px borders to maintain a flat, architectural feel that suits business software.

## Shapes
The shape language is "Soft-Modern." Most standard components (buttons, inputs) use a 0.5rem (8px) radius. 

Larger containers, such as **Dashboard Cards**, use a 1rem (16px) radius to create a distinct visual separation between the layout structure and the interactive elements within it. This contrast in rounding helps users subconsciously distinguish between "the container" and "the action."

## Components
- **Buttons:** Primary buttons use Admin Blue with white text. Secondary buttons use a white background with a gray-300 border. Use 8px padding-y and 16px padding-x.
- **Cards:** Defined by a 16px corner radius, a white fill, and a subtle 1px border. Internal padding should be a consistent 24px.
- **Inputs:** Fields must have a clear 1px border in `#cbd5e1`. On focus, the border shifts to Admin Blue with a 3px soft blue outer glow.
- **Chips/Badges:** Small, 2px rounded corners. Use low-saturation background tints (e.g., Light Green fill with Dark Green text) for status indicators to keep them legible but not distracting.
- **Tables:** No vertical borders. Only horizontal dividers in `#f1f5f9`. Header row should be `#f8fafc` with `label-md` typography.
- **Tabs:** Underline style for page-level navigation; pill-style for internal card filtering.