from pydantic import BaseModel
from typing import Optional, Dict, Any

class ObservationSchema(BaseModel):
    id: str
    stormId: str
    timestamp: str
    satellite: str
    product: str
    channel: Optional[str] = None
    storageUri: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    resolution: str = "1km"
    qualityScore: float = 100.0
    observationAge: str = "0m"
    available: bool = True
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
