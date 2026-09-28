from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RapidIntensificationInput(BaseModel):
    latitude: float = Field(15.0, description="Storm center latitude (Degrees North)")
    longitude: float = Field(90.0, description="Storm center longitude (Degrees East)")
    cyclone_age_hours: float = Field(48.0, description="Hours elapsed since cyclone genesis")
    wind_speed: float = Field(65.0, description="Current maximum sustained wind speed (kt)")
    min_central_pressure: float = Field(980.0, description="Current minimum central pressure (hPa)")
    prev_wind_speed: float = Field(60.0, description="Wind speed 6 hours prior (kt)")
    prev_pressure: float = Field(984.0, description="Minimum central pressure 6 hours prior (hPa)")
    wind_speed_change: float = Field(5.0, description="6-hour change in sustained wind speed (kt)")
    pressure_change: float = Field(-4.0, description="6-hour change in central pressure (hPa, negative = deepening)")
    sst: float = Field(28.0, description="Sea Surface Temperature (°C)")
    relative_humidity: float = Field(70.0, description="Mid-tropospheric relative humidity (%)")
    vertical_wind_shear: float = Field(15.0, description="Deep-layer 850-200 hPa vertical wind shear (kt)")
    atmospheric_temp_200hPa: float = Field(-53.0, description="Upper troposphere 200 hPa temperature (°C)")
    cloud_top_temp: float = Field(-45.0, description="Infrared cloud-top brightness temperature (°C)")
    water_vapour: float = Field(55.0, description="Total column precipitable water proxy (mm)")
    precipitation: float = Field(8.0, description="Convective precipitation rate (mm/hr)")
    ocean_heat_content: float = Field(30.0, description="Ocean heat content down to 26°C isotherm (kJ/cm²)")
    movement_speed: float = Field(10.0, description="Storm translation speed (kt)")
    movement_direction: float = Field(330.0, description="Storm motion azimuth heading (degrees)")
    season_sin: float = Field(0.866, description="Cyclical annual day-of-year sine encoding")
    season_cos: float = Field(0.5, description="Cyclical annual day-of-year cosine encoding")
    diurnal_sin: float = Field(0.0, description="Diurnal solar cycle sine encoding")
    diurnal_cos: float = Field(1.0, description="Diurnal solar cycle cosine encoding")

class FeatureImpact(BaseModel):
    feature: str
    label: str
    value: float
    importance: float
    direction: str  # "INCREASES_RISK" | "DECREASES_RISK" | "NEUTRAL"
    impact_text: str

class RapidIntensificationOutput(BaseModel):
    risk_probability: float = Field(..., description="Probability of rapid intensification (0.0 to 1.0)")
    risk_percentage: float = Field(..., description="Risk as integer/float percentage (0% to 100%)")
    prediction: int = Field(..., description="Binary classification (1 = RI likely, 0 = RI unlikely)")
    risk_category: str = Field(..., description="Risk category: LOW | MODERATE | HIGH")
    severity_level: str = Field(..., description="Severity indicator: LOW | WATCH | WARNING | CRITICAL")
    top_risk_factors: List[str] = Field(..., description="Top features contributing to the risk score")
    feature_impacts: List[FeatureImpact] = Field(default_factory=list, description="Detailed feature attributions")
    threshold_info: Dict[str, Any] = Field(default_factory=dict)
    disclaimer: str
    model_version: str = "XGBoost-RI-v1.0.0"

class BatchRIRequest(BaseModel):
    records: List[RapidIntensificationInput]

class BatchRIResponse(BaseModel):
    count: int
    predictions: List[RapidIntensificationOutput]

class RISchemaResponse(BaseModel):
    feature_names: List[str]
    n_features: int
    risk_thresholds: Dict[str, List[float]]
    units: Dict[str, str]
    descriptions: Dict[str, str]
    defaults: Dict[str, float]

class RIMetricsResponse(BaseModel):
    model_type: str
    library: str
    test_roc_auc: float
    test_accuracy: float
    test_precision: float
    test_recall: float
    test_f1: float
    baseline_train_roc_auc: float
    baseline_cv_roc_auc_mean: float
    tuned_cv_roc_auc_mean: float
    tuned_cv_roc_auc_std: float
    top_features: List[Dict[str, Any]]
    risk_thresholds: Dict[str, List[float]]
