from fastapi import APIRouter
from app.schemas.system import RiskResponse
from app.services.risk.risk_engine import risk_engine
from app.services.scenario_service import scenario_engine

router = APIRouter(prefix="/risk", tags=["Risk Engine"])

@router.get("/{storm_id}", response_model=RiskResponse)
def get_storm_risk(storm_id: str):
    storms = scenario_engine.get_active_storms()
    target = next((s for s in storms if s.id == storm_id), storms[0])
    return risk_engine.calculate_risk(storm_id, target.model_dump(), scenario_engine.modality_status)
