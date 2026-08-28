from app.schemas.system import RiskResponse
from typing import Dict, Any

class RiskEngine:
    def calculate_risk(self, storm_id: str, storm_data: Dict[str, Any], modality_status: Dict[str, str]) -> RiskResponse:
        wind = storm_data.get("wind", 78.0)
        ri_prob = storm_data.get("rapidIntensificationProb", 64.0)
        land_interaction = storm_data.get("landInteraction", "MODERATE")
        
        missing_count = sum(1 for status in modality_status.values() if status != "AVAILABLE")

        gen_risk = round(storm_data.get("genesisProb", 80.0) * 0.9, 1)
        ri_risk = round(ri_prob, 1)
        track_risk = round(100.0 - storm_data.get("trackConfidence", 87.0), 1)
        land_risk = 85.0 if land_interaction == "HIGH" else (50.0 if land_interaction == "MODERATE" else 20.0)
        coastal_risk = 75.0 if land_interaction in ["HIGH", "MODERATE"] else 30.0
        data_risk = round(missing_count * 20.0, 1)

        overall = round((ri_risk * 0.35) + (land_risk * 0.25) + (track_risk * 0.20) + (data_risk * 0.20), 1)

        category = "CRITICAL" if overall >= 75.0 else ("HIGH" if overall >= 55.0 else ("MODERATE" if overall >= 35.0 else "LOW"))

        return RiskResponse(
            stormId=storm_id,
            genesisRisk=gen_risk,
            rapidIntensificationRisk=ri_risk,
            trackUncertaintyRisk=track_risk,
            landInteractionRisk=land_risk,
            coastalProximityRisk=coastal_risk,
            dataDegradationRisk=data_risk,
            overallRiskScore=overall,
            riskCategory=category
        )

risk_engine = RiskEngine()
