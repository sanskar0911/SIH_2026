from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.alert import AlertSchema
from app.services.scenario_service import scenario_engine

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertSchema])
@router.get("/", response_model=List[AlertSchema])
def get_alerts():
    return scenario_engine.get_alerts()

@router.get("/{alert_id}", response_model=AlertSchema)
def get_alert(alert_id: str):
    alerts = scenario_engine.get_alerts()
    target = next((a for a in alerts if a.id == alert_id), None)
    if not target:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")
    return target
