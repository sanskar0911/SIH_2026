from pydantic import BaseModel, Field
from typing import Literal, Optional

StormStatus = Literal['ACTIVE', 'WATCH', 'CANDIDATE']
EyeSignature = Literal['DETECTED', 'NOT DETECTED']
LandInteraction = Literal['LOW', 'MODERATE', 'HIGH']
StructureTrend = Literal['STRENGTHENING', 'STEADY', 'WEAKENING']

class StormSchema(BaseModel):
    id: str
    name: str
    classification: str
    status: StormStatus
    lat: float
    lon: float
    wind: float  # in KT
    pressure: float  # in HPA
    movement: str
    confidence: float
    genesisProb: float
    rapidIntensificationProb: float
    trackConfidence: float
    landInteraction: LandInteraction
    organization: float
    symmetry: float
    eyeSignature: EyeSignature
    eyewallConfidence: float
    structureTrend: StructureTrend
    asymmetry: float

    class Config:
        from_attributes = True
