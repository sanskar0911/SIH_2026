from fastapi import APIRouter
from typing import List
from app.schemas.forecast import ForecastPointSchema
from app.services.scenario_service import scenario_engine
from app.services.windfield.windfield_service import WindfieldService
from app.services.uncertainty.uncertainty_service import UncertaintyService

router = APIRouter(prefix="/storms", tags=["Forecasts"])
windfield_service = WindfieldService()
uncertainty_service = UncertaintyService()

@router.get("/{storm_id}/forecast", response_model=List[ForecastPointSchema])
def get_storm_forecast(storm_id: str):
    return scenario_engine.get_forecast(storm_id)

@router.get("/{storm_id}/uncertainty")
def get_storm_uncertainty(storm_id: str):
    fcst = scenario_engine.get_forecast(storm_id)
    pts = [p.model_dump() for p in fcst]
    return uncertainty_service.calculate_uncertainty(pts)

@router.get("/{storm_id}/wind-field")
def get_storm_windfield(storm_id: str):
    return windfield_service.estimate_windfield(storm_id, {"wind_kt": 78.0})
