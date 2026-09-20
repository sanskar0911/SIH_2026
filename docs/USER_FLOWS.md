# User Flows & Operational Scenarios
**Project:** SIH 2026 PS26070 - Tropical Cyclone Intelligence System

---

## 1. 30-Second Operational Assessment Flow

**Goal:** A disaster response officer or meteorologist opens the platform and gains complete situational awareness in <30 seconds.

```
Step 1: Open System -> Overview Command Center
Step 2: Read Active Storm Card -> Storm Name (e.g. Cyclone BOJ-01 "ASNA"), Category, Wind (75 kt), Pressure (980 hPa), Movement (WNW @ 14 km/h), Data Freshness (12 min ago).
Step 3: Inspect Interactive Map -> Center position, solid cyan observed track, dashed amber 24h-72h forecast track, semi-transparent uncertainty cone.
Step 4: Check 24-Hour Forecast Horizon -> Position ±35 km, Wind P10/P50/P90 (65 / 75 / 85 kt), Confidence HIGH.
Step 5: Review Risk & Disclaimers -> Coastal Wind Risk HIGH, Heavy Rain MODERATE. Official IMD disclaimer confirmed.
```

---

## 2. Degraded Sensor Simulation Flow

```
Step 1: Navigate to SYSTEM -> Data Status or Storm Analysis.
Step 2: Toggle "Microwave Sensor Offline".
Step 3: UI immediately triggers DEGRADED DATA MODE banner across Overview & Forecast pages.
Step 4: Forecast confidence shifts from HIGH -> MODERATE with badge: "Missing: Passive Microwave".
```

---

## 3. Historical Replay & Model Validation Flow

```
Step 1: Navigate to ANALYSIS -> Historical Replay.
Step 2: Select Historical Storm (e.g. Cyclone Fani - May 2019).
Step 3: Drag Timeline Scrubber to T-24h before landfall.
Step 4: Compare AI Predicted Forecast vs Actual IBTrACS Best Track.
Step 5: View calculated Haversine error: 24h forecast position error = 32.4 km (vs Persistence Baseline = 68.1 km).
```

---

## 4. Analyst Human-in-the-Loop Correction Flow

```
Step 1: Navigate to SYSTEM -> Analyst Review.
Step 2: Inspect current AI estimated center (16.2°N, 88.5°E).
Step 3: Overlay high-res IR satellite channel & cloud motion vectors.
Step 4: Adjust center coordinates to (16.25°N, 88.48°E) and set confidence = "HIGH".
Step 5: Submit Correction -> Logged non-destructively alongside raw AI output in Audit Trail.
