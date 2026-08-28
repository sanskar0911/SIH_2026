from fastapi import APIRouter
from app.schemas.system import ModelVersionSchema

router = APIRouter(prefix="/models", tags=["Models"])

@router.get("/version", response_model=ModelVersionSchema)
def get_model_version():
    return ModelVersionSchema(
        id="v2.4.1-SIH-STABLE",
        status="CHAMPION",
        datasetVersion="MOSDAC-2025-V3",
        preprocessingVersion="PRE-v1.8",
        gitCommit="c8f93a1",
        inferenceConfig="FP16_MIXED_PRECISION"
    )
