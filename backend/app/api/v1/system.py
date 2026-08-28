from fastapi import APIRouter
from app.schemas.system import ScenarioRequest, ScenarioResponse
from app.services.scenario_service import scenario_engine

router = APIRouter(prefix="/system", tags=["System"])

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "mock_mode": True,
        "service": "TC-INTEL Backend",
        "version": "1.0.0"
    }

@router.get("/status")
def get_system_status():
    return {
        "scenario": scenario_engine.current_scenario,
        "analysis_status": scenario_engine.analysis_status,
        "last_analysis_time": scenario_engine.last_analysis_time,
        "modalities": scenario_engine.modality_status
    }

@router.post("/scenario", response_model=ScenarioResponse)
def set_scenario(req: ScenarioRequest):
    return scenario_engine.set_scenario(req.scenario)
