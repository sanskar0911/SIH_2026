from pydantic import BaseModel

class ForecastPointSchema(BaseModel):
    lead_h: int
    lat: float
    lon: float
    wind_p10: float
    wind_p50: float
    wind_p90: float
    pressure: float
    confidence: float

    class Config:
        from_attributes = True
