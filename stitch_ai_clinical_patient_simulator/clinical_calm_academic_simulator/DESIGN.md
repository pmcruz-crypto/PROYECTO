---
name: Clinical Calm & Academic Simulator
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
  on-surface-variant: '#45474c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#001334'
  on-tertiary: '#ffffff'
  tertiary-container: '#00275b'
  on-tertiary-container: '#4c8dff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '500'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Newsreader
    fontSize: 30px
    fontWeight: '500'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 30px
    fontWeight: '500'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-transcript:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an environment of therapeutic calm, institutional rigor, and intense clinical focus. Created specifically for simulated psychological patient encounters, the visual language balances the warmth required for therapeutic empathy with the analytical precision demanded by higher clinical education.

The design movement combines **Contemporary Academic Minimalism** with **Clinical Surface Layering**. The visual weight avoids both sterile laboratory coldness and playful gamification. Instead, it projects the quiet authority of a medical journal paired with the human responsiveness of a modern therapy clinic. Visual tension is deliberately suppressed; contrast is directed strictly toward diagnostic cues, transcription analysis, and behavioral performance metrics.

Interfaces must feel serene, focused, and distraction-free, minimizing cognitive strain during tense simulated diagnostic sessions.

## Colors

The palette establishes an emotional cadence of composure and analytical objectivity. 

- **Primary (`#1E293B` Deep Slate / Obsidian Blue):** Grounds structural chrome, header text, and core navigation. Conveys diagnostic rigor and institutional weight.
- **Secondary (`#059669` Clinical Sage / Emerald):** Signifies therapeutic rapport, psychological safety, empathy indicators, and positive diagnostic milestones. Supported by tints (`#D1FAE5`, `#E6F4EA`) for analytical transcript badges.
- **Tertiary (`#3B82F6` Cognitive Cobalt):** Reserved for technical instrumentation, active AI listening states, audio feed meters, and interactive session timelines.
- **Neutral (`#64748B` Slate Gray):** Handles secondary data, metadata, citation details, and subtle structure.
- **Surface Canvas (`#F8FAFC` to `#F1F5F9`):** Pristine clinical off-white surfaces provide natural eye relief during multi-hour consultation reviews. Containers utilize pure `#FFFFFF` with whisper-weight micro-borders.

Analytical token roles include dedicated states for linguistic evaluation:
- *Open Inquiry Accent:* Soft Mint (`#D1FAE5` background, `#047857` foreground)
- *Closed Inquiry Accent:* Slate Wash (`#F1F5F9` background, `#475569` foreground)
- *Cognitive Bias / Friction:* Amber Ochre (`#FEF3C7` background, `#B45309` foreground)
- *Empathy Resonance Indicator:* Soft Sage (`#E6F4EA` background, `#065F46` foreground)

## Typography

The typographic hierarchy implements an intentional dialogue between **Newsreader** (an authoritative, academic serif) and **Plus Jakarta Sans** (an open, humanized sans-serif).

- **Newsreader** serves as the academic voice: case file summaries, simulated patient diagnostic profiles, DSM-5 / ICD-11 category headers, and formal clinical evaluative outcomes. It imparts dignity and traditional clinical weight.
- **Plus Jakarta Sans** carries interactive components, patient dialog bubbles, interview transcription feeds, and clinical sidebars. Its subtle humanist curvature maintains warmth and clarity during prolonged case intake sessions.
- **Inter** handles data tables, timestamp labels, audio frequency readouts, and analytical tagging (e.g., distinguishing open-ended inquiries from interrogative phrasing).

## Layout & Spacing

The simulation layout relies on an anchored **three-panel clinical workstation grid**:

1. **Left Dossier Rail (280px - 320px fixed on desktop):** Patient background, presenting symptoms, current emotional state indicator, and session goals.
2. **Central Consultation Canvas (Fluid flex-grow):** Real-time interactive patient video/audio avatar, live waveform feedback, and active question dispatch bar.
3. **Right Analytical Monitor (360px - 420px desktop):** Live transcript with AI NLP tagging, therapeutic alliance metrics, and private trainee clinical notepad.

### Breakpoint Strategy
- **Desktop (1280px+):** Full 3-column workstation with persistent clinical notes and real-time audio visualization.
- **Tablet Landscape (1024px - 1279px):** Two-column split. Patient interaction occupies primary column; Dossier and Live Analytics live within collapsible secondary drawers with persistent tab switching.
- **Tablet Portrait & Mobile (<1023px):** Single vertical stream prioritized for conversational interaction. Audio input and transcript are sticky at the viewport baseline; clinical dossier and feedback charts are housed in an accessible bottom-sheet interface.

## Elevation & Depth

Visual hierarchy uses **tonal layering paired with calibrated low-contrast perimeter lines**, avoiding heavy drop shadows that clutter dense data views.

- **Level 0 (Base Canvas):** `#F8FAFC`. Static frame of the clinical application.
- **Level 1 (Clinical Dossier & Structural Cards):** Pure `#FFFFFF` surface bordered by a 1px solid hairline ring of `#E2E8F0`. Shadow is purely ambient: `0 1px 3px rgba(30, 41, 59, 0.04)`.
- **Level 2 (Active Modals, Session Control Overlays):** `#FFFFFF` surface, border `1px solid #CBD5E1`, with an expanded diffuse shadow: `0 10px 25px -5px rgba(30, 41, 59, 0.08), 0 8px 10px -6px rgba(30, 41, 59, 0.04)`.
- **Level 3 (AI Analytical Highlights & Tooltips):** Floating micro-surfaces with a subtle slate tint (`#0F172A` at 95% opacity for dark tooltips, or crisp white with `#3B82F6` 15% halo for active transcript hints).
- **Glassmorphism Threshold:** Audio waveforms and streaming controls hovering directly over the simulated patient feed employ `backdrop-filter: blur(12px)` over a 80% opacity `#FFFFFF` or `#0F172A` base to preserve spatial continuity without blocking facial cues.

## Shapes

The interface embraces a **Balanced Rounded** contour architecture (`roundedness: 2`).

- Component surfaces (case cards, clinical notes, transcript containers) utilize `0.5rem` (`8px`) radii, conveying grounded structure.
- Modal panels and interactive avatar viewports soften to `rounded-lg` (`1rem` / `16px`).
- Real-time status tags, speech badges, and audio input indicators use full pill profiles (`rounded-full` / `9999px`) to immediately separate qualitative diagnostic tags from structural cards.

## Components

### Buttons & Interactive Controls
- **Primary Action (e.g., "Iniciar Sesión Clínica", "Emitir Diagnóstico"):** Solid `#1E293B` slate background, crisp `#FFFFFF` typography, `0.5rem` radius. Subtle hover state shift to `#2A3B53`.
- **Therapeutic Intervention (e.g., "Intervención Empática"):** Solid `#059669` sage green with `#FFFFFF` text. Focus rings display a 2px offset mint halo (`#A7F3D0`).
- **Secondary / Ghost:** Transparent background with hairline border `#CBD5E1`, text `#334155`.

### Diagnostic & Category Badges
- **Case Difficulty & DSM Categories:** Pill-shaped (`rounded-full`), padded with `space-xs` vertically and `space-sm` horizontally.
  - *Advanced / Severe Pathology:* Background `#FEF2F2`, border `#FECACA`, text `#991B1B`.
  - *Standard Case / Neurosis:* Background `#F0FDF4`, border `#BBF7D0`, text `#166534`.
  - *Pediatric / Adolescent:* Background `#EFF6FF`, border `#BFDBFE`, text `#1E40AF`.

### Transcript Stream & Analytical Annotations
- Utterances are formatted in alternating offset card rows with speaker attribution labels in `label-sm`.
- **Inline Text Highlight Overlays:**
  - *Open Inquiry (Pregunta Abierta):* Dotted bottom highlight in `#059669` with an interactive badge on hover displaying the psychometric rationale.
  - *Closed / Suggestive Query (Pregunta Inductiva):* Amber wash with an alert icon to indicate premature clinician bias.
  - *Empathy Marker:* Mint-tinted micro-border on the left boundary (3px solid `#10B981`) validating active listening techniques.

### Clinical Speech & Audio Visualizer
- Real-time patient/trainee voice input visualized as a clean, rounded vertical bar spectrum (24 to 32 discrete bars). Active amplitude glows softly with `#3B82F6` and `#10B981`. Inactive speech segments settle to `#CBD5E1`.

### Clinical Notes Sidebar
- Simulates an authoritative medical chart. Structured with tabbed clinical observation matrices, DSM-5 criterion checklists, and a Markdown-ready freehand diagnostic synthesis area with automatic background draft preservation indicators.

### Progress & Alliance Gauges
- Linear and circular meters measuring **Alianza Terapéutica (Therapeutic Alliance)** and **Rapport Score**. Constructed with calm `#E2E8F0` tracks and smooth `#059669` fills. Sharp transitions are suppressed in favor of gentle ease-out interpolations to prevent trainee anxiety during active evaluation.