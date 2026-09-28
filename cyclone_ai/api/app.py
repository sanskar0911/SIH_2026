"""
FastAPI endpoint for Cyclone RI prediction
==========================================
Run:
    uvicorn cyclone_ai.api.app:app --reload --port 8000

POST /predict
Body (JSON): feature dict
Response: { risk_probability, prediction, risk_category, top_risk_factors, disclaimer }

GET /health  -> { status: ok }
GET /schema  -> feature schema
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import sys
import os
from pathlib import Path

# Ensure imports work regardless of cwd
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from cyclone_ai.inference.predict import CyclonePredictor

app = FastAPI(
    title="Cyclone Rapid Intensification Predictor",
    description=(
        "PROTOTYPE API – SIH 2026 Cyclone Intelligence System. "
        "Trained on synthetic data. Not for operational use."
    ),
    version="1.0.0-prototype",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load predictor once at startup
predictor = CyclonePredictor()


class CycloneInput(BaseModel):
    latitude:               float = Field(15.0,   description="Degrees North")
    longitude:              float = Field(90.0,   description="Degrees East")
    cyclone_age_hours:      float = Field(48.0,   description="Hours since genesis")
    wind_speed:             float = Field(65.0,   description="Max sustained wind (kt)")
    min_central_pressure:   float = Field(980.0,  description="Min central pressure (hPa)")
    prev_wind_speed:        float = Field(60.0,   description="Wind speed 6h ago (kt)")
    prev_pressure:          float = Field(984.0,  description="Pressure 6h ago (hPa)")
    wind_speed_change:      float = Field(5.0,    description="Wind change over 6h (kt)")
    pressure_change:        float = Field(-4.0,   description="Pressure change over 6h (hPa)")
    sst:                    float = Field(28.0,   description="Sea surface temperature (°C)")
    relative_humidity:      float = Field(70.0,   description="Relative humidity (%)")
    vertical_wind_shear:    float = Field(15.0,   description="Vertical wind shear proxy (kt)")
    atmospheric_temp_200hPa:float = Field(-53.0,  description="200hPa temp (°C)")
    cloud_top_temp:         float = Field(-45.0,  description="Cloud-top temperature IR proxy (°C)")
    water_vapour:           float = Field(55.0,   description="Precipitable water proxy (mm)")
    precipitation:          float = Field(8.0,    description="Rainfall proxy (mm/hr)")
    ocean_heat_content:     float = Field(30.0,   description="OHC proxy (kJ/cm²)")
    movement_speed:         float = Field(10.0,   description="Storm movement speed (kt)")
    movement_direction:     float = Field(330.0,  description="Movement direction (degrees)")
    season_sin:             float = Field(0.866,  description="Season sine encoding")
    season_cos:             float = Field(0.5,    description="Season cosine encoding")
    diurnal_sin:            float = Field(0.0,    description="Hour-of-day sine encoding")
    diurnal_cos:            float = Field(1.0,    description="Hour-of-day cosine encoding")


class PredictionOutput(BaseModel):
    risk_probability: float
    prediction: int
    risk_category: str
    top_risk_factors: list
    disclaimer: str


@app.get("/health")
def health():
    return {"status": "ok", "model": "CycloneXGBoost-Prototype"}


@app.get("/schema")
def schema():
    return {
        "feature_names": predictor.feature_names,
        "n_features": len(predictor.feature_names),
        "risk_thresholds": predictor.thresholds,
        "note": "PROTOTYPE – synthetic training data",
    }


@app.post("/predict", response_model=PredictionOutput)
def predict(data: CycloneInput):
    try:
        result = predictor.predict(data.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/batch")
def predict_batch(records: list[CycloneInput]):
    results = predictor.predict_batch([r.model_dump() for r in records])
    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
