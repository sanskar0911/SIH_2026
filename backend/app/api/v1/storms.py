from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.storm import StormSchema
from app.services.scenario_service import scenario_engine

router = APIRouter(prefix="/storms", tags=["Storms"])

@router.get("/current", response_model=List[StormSchema])
def get_current_storms():
    return scenario_engine.get_active_storms()

@router.get("/{storm_id}", response_model=StormSchema)
def get_storm(storm_id: str):
    storms = scenario_engine.get_active_storms()
    target = next((s for s in storms if s.id == storm_id), None)
    if not target:
        raise HTTPException(status_code=404, detail=f"Storm '{storm_id}' not found.")
    return target

@router.get("/{storm_id}/history")
def get_storm_history(storm_id: str):
    return {
        "storm_id": storm_id,
        "track_history": [
            {"timestamp": "T-12H", "lat": 14.6, "lon": 85.8, "wind": 68, "pressure": 980},
            {"timestamp": "T-6H", "lat": 15.2, "lon": 85.2, "wind": 74, "pressure": 975},
            {"timestamp": "T0", "lat": 15.8, "lon": 84.6, "wind": 78, "pressure": 972}
        ]
    }
