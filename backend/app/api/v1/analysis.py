from fastapi import APIRouter
from app.schemas.analysis import AnalysisRunRequest, AnalysisJobSchema
from app.services.analysis.orchestrator import orchestrator
from app.services.scenario_service import scenario_engine

router = APIRouter(prefix="/analysis", tags=["Analysis Pipeline"])

@router.post("/run", response_model=AnalysisJobSchema)
def run_analysis(req: AnalysisRunRequest):
    res = orchestrator.run_pipeline(req.stormId, scenario_engine.modality_status)
    return AnalysisJobSchema(
        id=res["job_id"],
        stormId=req.stormId,
        status="COMPLETE",
        progress=100.0,
        currentStage="COMPLETE",
        result=res["result"]
    )

@router.get("/{job_id}", response_model=AnalysisJobSchema)
def get_analysis_job(job_id: str):
    return AnalysisJobSchema(
        id=job_id,
        stormId="TC-ARUN",
        status="COMPLETE",
        progress=100.0,
        currentStage="COMPLETE"
    )
