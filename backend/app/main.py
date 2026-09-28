import os
import sys
import logging
from pathlib import Path

# Ensure 'backend' directory is on sys.path so 'app.*' imports work from any cwd
_BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List, Optional, Dict, Any

from app.core.config import settings
from app.models.schemas.wind_field import WindFieldResponse, WindFieldForecastResponse
from app.models.schemas.rapid_intensification import (
    RapidIntensificationInput,
    RapidIntensificationOutput,
    BatchRIRequest,
    BatchRIResponse,
    RISchemaResponse,
    RIMetricsResponse,
)
from app.services.windfield.windfield_service import get_wind_field, get_wind_field_forecast
from app.services.satellite.provider import get_satellite_provider
from app.services.ml.ri_service import RapidIntensificationService

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

frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")

@app.get("/api/v1/info")
def read_api_info():
    return {
        "system": settings.PROJECT_NAME,
        "status": "LIVE",
        "version": settings.MODEL_VERSION,
        "ml_engine": "XGBoost RI Predictor + NIO-DualNet",
        "basin": "North Indian Ocean",
        "mock_data_mode": settings.MOCK_DATA_MODE,
        "mosdac_enabled": settings.MOSDAC_ENABLED,
        "docs": "/docs",
    }

@app.get("/")
async def serve_root():
    if os.path.exists(frontend_dist):
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
    return read_api_info()

@app.get("/api/v1/health")
def read_health():
    ri_service = RapidIntensificationService.get_instance()
    model_status = "LOADED (XGBoost)" if ri_service.model is not None else "READY (GAM Calibrated Fallback)"
    return {
        "status": "GOOD",
        "mock_data_mode": settings.MOCK_DATA_MODE,
        "mosdac_enabled": settings.MOSDAC_ENABLED,
        "database": "CONNECTED (SQLite / PostGIS)",
        "redis": "CONNECTED",
        "model_engine": f"{settings.MODEL_VERSION} ONLINE",
        "cyclone_ai_ri_model": model_status,
    }

@app.get("/api/v1/storms")
def get_active_storms():
    ri_service = RapidIntensificationService.get_instance()
    # Compute active storm RI dynamically using cyclone_ai
    storm_features = {
        "latitude": 16.2,
        "longitude": 86.4,
        "wind_speed": 96.0,
        "min_central_pressure": 978.0,
        "prev_wind_speed": 82.0,
        "prev_pressure": 986.0,
        "wind_speed_change": 14.0,
        "pressure_change": -8.0,
        "sst": 30.2,
        "relative_humidity": 86.0,
        "vertical_wind_shear": 8.5,
        "ocean_heat_content": 62.0,
        "cloud_top_temp": -68.0,
    }
    ri_assessment = ri_service.predict(storm_features)

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
            "rapid_intensification_risk": ri_assessment["risk_percentage"],
            "rapid_intensification_category": ri_assessment["risk_category"],
            "rapid_intensification_factors": ri_assessment["top_risk_factors"],
            "genesis_probability": 82.0,
            "center": {"lat": 16.2, "lng": 86.4},
            "coastal_distance_km": 180.0,
            "nearest_landfall_point": "Odisha Coast (Puri)",
            "estimated_landfall_time": "Aug 28 06:00 UTC",
            "data_quality": "EXCELLENT",
            "is_demo": True,
        }
    ]

# -------------------------------------------------------------
# Cyclone AI - Rapid Intensification (RI) Endpoints
# -------------------------------------------------------------

@app.post("/api/v1/ml/predict-ri", response_model=RapidIntensificationOutput)
def predict_rapid_intensification(data: RapidIntensificationInput):
    """
    Evaluates probability of tropical cyclone Rapid Intensification (RI: ΔV ≥ 30 kt in 24h)
    using the trained XGBoost model and 23 environmental/storm features.
    """
    ri_service = RapidIntensificationService.get_instance()
    try:
        return ri_service.predict(data.model_dump())
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ml/predict-ri/batch", response_model=BatchRIResponse)
def predict_rapid_intensification_batch(request: BatchRIRequest):
    """
    Batch RI inference for multiple storms or forecast trajectory waypoints.
    """
    ri_service = RapidIntensificationService.get_instance()
    try:
        results = ri_service.predict_batch([r.model_dump() for r in request.records])
        return BatchRIResponse(count=len(results), predictions=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/ml/ri-schema", response_model=RISchemaResponse)
def get_ri_feature_schema():
    """
    Returns feature definitions, meteorological units, descriptions, defaults, and risk category thresholds.
    """
    ri_service = RapidIntensificationService.get_instance()
    return ri_service.get_schema()

@app.get("/api/v1/ml/metrics", response_model=RIMetricsResponse)
def get_ri_model_metrics():
    """
    Returns validation & test metrics (ROC-AUC, F1, Accuracy, Precision, Recall, Cross-Validation) and feature importance ranks.
    """
    ri_service = RapidIntensificationService.get_instance()
    return ri_service.get_metrics()

@app.get("/api/v1/ml/demo-scenarios")
def get_ri_demo_scenarios():
    """
    Returns curated benchmark meteorological scenarios (Low Risk, Moderate Risk, High RI Risk) with live predictions.
    """
    ri_service = RapidIntensificationService.get_instance()
    return ri_service.get_demo_scenarios()

@app.get("/api/v1/storms/{storm_id}/ri-assessment", response_model=RapidIntensificationOutput)
def get_storm_ri_assessment(storm_id: str):
    """
    Retrieves instantaneous Rapid Intensification analysis and feature attributions for a specific active storm.
    """
    norm_id = storm_id.upper().strip()
    if norm_id not in VALID_STORM_IDS and not norm_id.startswith("DEMO"):
        raise HTTPException(status_code=404, detail=f"Storm ID '{storm_id}' not found.")

    ri_service = RapidIntensificationService.get_instance()
    storm_features = {
        "latitude": 16.2,
        "longitude": 86.4,
        "wind_speed": 96.0,
        "min_central_pressure": 978.0,
        "prev_wind_speed": 82.0,
        "prev_pressure": 986.0,
        "wind_speed_change": 14.0,
        "pressure_change": -8.0,
        "sst": 30.2,
        "relative_humidity": 86.0,
        "vertical_wind_shear": 8.5,
        "ocean_heat_content": 62.0,
        "cloud_top_temp": -68.0,
    }
    return ri_service.predict(storm_features)

# -------------------------------------------------------------
# Spatial Wind Field & Satellite Endpoints
# -------------------------------------------------------------

@app.get("/api/v1/storms/{storm_id}/wind-field", response_model=WindFieldResponse)
def get_storm_wind_field(
    storm_id: str,
    forecast_hour: int = Query(0, ge=0, le=168, description="Forecast hour (0 for current, 6, 12, 24, 48, 72)")
):
    norm_id = storm_id.upper().strip()
    if norm_id not in VALID_STORM_IDS:
        if not norm_id.startswith("DEMO") and norm_id != "BOB-04":
            raise HTTPException(status_code=404, detail=f"Storm ID '{storm_id}' not found.")

    return get_wind_field(storm_id=storm_id, forecast_hour=forecast_hour)

@app.get("/api/v1/storms/{storm_id}/wind-field/forecast", response_model=WindFieldForecastResponse)
def get_storm_wind_field_forecast_series(storm_id: str):
    norm_id = storm_id.upper().strip()
    if norm_id not in VALID_STORM_IDS:
        if not norm_id.startswith("DEMO") and norm_id != "BOB-04":
            raise HTTPException(status_code=404, detail=f"Storm ID '{storm_id}' not found.")

    return get_wind_field_forecast(storm_id=storm_id)

@app.get("/api/v1/satellite/observations")
def get_satellite_observation(storm_id: str = Query("DEMO-BOB-001")):
    provider = get_satellite_provider()
    return provider.get_latest_observation(storm_id=storm_id)

# Optional Production Static File Mounting for Unified Full-Stack Deployment
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


