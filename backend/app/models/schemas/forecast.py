from pydantic import BaseModel
from typing import List, Optional

class ForecastResponse(BaseModel):
    storm_id: str
    analysis_time: str
    current: dict
    forecast: List[dict]
    uncertainty: dict
    modalities_used: List[str]
    missing_modalities: List[str]
    data_mode: str
    model_version: str
    product_type: str = "AI_DECISION_SUPPORT"
