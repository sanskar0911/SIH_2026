import uuid
from fastapi import APIRouter
from app.schemas.annotation import AnnotationSchema
from app.services.scenario_service import scenario_engine

router = APIRouter(prefix="/feedback", tags=["Analyst Feedback"])

@router.post("/annotation", response_model=AnnotationSchema)
def save_annotation(annotation: AnnotationSchema):
    if not annotation.id:
        annotation.id = f"ANN-{uuid.uuid4().hex[:6]}"
    scenario_engine.custom_annotations.append(annotation)
    return annotation
