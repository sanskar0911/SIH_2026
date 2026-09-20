from pydantic import BaseModel
from typing import List, Optional

class ModalitySchema(BaseModel):
    id: str
    name: str
    sensor_type: str
    available: bool
    timestamp: str
    age_minutes: float
    quality_score: float
    contribution_percent: float
    resolution_km: float

class DataHealthSchema(BaseModel):
    overall_status: str
    modalities: List[ModalitySchema]
    pipeline: dict
