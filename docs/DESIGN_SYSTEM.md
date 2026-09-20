# Design System Specification
**Project:** SIH 2026 PS26070 - Tropical Cyclone Intelligence System
**Version:** 1.0.0

---

## 1. Design Philosophy

> **"Simple by default. Detailed on demand. Honest at all times."**

The UI is designed for operational scientific decision-support. It avoids dark patterns, unnecessary cyberpunk/neon flourishes, and visual clutter, while delivering a calm, trustworthy, GIS-and-weather-inspired interface.

---

## 2. Color Palette & Semantic Tokens

### Color Semantics Matrix
| Category | Usage | Hex Code | HSL Representation |
| :--- | :--- | :--- | :--- |
| **Background Dark** | Root app background | `#070a12` | `hsl(225, 45%, 5%)` |
| **Sidebar / Surface** | Container & Navigation panel | `#090d19` | `hsl(225, 40%, 6%)` |
| **Card Surface** | Section & card panels | `#0e1424` | `hsl(222, 44%, 10%)` |
| **Border Neutral** | Card & divider outlines | `#1e293b` | `hsl(215, 28%, 17%)` |
| **Text Primary** | High-contrast headers | `#f8fafc` | `hsl(210, 40%, 98%)` |
| **Text Secondary** | Subheaders & body text | `#94a3b8` | `hsl(215, 16%, 65%)` |
| **Text Muted** | Metadata & captions | `#64748b` | `hsl(215, 16%, 47%)` |
| **Information / Observed** | Cyan / Blue accent | `#06b6d4` | `hsl(189, 94%, 43%)` |
| **Healthy / Normal State** | Status `GOOD` | `#10b981` | `hsl(160, 84%, 39%)` |
| **Caution / Degraded** | Status `DEGRADED` / `STALE` | `#f59e0b` | `hsl(38, 92%, 50%)` |
| **Critical / High Risk** | Status `FAILED` / High Risk | `#ef4444` | `hsl(0, 84%, 60%)` |
| **Unavailable / Neutral** | Status `UNAVAILABLE` | `#64748b` | `hsl(215, 16%, 47%)` |

---

## 3. Typography Scale

Hierarchy adheres to legible reading standards. Font size below 11px is strictly avoided for operational information.

```
Page Title (H1):     28px – 32px (font-bold, tracking-tight)
Section Header (H2): 20px – 24px (font-semibold)
Card Header (H3):    16px – 18px (font-medium)
Body Regular:        14px – 16px (font-normal)
Caption / Metadata:  12px – 13px (font-mono / font-normal)
Badge / Micro Tag:   11px – 12px (font-mono font-semibold)
```

---

## 4. Spacing & Visual Density

- **Container Gap:** 16px (`gap-4`) to 24px (`gap-6`) between major dashboard cards.
- **Internal Card Padding:** 16px (`p-4`) or 20px (`p-5`).
- **Progressive Disclosure:** Advanced diagnostic metrics are collapsed into expandable drawers or tabs to minimize cognitive load.

---

## 5. Map Visualization Standards

- **Actual Track:** Solid cyan line (`#06b6d4`) with circular waypoint markers.
- **Forecast Track:** Dashed amber line (`#f59e0b`) with step markers (6h, 12h, 24h, 48h, 72h).
- **Uncertainty Cone:** Semi-transparent polygon (`rgba(245, 158, 11, 0.18)` with dashed outline).
- **Cyclone Center:** Concentric ring marker with Category badge (e.g. `CS`, `SCS`, `VSCS`, `Super Cyclone`).
