from pydantic import BaseModel
from typing import Literal, Optional

AlertLevel = Literal['CRITICAL', 'WARNING', 'WATCH', 'INFO']

class AlertSchema(BaseModel):
    id: str
    level: AlertLevel
    type: str
    title: str
    stormId: Optional[str] = None
    detail: str
    timestamp: str
    prob: Optional[float] = None

    class Config:
        from_attributes = True
