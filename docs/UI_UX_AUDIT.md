# UI/UX Audit & Refactoring Strategy
**Project:** SIH 2026 PS26070 - AI/ML-Based Identification, Classification & Prediction of Tropical Cyclone Patterns
**Document Version:** 1.0.0
**Target System:** India-Focused Human-Centered & Ethical Cyclone Intelligence Platform

---

## 1. Executive Summary & Audit Overview

This audit evaluates the existing prototype of the **Tropical Cyclone Intelligence System**. The application possesses a rich set of frontend views, backend data models, mock data generators, and simulation features. However, the current navigation and visual presentation suffer from:
1. **Developer/Service-Centric Navigation:** Exposing 14+ flat, tech-heavy navigation buttons (e.g., `Cyclone Detection`, `Live Intelligence`, `System Architecture`) instead of a operational role-focused hierarchy.
2. **Lack of Ethical AI Safeguards & Trust Signals:** Absence of clear visual demarcations between **OBSERVED** data, **AI PREDICTIONS**, **UNCERTAINTY**, and **OFFICIAL GOVERNMENT WARNINGS** (IMD/RSMC).
3. **Overloaded Command Center:** Presenting raw technical metrics without progressive disclosure, forcing general users to digest complex diagnostic metrics instantly.
4. **Missing "Insufficient Evidence" & "Degraded" Explicit States:** UI forced predictions even when satellite sensor channels were missing, risking false confidence.
5. **Monolithic App Structure:** `App.tsx` and duplicated state in views without a cohesive design token system.

---

## 2. Screen-by-Screen Audit Matrix

| Screen ID / Route | Current Purpose | Primary Components | Identifiable Issues / Gaps | Actionable Directive |
| :--- | :--- | :--- | :--- | :--- |
| **`overview`** | Command Center for active storm | `OverviewView`, `CycloneMap`, Metrics Cards | Overcrowded header, flat metric distribution, lack of explicit IMD disclaimer. | **Refactor:** Standardize into high-level Command Center with 30s situational awareness, explicit official warning disclaimer, and collapsible Analyst evidence panel. |
| **`storm_analysis`** | Multi-channel analysis | `StormAnalysisView`, Satellite channel tabs | Technical jargon (`WVW`, `CMV`, `OOD`) shown without plain-language explanations or info buttons. | **Refactor:** Add progressive disclosure, expandable definitions, and modality contribution sliders (counterfactual toggle). |
| **`forecast`** | Track & Intensity forecast | `ForecastView`, Track line charts | Deterministic presentation of tracks without explicit ±km position uncertainty range per horizon. | **Refactor:** Enforce P10/P50/P90 probability bands, Haversine position error bounds, and model confidence badges. |
| **`genesis_watch`** | Pre-cyclone candidate tracking | `GenesisWatchView`, Candidate list | Raw probability threshold text without persistence/repeat-evidence indicators. | **Merge:** Relocate under **ANALYSIS -> Genesis & Intensity** section with clear watch levels (Genesis Watch). |
| **`satellite_data`** | Raw satellite channels | `SatelliteDataView` | Duplicate of storm analysis satellite tabs. | **Merge:** Combine into **ANALYSIS -> Storm Analysis** viewer with multi-channel toggle. |
| **`historical_replay`** | Timeline replay of past storms | `HistoricalReplayView`, Timeline bar | Replay timeline functional but lacks side-by-side **AI Forecast vs Actual Best Track** error delta. | **Refactor:** Enhance timeline scrubber, add Haversine error calculations (6h, 12h, 24h, 48h, 72h) and persistence baseline comparisons. |
| **`alerts`** | Active alerts & warnings | `AlertsView`, Alert feed | Alerts present raw threshold expressions (`RI_PROBABILITY > 0.72`) instead of plain-language operational summaries. | **Refactor:** Transform into operational alerts (Genesis Watch, RI Watch, Land Interaction) with clear prototype disclaimers. |
| **`explainability`** | AI attribution & attention maps | `ExplainabilityView`, GradCAM maps | Good visual heatmaps, but missing counterfactual modality removal impact test. | **Refactor:** Incorporate active modality toggles ("What if microwave is missing?") showing computed intensity delta. |
| **`model_performance`**| AI validation metrics | `ModelPerformanceView`, Metrics tables | Technical tables without dataset/version provenance metadata. | **Refactor:** Include Model Governance details (Champion vs Challenger model, validation storm count, Brier scores). |
| **`data_health`** | Pipeline status & data freshness | `DataHealthView`, Sensor status | Lacks standard semantic data status badges across the board. | **Refactor:** Standardize state definitions (`GOOD`, `DEGRADED`, `STALE`, `UNAVAILABLE`, `INSUFFICIENT EVIDENCE`). |
| **`analyst_feedback`**| Human-in-the-loop center | `AnalystFeedbackView`, Annotation form | Good forms, but corrections could be mistaken as destructive to raw model output. | **Refactor:** Explicitly preserve raw AI outputs alongside Analyst Annotations in non-destructive history. |
| **`system_architecture`**| Architectural overview | `SystemArchitectureView` | Developer overview exposed to operational users. | **Move:** Relocate under **SETTINGS / SYSTEM -> Diagnostics & Architecture**. |

---

## 3. Preservation & Refactoring Directives

### A. Components & Features to Preserve
- **Interactive Leaflet Map (`CycloneMap.tsx`):** Preserve Leaflet integration, storm track rendering, custom SVG markers, and layer controls.
- **WebSocket & Context Infrastructure (`CycloneContext.tsx`):** Preserve live clock, simulated real-time ticks, alert state management, and annotation storage.
- **Backend FastAPI API & PostgreSQL Schemas (`backend/app`):** Maintain full schema compatibility for Storms, Observations, Forecasts, Alerts, Annotations, and Explanations.

### B. Core Refactoring Priorities
1. **Design System & Semantic Design Tokens:** Establish CSS custom properties / Tailwind design tokens for background layers, surface panels, text hierarchy, and semantic status indicators (`GOOD`, `DEGRADED`, `STALE`, `UNAVAILABLE`, `INSUFFICIENT EVIDENCE`).
2. **Ethical AI UI Layer (`EthicalBadge`, `OfficialDisclaimer`, `ConfidenceIndicator`):** Implement explicit labels on every screen distinguishing `OBSERVED`, `AI ESTIMATE`, `FORECAST`, `UNCERTAINTY`, and `OFFICIAL WARNING`.
3. **User-Centered Primary Navigation:** Replace flat 14-item navigation bar with grouped, progressive-disclosure navigation:
   - **OVERVIEW:** Command Center, Forecast Map
   - **ANALYSIS:** Storm Analysis, Genesis & Intensity, Historical Replay
   - **ALERTS:** Active Alerts, Alert History
   - **SYSTEM:** Data Status, AI Performance, Analyst Review
   - **SETTINGS:** System & Help
4. **App Shell & TopBar Enhancement:** Elevate the global shell to show current UTC data time, system operational status (`LIVE`, `DEGRADED`, `DEMO`), active model version (`v1.4.2 DualNet`), user role toggle (`PUBLIC`, `ANALYST`, `ADMIN`), and instant help overlay.
5. **Accessibility & Responsive Polish:** Full keyboard navigation, visible focus indicators, color-blind safe status combinations (Icon + Color + Text), screen-reader labels, and `prefers-reduced-motion` compliance.

---

## 4. Conclusion & Recommended Action Plan

The existing system provides a solid foundational architecture. With the execution of the 9-Phase implementation plan, the application will evolve into a scientifically trustworthy, human-centered, and ethically grounded operational cyclone decision-support platform for India and the North Indian Ocean.
