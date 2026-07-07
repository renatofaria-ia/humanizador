---
name: Warm-Clear Editorial Workspace
colors:
  surface: '#f9f9ff'
  surface-dim: '#d4daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e8eeff'
  surface-container-high: '#e3e8f9'
  surface-container-highest: '#dde2f3'
  on-surface: '#161c27'
  on-surface-variant: '#56423e'
  inverse-surface: '#2a303d'
  inverse-on-surface: '#ecf0ff'
  outline: '#89726d'
  outline-variant: '#ddc0bb'
  surface-tint: '#a03f30'
  primary: '#9d3d2e'
  on-primary: '#ffffff'
  primary-container: '#bd5444'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb4a7'
  secondary: '#496177'
  on-secondary: '#ffffff'
  secondary-container: '#c9e2fd'
  on-secondary-container: '#4d657b'
  tertiary: '#615b59'
  on-tertiary: '#ffffff'
  tertiary-container: '#7a7371'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a7'
  on-primary-fixed: '#400200'
  on-primary-fixed-variant: '#80281b'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#b0c9e3'
  on-secondary-fixed: '#011d31'
  on-secondary-fixed-variant: '#31495e'
  tertiary-fixed: '#eae0de'
  tertiary-fixed-dim: '#cdc5c2'
  on-tertiary-fixed: '#1f1b19'
  on-tertiary-fixed-variant: '#4b4644'
  background: '#f9f9ff'
  on-background: '#161c27'
  surface-variant: '#dde2f3'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is centered on a "Warm-Clear" aesthetic, blending the precision of a professional editorial workspace with the inviting atmosphere of a private study. It targets writers and editors who require a high-focus environment that feels premium and tactile rather than sterile or overly corporate.

The visual style is a hybrid of **Soft Minimalism** and **Refined Glassmorphism**. It utilizes translucent white cards to create a sense of depth without visual clutter, layered over subtle, atmospheric background gradients. The goal is to evoke a feeling of "operational calm"—where the interface recedes to prioritize content creation while providing a sophisticated, tactile response to user interaction.

## Colors

This color palette balances the "warm" (Terracotta and Pale Peach) with the "clear" (Slate Blue and Ice Blue) to maintain legibility and focus.

- **Primary (Terracotta #C05746):** Used sparingly for primary actions, active states, and critical brand moments. It provides a grounded, organic energy.
- **Secondary (Slate Blue #4A6278):** Used for borders, icons, and secondary metadata to provide structural clarity without the harshness of pure black.
- **Neutral (Deep Slate #1A202C):** Reserved for high-contrast body text and headings to ensure maximum readability during long writing sessions.
- **Background Gradient:** A soft, diagonal sweep from a Pale Peach (`#FFF5F2`) to an Ice Blue (`#F0F4F8`). This serves as the canvas for the workspace.

## Typography

The design system employs **Inter** exclusively to leverage its exceptional legibility and neutral, contemporary character. 

- **Headlines:** Use tighter letter-spacing and heavier weights to create a strong visual anchor for editorial titles.
- **Body Text:** Optimized for long-form reading with a generous line height (`1.6x`) and a slightly softened dark-grey color to reduce eye strain.
- **Labels/Badges:** Utilize uppercase with slight tracking (letter-spacing) to differentiate functional metadata from the primary narrative text.

## Layout & Spacing

The layout utilizes a **Fluid Grid with wide comfortable margins** to maintain the "editorial" feel, ensuring that content never feels cramped. 

- **Grid:** A 12-column system for desktop, collapsing to 1 column for mobile. 
- **Rhythm:** An 8px linear scale governs all padding and margins. 
- **Workspace Focus:** Central editorial areas should be restricted to a max-width of `800px` for optimal reading line-length, even on ultra-wide displays.
- **Mobile Adaption:** Sidebars transition to bottom-sheets or full-screen overlays to preserve the "clean canvas" philosophy.

## Elevation & Depth

Hierarchy is established through **Soft Layering** rather than heavy shadows.

- **Level 0 (Base):** The peach-to-blue gradient background.
- **Level 1 (Surface):** White cards with `85%` opacity and a `12px` backdrop-blur (Glassmorphism). These cards feature a thin, `1px` stroke in `Slate Blue` at `15%` opacity.
- **Level 2 (Float):** Used for tooltips and dropdowns. These use a slightly more opaque white (`95%`) and a very soft, diffused shadow (`0 8px 30px rgba(74, 98, 120, 0.12)`).
- **Interaction:** Upon hover, cards may increase in opacity rather than "rising" via shadow, maintaining a flat, sophisticated feel.

## Shapes

The shape language is consistently **Rounded**. The `0.5rem` (8px) base radius provides a friendly, modern feel that avoids the "engineered" look of sharp corners while remaining more professional than fully pill-shaped containers.

- **Small Components:** Checkboxes and small badges use the `rounded-sm` (4px) setting for precision.
- **Main Cards:** Use `rounded-xl` (24px) to emphasize the soft, "private workspace" aesthetic.

## Components

### Status Badges
Consistent, low-saturation backgrounds with high-contrast text:
- **Rascunho (Draft):** Light Grey background / Dark Slate text.
- **Gerado (Generated):** Light Blue background / Slate Blue text.
- **Em Revisão (In Review):** Pale Terracotta background / Terracotta text.
- **Aprovado (Approved):** Soft Sage background / Deep Green text.
- **Publicado (Published):** Terracotta background / White text.
- **Arquivado (Archived):** Transparent border / Grey text.

### Buttons
- **Primary:** Solid Terracotta, white text, no shadow.
- **Secondary:** Ghost style, Slate Blue border (`1px`), Slate Blue text.
- **Tertiary:** Text-only with an underline appearing on hover.

### Input Fields & Forms
Large, "comfortable" inputs with `16px` internal padding. Borders are `Slate Blue` at `20%` opacity, shifting to `Primary Terracotta` on focus. Use "Helper Text" below fields in `body-sm` to maintain the editorial guidance feel.

### Cards
All cards must implement the glassmorphism effect: `backdrop-filter: blur(12px)` with a semi-transparent white background. This ensures the background gradient subtly bleeds through, keeping the UI light and integrated.