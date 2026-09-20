from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class StormCenter(BaseModel):
    lat: float
    lng: float

class WindRadii(BaseModel):
    r34_nm: float
    r50_nm: float
    r64_nm: float

class ForecastPointSchema(BaseModel):
    horizon: str
    hours: int
    lat: float
    lng: float
    windP10: float
    windP50: float
    windP90: float
    pressureHpa: float
    confidence: float
    predictionIntervalKm: float

class EnsembleTrajectorySchema(BaseModel):
    id: str
    name: str
    color: str
    points: List[dict]

class StormSchema(BaseModel):
    storm_id: str
    name: str
    basin: str
    timestamp: str
    center: StormCenter
    wind_kts: float
    pressure_hpa: float
    category: str
    confidence: float
    movement_dir: str
    movement_speed_kmh: float
    rapid_intensification_risk: float
    genesis_probability: float
    wind_radii: WindRadii
    coastal_distance_km: float
    nearest_landfall_point: str
    estimated_landfall_time: Optional[str] = None
    data_quality: str
    observed_track: List[dict]
    forecast_track: List[ForecastPointSchema]
    ensemble_trajectories: List[EnsembleTrajectorySchema]

class GenesisCandidateSchema(BaseModel):
    candidate_id: str
    basin: str
    center: StormCenter
    probability_24h: float
    probability_48h: float
    expected_time_to_genesis: str
    persistence_hours: float
    environmental_score: float
    sea_surface_temp_c: float
    vertical_wind_shear_kts: float
    relative_humidity_pct: float
    vorticity: float
    status: str
