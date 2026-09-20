# Frontend Architecture & Pluggable Model Integration
**Project:** SIH 2026 PS26070 - Tropical Cyclone Intelligence System

---

## 1. System Overview

The frontend is built using React 18, TypeScript, Vite, Tailwind CSS, Leaflet (React-Leaflet), and Recharts.

```
frontend/src/
├── design/             # Design system tokens, themes, typography
│   ├── tokens.ts
│   └── theme.ts
├── components/         # Reusable UI primitives
│   ├── common/         # Badges, Cards, Disclaimers, StateContainers
│   ├── layout/         # Sidebar, TopBar, HelpModal
│   └── map/            # CycloneMap, MapLegend
├── context/            # CycloneContext (State & event bus)
├── services/           # Mock data, API adapters, WebSocket hooks
├── types/              # Domain models (Storm, Forecast, Alert, Modality)
├── views/              # Page views (Overview, StormAnalysis, Forecast, etc.)
└── App.tsx             # Root layout container
```

---

## 2. Pluggable Model Adapter Interface

The application decouples model inference from UI presentation using standardized contracts:

```typescript
export interface PluggableModelForecast {
  storm_id: string;
  model_name: string;       // e.g. "NIO-DualNet v1.4.2"
  horizon_hours: number;    // 6, 12, 24, 48, 72
  predicted_lat: number;
  predicted_lon: number;
  position_uncertainty_km: number;
  wind_speed_p50_kt: number;
  wind_speed_p10_kt: number;
  wind_speed_p90_kt: number;
  pressure_p50_hpa: number;
  confidence_score: number; // 0.0 to 1.0
  modalities_used: string[];
  missing_modalities: string[];
}
```

This guarantees that when the ML team finishes training PyTorch/ONNX models, outputs can be fed directly into `CycloneContext` without UI modifications.
