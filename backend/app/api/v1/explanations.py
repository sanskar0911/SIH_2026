from fastapi import APIRouter
from app.schemas.explanation import ExplanationSchema, CounterfactualRequest, CounterfactualResponse
from app.services.scenario_service import scenario_engine
from app.services.explainability.counterfactual import CounterfactualService

router = APIRouter(tags=["Explainability"])
counterfactual_service = CounterfactualService()

@router.get("/storms/{storm_id}/explanation", response_model=ExplanationSchema)
def get_storm_explanation(storm_id: str):
    return scenario_engine.get_explanation(storm_id)

@router.post("/explainability/counterfactual", response_model=CounterfactualResponse)
def run_counterfactual(req: CounterfactualRequest):
    return counterfactual_service.run_counterfactual(req.stormId, req.removeModality)
