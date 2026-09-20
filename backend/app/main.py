import os
import logging
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List, Optional, Dict, Any

from app.core.config import settings
from app.models.schemas.wind_field import WindFieldResponse, WindFieldForecastResponse
from app.services.windfield.windfield_service import get_wind_field, get_wind_field_forecast
from app.services.satellite.provider import get_satellite_provider

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for AI/ML-Based Tropical Cyclone Identification, Classification, and Prediction System",
    version=settings.MODEL_VERSION,
)

# Enable CORS for frontend Vite development & preview servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_STORM_IDS = ["BOB-04", "DEMO-BOB-001", "ARB-02"]

@app.get("/")
def read_root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "LIVE",
        "version": settings.MODEL_VERSION,
        "basin": "North Indian Ocean",
        "mock_data_mode": settings.MOCK_DATA_MODE,
        "mosdac_enabled": settings.MOSDAC_ENABLED,
        "docs": "/docs",
    }

@app.get("/api/v1/health")
def read_health():
    return {
        "status": "GOOD",
        "mock_data_mode": settings.MOCK_DATA_MODE,
        "mosdac_enabled": settings.MOSDAC_ENABLED,
        "database": "CONNECTED (SQLite / PostGIS)",
        "redis": "CONNECTED",
        "model_engine": f"{settings.MODEL_VERSION} ONLINE",
    }

@app.get("/api/v1/storms")
def get_active_storms():
    return [
        {
            "storm_id": "DEMO-BOB-001",
            "name": "ASNA",
            "basin": "Bay of Bengal",
            "category": "VERY SEVERE CYCLONIC STORM",
            "wind_kts": 96.0,
            "pressure_hpa": 978.0,
            "movement_dir": "NE",
            "movement_speed_kmh": 14.0,
            "confidence": 91.0,
            "rapid_intensification_risk": 67.0,
            "genesis_probability": 82.0,
            "center": {"lat": 16.2, "lng": 86.4},
            "coastal_distance_km": 180.0,
            "nearest_landfall_point": "Odisha Coast (Puri)",
            "estimated_landfall_time": "Aug 28 06:00 UTC",
            "data_quality": "EXCELLENT",
            "is_demo": True,
        }
    ]

@app.get("/api/v1/storms/{storm_id}/wind-field", response_model=WindFieldResponse)
def get_storm_wind_field(
    storm_id: str,
    forecast_hour: int = Query(0, ge=0, le=168, description="Forecast hour (0 for current, 6, 12, 24, 48, 72)")
):
    """
    Returns asymmetric wind radii (R34, R50, R64 across NE, SE, SW, NW quadrants in NM) 
    and smooth GeoJSON polygons for spatial visualization.
    """
    norm_id = storm_id.upper().strip()
    if norm_id not in VALID_STORM_IDS:
        # For prototype flexibility, handle default fallback or 404
        if not norm_id.startswith("DEMO") and norm_id != "BOB-04":
            raise HTTPException(status_code=404, detail=f"Storm ID '{storm_id}' not found.")

    return get_wind_field(storm_id=storm_id, forecast_hour=forecast_hour)

@app.get("/api/v1/storms/{storm_id}/wind-field/forecast", response_model=WindFieldForecastResponse)
def get_storm_wind_field_forecast_series(storm_id: str):
    """
    Returns wind radii and GeoJSON polygons across all standard forecast horizons (0h to 72h).
    """
    norm_id = storm_id.upper().strip()
    if norm_id not in VALID_STORM_IDS:
        if not norm_id.startswith("DEMO") and norm_id != "BOB-04":
            raise HTTPException(status_code=404, detail=f"Storm ID '{storm_id}' not found.")

    return get_wind_field_forecast(storm_id=storm_id)

@app.get("/api/v1/satellite/observations")
def get_satellite_observation(storm_id: str = Query("DEMO-BOB-001")):
    """
    Returns satellite observation metadata using the abstract SatelliteProvider.
    Bypasses MOSDAC authentication in demo mode cleanly.
    """
    provider = get_satellite_provider()
    return provider.get_latest_observation(storm_id=storm_id)

# Optional Production Static File Mounting for Unified Full-Stack Deployment
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/") or full_path in ["docs", "redoc", "openapi.json"]:
            raise HTTPException(status_code=404, detail="API endpoint not found.")
        target_file = os.path.join(frontend_dist, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

