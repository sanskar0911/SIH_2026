from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class UncertaintySchema(BaseModel):
    id: str
    forecastId: str
    meanLat: float
    meanLon: float
    dispersionKm: float
    covariance: Optional[List[List[float]]] = None
    confidenceRegion: Optional[List[Dict[str, float]]] = None
    coverageProbability: float = 0.90
    calibrationScore: float = 0.94
    ensembleMetadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
