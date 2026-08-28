from typing import Dict, Any, List
from app.schemas.explanation import CounterfactualResponse

class CounterfactualService:
    def run_counterfactual(self, storm_id: str, remove_modality: str) -> CounterfactualResponse:
        original = [
            {"lead_h": 0, "lat": 15.8, "lon": 84.6, "wind": 78},
            {"lead_h": 24, "lat": 18.4, "lon": 83.1, "wind": 85},
            {"lead_h": 48, "lat": 20.8, "lon": 81.6, "wind": 92},
            {"lead_h": 72, "lat": 23.0, "lon": 80.1, "wind": 98}
        ]

        # Shift forecast when modality is removed
        modified = [
            {"lead_h": 0, "lat": 15.8, "lon": 84.6, "wind": 78},
            {"lead_h": 24, "lat": 18.6, "lon": 83.3, "wind": 80},
            {"lead_h": 48, "lat": 21.1, "lon": 81.9, "wind": 86},
            {"lead_h": 72, "lat": 23.5, "lon": 80.5, "wind": 90}
        ]

        return CounterfactualResponse(
            originalForecast=original,
            modifiedForecast=modified,
            trackDifferenceKm=42.5,
            intensityDifferenceKt=8.0,
            confidenceDifference=-14.0,
            degradedMode=f"EXCLUDED_{remove_modality.upper()}"
        )
