from pydantic import BaseModel

class AlertSchema(BaseModel):
    id: str
    category: str
    severity: str
    storm_id: str
    storm_name: str
    title: str
    description: str
    trigger_reason: str
    confidence: float
    timestamp: str
    recommended_action: str
    acknowledged: bool
