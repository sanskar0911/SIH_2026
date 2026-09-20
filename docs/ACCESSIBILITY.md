# Accessibility Guidelines (WCAG 2.1 AA Compliance)
**Project:** SIH 2026 PS26070 - Tropical Cyclone Intelligence System

---

## 1. Compliance Requirements

The application targets WCAG 2.1 AA compliance across all views to ensure usability by meteorologists, emergency responders, and administrators with diverse abilities.

---

## 2. Key Standards

### A. Non-Color Alone Rule
Critical status information must NEVER rely solely on color. Every status badge combines:
- **Color** (e.g. Amber `#f59e0b`)
- **Text Label** (e.g. `DEGRADED`)
- **Icon** (e.g. `AlertTriangle`)
- **Border / Shape** (Dashed or solid border badge)

### B. Keyboard Navigation & Focus Rings
- All interactive controls (buttons, navigation items, map toggles, horizon sliders) are navigable via standard `Tab` and `Shift+Tab`.
- Focusable elements display a high-contrast focus ring (`ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950`).

### C. Color Contrast Ratio
- Normal text (14px-18px) maintains a contrast ratio of at least 4.5:1 against dark backgrounds (`#070a12`, `#0e1424`).
- Large headers and badge text maintain at least 3.0:1 contrast.

### D. Reduced Motion (`prefers-reduced-motion`)
- All animations (pulsing live dots, smooth tab transitions) honor user motion preferences.
- When `prefers-reduced-motion: reduce` is active, css transitions are disabled or set to instantaneous step transitions.

### E. Screen Reader Accessibility (ARIA)
- Map layers, live clock, and data freshness counters include `aria-label` and `aria-live="polite"` attributes to notify assistive tech during real-time data updates.
