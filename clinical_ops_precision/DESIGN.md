---
name: Clinical Ops Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#43474e'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#435f89'
  primary: '#002043'
  on-primary: '#ffffff'
  primary-container: '#17365d'
  on-primary-container: '#84a0cd'
  inverse-primary: '#acc8f7'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#001f4b'
  on-tertiary: '#ffffff'
  tertiary-container: '#003374'
  on-tertiary-container: '#6a9dff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#acc8f7'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#2b486f'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
  label-lg:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.02em
  telemetry-data:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: -0.01em
  telemetry-unit:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '400'
    lineHeight: 0.875rem
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system is engineered for mission-critical quarantine and biocontainment clinical operations where split-second triage and absolute situational awareness are mandatory. The brand aesthetic merges the crisp, data-dense utility of Linear and Vercel with the calm, institutional authority of enterprise medical infrastructure.

The visual direction follows a **Corporate / Modern High-Density** paradigm:
- **Calm, High-Reliability Demeanor**: De-escalates high-stress containment environments through disciplined neutral grays, pure white surfaces, and low-cognitive-load layouts.
- **Zero Ambiguity**: Crisp delineation between stable baselines, warnings, and biometric alert thresholds using deterministic, standardized status indicators.
- **Micro-Precision Utility**: High-density tables, monospaced tabular telemetry, and hairline structural borders that maximize usable screen real estate across continuous 24/7 monitoring shifts.

## Colors

The palette establishes an authoritative clinical environment with immediate contrast between systemic framing, active clinical interventions, and urgent telemetry alerts.

### Palette Architecture
- **Primary (`#17365D`)**: Deep Maritime Navy. Anchors top navigation bars, facility header contexts, primary action buttons, and dominant typographic hierarchy.
- **Secondary (`#0D9488`)**: Medical Deep Teal. Governs active clinical workflows, completed protocol steps, focused tabs, and clinical interaction triggers.
- **Tertiary (`#3B82F6`)**: Medical Diagnostic Blue. Allocated strictly for informational notices, attending physician reviews, chart annotations, and unread nursing handover notes.
- **Neutral (`#64748B`)**: Slate Gray. Drives structural grid lines, secondary metadata labels, iconography, and subtle disabled states.
- **Base Canvas (`#F7F9FC`)**: Cool sterile gray canvas offering soft relief against prolonged high-luminance display glare.
- **Card Surface (`#FFFFFF`)**: Pure medical white, paired with hairline `#E2E8F0` borders for maximum card separation.

### Operational Semantic Tokens
- **Stable / Cleared (`#10B981`)**: Negative pathogen loads, completed vital sweeps, discharge clearances, compliant oxygen saturation.
- **Triage / Caution (`#F59E0B`)**: Borderline fever spikes (37.8°C–38.4°C), pending lab culture runs, medications due within 15 minutes.
- **Critical / Breach (`#EF4444`)**: Acute vital collapse, fever alerts (≥38.5°C), negative-pressure airflow failures, overdue round intervals.
- **Demo / Synthetic Indicator (`#8B5CF6`)**: Explicit deep violet badge indicator for mock telemetry sweeps and uncommitted training shifts.

## Typography

The typography architecture uses **Inter** for UI control structures and operational summaries, complemented by **JetBrains Mono** for numerical vitals, ISO-8601 timestamps, isolation pod IDs, and bed numbers.

### Key Typographic Rules
- **Tabular Figures by Default**: All numerical readouts (temperature, SpO2, heart rate, countdown timers) must enable OpenType tabular numbers (`tnum`) to eliminate spatial layout shifts during real-time data streaming.
- **Telemetry Pairing**: Always pair metric values rendered in `telemetry-data` with an uppercase `telemetry-unit` label in `neutral_color_hex` at 70% opacity.
- **Hierarchy Restraint**: Avoid heavy display typefaces. Maximum heading weight is restricted to `700` at the facility-summary scale to preserve an analytical, non-dramatic reporting tone.

## Layout & Spacing

The dashboard operates on a strict **12-column fluid grid system** anchored to a compact 4px base rhythm designed for dense clinical situational displays.

### Layout Mechanics
- **Desktop (≥1280px)**: 12-column grid, `margin-desktop` (32px), `gutter-desktop` (24px). Accommodates a fixed 240px facility triage rail, an 8-column ward bed matrix (visualizing the 74 beds across 4 containment wings), and a 4-column dedicated real-time telemetry stream.
- **Tablet (768px - 1279px)**: 8-column grid, 16px margins, 16px gutters. Triage rail collapses into a compact icon strip; bedside cards convert into two-wide grid modules.
- **Mobile (<768px)**: 4-column reflow, 16px margins, 12px gutters. Telemetry streams collapse beneath active bed selector tabs.

### Spatial Rhythms
- Use `space-xs` (4px) and `space-sm` (8px) for internal pill padding, telemetry badge gaps, and micro-metric pairings.
- Use `space-md` (12px) for card body padding in ultra-dense table rows and ward room mini-cards.
- Use `space-lg` (16px) for standard container interior padding and panel headers.
- Outer panel separations adhere strictly to `space-xl` (24px) to retain structural clarity without wasting viewport height.

## Elevation & Depth

Visual hierarchy uses a refined hybrid of **low-contrast micro-outlines** and **shallow ambient enterprise shadows**, avoiding high-displacement elevation layers in favor of pure analytical structure.

### Elevation Tiers
1. **Canvas Layer (Level 0)**: `#F7F9FC` background. Completely flat with zero shadows.
2. **Structural Container (Level 1)**: Base bed cards, data tables, metrics modules. Uses a solid `#FFFFFF` fill with a continuous `1px solid #E2E8F0` border and an ambient shadow: `box-shadow: 0 1px 3px 0 rgba(23, 54, 93, 0.04), 0 1px 2px -1px rgba(23, 54, 93, 0.02)`.
3. **Hover & Interactive State (Level 2)**: Bed cards on cursor engagement, active dropdowns. Border deepens to `#CBD5E1` with an elevated enterprise shadow: `box-shadow: 0 4px 6px -1px rgba(23, 54, 93, 0.06), 0 2px 4px -2px rgba(23, 54, 93, 0.04)`.
4. **Overlay Modals & Critical Flyouts (Level 3)**: Patient intake drawers, rapid isolation transfer modals: `box-shadow: 0 10px 15px -3px rgba(23, 54, 93, 0.1), 0 4px 6px -4px rgba(23, 54, 93, 0.06)`. Border color remains `#E2E8F0`.

### Tonal Status Framing
When a bed enters a critical warning state, do not elevate via heavy shadows. Instead, apply an inset semantic indicator: `border-color: #EF4444` accompanied by a 3px solid vertical left accent bar in the corresponding semantic color.

## Shapes

The interface balances precision and utility with a unified radius index of **Level 2 (Rounded)**:

- **Base Radius (`0.5rem` / 8px)**: Standard UI controls, text inputs, dropdown toggles, and nested metric chips.
- **Card Radius (`rounded-lg` / `1rem` / 16px)**: Bed isolation units, clinical ward containers, overview metric summary modules, and sliding triage panels.
- **Tag & Metric Pill Radius (`9999px` / full circle)**: Semantic state indicators, fever tags, demo indicators, bed status pills.
- **Divider Hairlines**: Strict 1px borders with zero corner blending.

## Components

### Buttons
- **Primary**: Solid Deep Navy (`#17365D`), text `#FFFFFF`, 8px border-radius, font `label-lg`. Micro hover transition shifting background to `#0F243E`. Padding: `8px 16px`. Focus ring: 2px offset with `#0D9488`.
- **Secondary / Action**: Solid Medical Teal (`#0D9488`), text `#FFFFFF`. Reserved for direct patient protocol activations (e.g., "Log Round", "Order PCR Re-test"). Hover: `#0F766E`.
- **Subtle / Ghost**: Transparent fill, 1px border `#E2E8F0`, text `#17365D`. Background turns to `#F1F5F9` on hover.

### Badges & Semantic Pills
- Rendered with full pill radius (`9999px`), padding `2px 8px`, typography `label-md`.
- **Stable (`#10B981`)**: Background `#ECFDF5`, text `#065F46`, border `1px solid #A7F3D0`.
- **Warning / Pending (`#F59E0B`)**: Background `#FFFBEB`, text `#92400E`, border `1px solid #FDE68A`.
- **Critical Breach (`#EF4444`)**: Background `#FEF2F2`, text `#991B1B`, border `1px solid #FECACA`. Includes a 6px pulsing dot prefix.
- **Synthetic / Demo Data**: Background `#F5F3FF`, text `#5B21B6`, border `1px solid #DDD6FE`, with text reading `SYNTHETIC TELEMETRY`.

### High-Density Data Tables
- Row height fixed at 40px for maximum vertical capacity.
- Alternate row background: None (pure white), divided by `1px solid #F1F5F9`. Hover state applies `#F8FAFC`.
- Header row: Uppercase `label-md` in `#64748B`, background `#F8FAFC`, border-bottom `1px solid #E2E8F0`.
- Cells containing vitals utilize `telemetry-data` styling aligned right; patient name and isolation IDs align left.

### Bed Status Cards (74-Bed Grid)
- Constructed with `rounded-lg` (16px), pure white canvas, `1px solid #E2E8F0`.
- Internal structure divided into 3 zones:
  1. **Top Bar**: Bed ID (e.g., `ISO-B-14`) in `telemetry-data`, patient triage pill, and elapsed time since last nurse sweep.
  2. **Vitals Matrix**: 2x2 grid displaying Temp (°C), SpO2 (%), Pulse (BPM), and Respiration Rate. Values styled in `telemetry-data`.
  3. **Footer**: Assigned clinician initials avatar, pending protocol count, and quick-action icon button.

### Form Inputs & Telemetry Filters
- Height: 36px. Border: `1px solid #CBD5E1`, background `#FFFFFF`, text `body-md`. Focus: `#0D9488` border with 0 0 0 2px rgba(13, 148, 136, 0.15).
- Input groups include explicit monospaced unit prefixes/suffixes (e.g., `mmHg`, `°C`, `min`).

### Navigation & Facility Breadcrumbs
- Facility switcher header anchored in Deep Navy with high-contrast `#FFFFFF` text.
- Sub-navigation breadcrumbs: Minimalist inline pathway (`Facility Alpha` > `Zone 2: Air-Lock Containment` > `Bed 42`), using `0.875rem`, separated by `#94A3B8` forward slashes with tabular bed locator indicators.