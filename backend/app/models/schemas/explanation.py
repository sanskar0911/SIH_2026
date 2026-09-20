from pydantic import BaseModel
from typing import List

class CounterfactualRequest(BaseModel):
    storm_id: str
    remove_sensors: List[str]

class CounterfactualResponse(BaseModel):
    storm_id: str
    removed_sensors: List[str]
    original_confidence: float
    modified_confidence: float
    confidence_change: float
    original_track_error_km: float
    modified_track_error_km: float
    track_error_increase_km: float
    degraded_mode_active: bool

class ExplanationSchema(BaseModel):
    storm_id: str
    gradcam_layer: str
    convective_core_weight: float
    spiral_bands_weight: float
    eyewall_symmetry_score: float
    modality_contributions: List[dict]
    counterfactuals: List[dict]
