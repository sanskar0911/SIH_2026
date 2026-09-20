from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class QuadrantRadii(BaseModel):
    NE: float = Field(..., description="Northeast quadrant radius in nautical miles")
    SE: float = Field(..., description="Southeast quadrant radius in nautical miles")
    SW: float = Field(..., description="Southwest quadrant radius in nautical miles")
    NW: float = Field(..., description="Northwest quadrant radius in nautical miles")

class ThresholdRadii(BaseModel):
    R34: QuadrantRadii = Field(..., description="34 knot (gale-force) wind radii across 4 quadrants")
    R50: QuadrantRadii = Field(..., description="50 knot (storm-force) wind radii across 4 quadrants")
    R64: QuadrantRadii = Field(..., description="64 knot (hurricane-force) wind radii across 4 quadrants")

class CenterCoordinates(BaseModel):
    lat: float
    lon: float

class WindFieldResponse(BaseModel):
    storm_id: str
    valid_time: str
    forecast_hour: int = 0
    center: CenterCoordinates
    radii: ThresholdRadii
    geojson: Dict[str, Any] = Field(..., description="GeoJSON FeatureCollection with R34, R50, R64 polygon features")
    units: str = "nm"
    source: str = "DEMO_MODEL"
    confidence: float = 0.85
    is_demo: bool = True

class WindFieldForecastItem(BaseModel):
    forecast_hour: int
    horizon_label: str
    valid_time: str
    center: CenterCoordinates
    wind_kts: float
    pressure_hpa: float
    radii: ThresholdRadii
    geojson: Dict[str, Any]

class WindFieldForecastResponse(BaseModel):
    storm_id: str
    storm_name: str
    source: str = "DEMO_MODEL"
    is_demo: bool = True
    forecasts: List[WindFieldForecastItem]
