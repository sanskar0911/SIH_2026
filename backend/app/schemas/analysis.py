from pydantic import BaseModel
from typing import Optional, Literal, Dict, Any

class AnalysisRunRequest(BaseModel):
    stormId: str
    forceReanalysis: bool = False

class AnalysisJobSchema(BaseModel):
    id: str
    stormId: str
    status: Literal['QUEUED', 'PROCESSING', 'COMPLETE', 'FAILED', 'READY', 'DEGRADED', 'INSUFFICIENT_EVIDENCE', 'ERROR']
    progress: float
    currentStage: str
    error: Optional[str] = None
    result: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
