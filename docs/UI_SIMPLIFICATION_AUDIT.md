# UI Simplification & Human-Centered Redesign Audit
**Project:** SIH 2026 PS26070 - TC-INTEL INDIA
**Target Visual Direction:** Clean, High-Hierarchy, Minimal-Noise GIS Operational Interface (Screenshot 1 Reference)
**Functional Target:** Preserve 100% of underlying scientific capabilities (Screenshot 2 Reference)

---

## 1. Audit Summary & Technical Noise Evaluation

The current interface succeeded in integrating multimodal analysis, uncertainty bounds, explainability, historical replay, and analyst feedback. However, it suffers from **technical overload** on the primary Command Center:
- **Excessive Badges & Pills:** 10+ status badges (e.g. `DATA AGE: 04m`, `AI DUALNET ONLINE`, `MOSDAC FEED HEALTHY`, `v1.4.2`, `BOUNDS`, `RI RISK`) competing for user attention in the header and cards.
- **Overused High-Contrast Cyan & Uppercase Text:** Heavy reliance on cyan borders, neon glows, and ALL-CAPS labels (`STORM CLASSIFICATION`, `CENTRAL PRESSURE`, `AI GENESIS & STRUCT. ANALYTICS`).
- **Dense Card Grid:** Command Center displaying 7 metric cards + active storm cards + timeline bar + risk summary simultaneously without progressive disclosure.
- **Buried Primary Information:** First-time users are overwhelmed by engineering diagnostics (OOD, IoU, quantiles, sensor age) instead of immediately identifying:
  1. Is there a cyclone?
  2. Where is it?
  3. How strong is it?
  4. Where is it going?
  5. How uncertain is the forecast?
  6. Is there a significant risk?
  7. Is the underlying data reliable?

---

## 2. Simplification Strategy & Information Architecture

### A. Information Hierarchy Matrix
| Information Level | Description | Destination View Mode |
| :--- | :--- | :--- |
| **Level 1 (Primary)** | Is there a storm? Name, Class, Wind, Pressure, Location, Motion, Risk | **STANDARD VIEW** (Command Center) |
| **Level 2 (Secondary)** | Forecast horizon tracks (6h-72h), Position uncertainty ±km, Data freshness | **STANDARD VIEW** (Command Center / Map) |
| **Level 3 (Advanced)** | Satellite channels (TIR, WV, PMW), Eyewall symmetry, GradCAM maps | **STORM ANALYSIS / EXPLAINABILITY** |
| **Level 4 (Technical/Analyst)**| P10/P50/P90 quantiles, OOD score, Ensemble spread, Latency, GPU/Worker stats | **ANALYST MODE** / **DATA HEALTH** / **AI PERFORMANCE** |

### B. Navigation Restructuring
Replace flat sidebar with clean, grouped hierarchy:
```
OVERVIEW
  - Command Center
  - Live Storms

ANALYSIS
  - Storm Analysis
  - Forecast
  - Genesis Watch

HISTORY
  - Historical Replay

ALERTS
  - Alerts & Risk

SYSTEM
  - Data Health
  - AI Performance

ANALYST
  - Analyst Review

Settings & Help
```

### C. Standard vs Analyst Mode Toggle
- **STANDARD MODE (Default):** Clean, calm, readable UI with normal casing, soft neutral backgrounds, restrained color hierarchy (Green = Good, Amber = Caution, Red = High Risk), and minimal badges.
- **ANALYST MODE:** Unlocks detailed diagnostic panels (P10/P50/P90 quantiles, raw satellite channel controls, OOD scores, ensemble trajectories, API diagnostics).

---

## 3. Component Disposition Plan

- **Preserve:** All backend FastAPI endpoints, WebSocket hooks, PostGIS models, `CycloneContext` state, Leaflet map engine, and mock/live data adapters.
- **Simplify:** Command Center layout (Header, 4 Summary Cards, 70% Map, 1 Focused Active Storm Card, Forecast Horizon Bar).
- **Move to Advanced Views:** Detailed quantile bars -> Analyst Mode; Modality diagnostics -> Data Health / Analyst Mode; Model versioning -> AI Performance.
- **Visual Polish:** Remove neon glow, cyan overload, redundant borders, and excessive uppercase labels.
