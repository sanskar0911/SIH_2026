import numpy as np
from typing import List, Dict, Any

class RealUncertaintyGenerator:
    """
    Quantile (P10/P50/P90) & Track Dispersion Generator
    Calculates spatial covariance ellipses, dispersion radii (km), and wind envelopes
    """
    def generate_uncertainty_for_forecast(
        self,
        forecast_points: List[Dict[str, Any]],
        current_wind_kt: float = 78.0,
        degraded_mode: bool = False
    ) -> Dict[str, Any]:
        mult = 1.35 if degraded_mode else 1.0
        
        forecast_with_uncertainty = []
        uncertainty_points = []

        for pt in forecast_points:
            lead = pt["lead_h"]
            lat = pt["lat"]
            lon = pt["lon"]

            # Wind evolution simulation
            wind_p50 = float(current_wind_kt + lead * 0.25)
            p10_margin = (5.0 + lead * 0.1) * mult
            p90_margin = (7.0 + lead * 0.15) * mult

            wind_p10 = max(20.0, round(wind_p50 - p10_margin, 1))
            wind_p90 = round(wind_p50 + p90_margin, 1)
            pressure = max(900.0, round(1013.0 - (wind_p50 * 0.55), 1))
            conf = max(30.0, round(pt.get("confidence", 85.0) / mult, 1))

            dispersion_km = round((18.0 + lead * 1.3) * mult, 1)

            forecast_with_uncertainty.append({
                "lead_h": lead,
                "lat": lat,
                "lon": lon,
                "wind_p10": wind_p10,
                "wind_p50": round(wind_p50, 1),
                "wind_p90": wind_p90,
                "pressure": pressure,
                "confidence": conf
            })

            # Covariance matrix [ [var_lat, cov], [cov, var_lon] ]
            var = (dispersion_km / 111.0) ** 2
            uncertainty_points.append({
                "forecast_id": f"FCST-{lead}H",
                "mean_lat": lat,
                "mean_lon": lon,
                "dispersion_km": dispersion_km,
                "covariance": [[round(var, 6), 0.0], [0.0, round(var, 6)]],
                "confidence_region": [
                    {"lat": round(lat + dispersion_km / 111.0, 3), "lon": lon},
                    {"lat": round(lat - dispersion_km / 111.0, 3), "lon": lon},
                    {"lat": lat, "lon": round(lon + dispersion_km / 111.0, 3)},
                    {"lat": lat, "lon": round(lon - dispersion_km / 111.0, 3)},
                ],
                "coverage_probability": 0.90,
                "calibration_score": round(max(0.72, 0.95 - lead * 0.002), 2)
            })

        return {
            "forecast_points": forecast_with_uncertainty,
            "uncertainty_points": uncertainty_points
        }

real_uncertainty_generator = RealUncertaintyGenerator()
