from pydantic import BaseModel
from typing import Optional

class AnnotationSchema(BaseModel):
    id: Optional[str] = None
    stormId: str
    timestamp: str
    observedIssue: str
    correctedCenterLat: float
    correctedCenterLon: float
    correctedClass: str
    comment: str

    class Config:
        from_attributes = True
