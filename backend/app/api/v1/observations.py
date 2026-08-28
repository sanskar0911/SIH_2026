from fastapi import APIRouter
from typing import List
from app.schemas.observation import ObservationSchema
from app.services.scenario_service import scenario_engine

router = APIRouter(prefix="/observations", tags=["Observations"])

@router.get("/latest", response_model=List[ObservationSchema])
def get_latest_observations():
    health = scenario_engine.get_data_health()
    obs_list = []
    for idx, src in enumerate(health.sources):
        obs_list.append(ObservationSchema(
            id=f"OBS-00{idx+1}",
            stormId="TC-ARUN",
            timestamp=src.lastObservation,
            satellite=src.source.split()[0],
            product=src.source,
            latitude=15.8,
            longitude=84.6,
            qualityScore=src.quality,
            available=(src.status == "AVAILABLE")
        ))
    return obs_list

@router.get("/{storm_id}", response_model=List[ObservationSchema])
def get_storm_observations(storm_id: str):
    return [
        ObservationSchema(
            id=f"OBS-{storm_id}-01",
            stormId=storm_id,
            timestamp="14:30 UTC",
            satellite="INSAT-3DR",
            product="INSAT IR1",
            latitude=15.8,
            longitude=84.6,
            qualityScore=98.0,
            available=True
        )
    ]
