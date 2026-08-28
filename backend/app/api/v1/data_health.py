from fastapi import APIRouter
from app.schemas.system import DataHealthSchema
from app.services.scenario_service import scenario_engine

router = APIRouter(prefix="/data-health", tags=["Data Health"])

@router.get("", response_model=DataHealthSchema)
@router.get("/", response_model=DataHealthSchema)
def get_data_health():
    return scenario_engine.get_data_health()
