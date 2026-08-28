from typing import List, Dict, Any

class UncertaintyService:
    def calculate_uncertainty(self, forecast_points: List[Dict[str, Any]], degraded_mode: bool = False) -> List[Dict[str, Any]]:
        multiplier = 1.4 if degraded_mode else 1.0
        uncertainties = []
        for pt in forecast_points:
            lead = pt.get("lead_h", 0)
            uncertainties.append({
                "forecast_id": f"FCST-{lead}H",
                "mean_lat": pt.get("lat"),
                "mean_lon": pt.get("lon"),
                "dispersion_km": round((20.0 + lead * 1.2) * multiplier, 1),
                "coverage_probability": 0.90,
                "calibration_score": round(max(0.70, 0.94 - (lead * 0.002)), 2)
            })
        return uncertainties
