# TC-INTEL INDIA — Tropical Cyclone Intelligence System
**SIH 2026 Problem Statement PS26070**  
*AI/ML-Based Identification, Classification, and Prediction of Tropical Cyclone Patterns in the North Indian Ocean*

---

## 🌟 Key Highlights & Implementation Overview

- **Offline Demo & MOSDAC Bypass Mode**: Runs seamlessly out-of-the-box without paid map keys or MOSDAC credentials (`MOCK_DATA_MODE=true`, `MOSDAC_ENABLED=false`).
- **Abstracted Ingestion Layer**: Polymorphic `SatelliteProvider` pattern cleanly decouples downstream forecast logic from live satellite sources (`MockSatelliteProvider` for `DEMO-BOB-001` vs `MOSDACSatelliteProvider`).
- **Backend-Driven Asymmetric Wind Field**: Real-time 4-quadrant (`NE`, `SE`, `SW`, `NW`) nautical mile wind radius calculations for gale-force (`R34`), storm-force (`R50`), and hurricane-force (`R64`) winds.
- **Smooth 72-Point GeoJSON Generation**: Cosine-interpolated 72-point smooth polygon generator ensuring strict physical containment ($R64 \subset R50 \subset R34$).
- **Interactive Leaflet Visualization**: Dynamic GeoJSON map overlay with forecast horizon scrubbing (`0h`, `+6h`, `+12h`, `+24h`, `+48h`, `+72h`), interactive popups, and right-panel NM tables.

---

## 🚀 Quick Start Guide

### 1. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure default flags are set:
```env
MOCK_DATA_MODE=true
MOSDAC_ENABLED=false
```

### 2. Run Backend (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation available at: `http://127.0.0.1:8000/docs`

### 3. Run Frontend (React + Vite + TypeScript)
```bash
cd frontend
npm install
npm run dev
```
Frontend Web UI available at: `http://localhost:5173`

---

## 🧪 Running Unit Tests

To run the backend wind field and provider test suite:
```bash
cd backend
python -m pytest tests/test_windfield.py
```

---

## 📡 API Endpoints

### 1. Get Storm Wind Field
`GET /api/v1/storms/{storm_id}/wind-field?forecast_hour=0`
- Returns 4-quadrant radii (`R34`, `R50`, `R64`) and GeoJSON 72-point polygons.

### 2. Get Forecast Wind Field
`GET /api/v1/storms/{storm_id}/wind-field/forecast?forecast_hour=24`
- Dynamically shifts storm center coordinates and expands wind field geometry along forecast trajectory.

---

## 🛡️ License & Disclaimers
This project is developed for **Smart India Hackathon (SIH) 2026 PS26070**. AI outputs provide operational decision support and do not replace official IMD/RSMC bulletins.
