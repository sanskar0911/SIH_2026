from pydantic import BaseModel
from typing import List, Optional, Literal, Dict, Any

class ModalityContributionsSchema(BaseModel):
    irCloud: float
    waterVapor: float
    sst: float
    windField: float
    environment: float

class TemporalInfluenceItem(BaseModel):
    frame: str
    influence: Literal['LOW', 'MEDIUM', 'HIGH', 'VERY HIGH']

class ExplanationSchema(BaseModel):
    stormId: str
    modalityContributions: ModalityContributionsSchema
    visualEvidenceUrl: Optional[str] = None
    modelEvidence: List[str]
    temporalInfluence: List[TemporalInfluenceItem]

    class Config:
        from_attributes = True

class CounterfactualRequest(BaseModel):
    stormId: str
    removeModality: str  # e.g., "MICROWAVE", "IR", "SST"

class CounterfactualResponse(BaseModel):
    originalForecast: List[Dict[str, Any]] = []
    modifiedForecast: List[Dict[str, Any]] = []
    trackDifferenceKm: float
    intensityDifferenceKt: float
    confidenceDifference: float
    degradedMode: str
