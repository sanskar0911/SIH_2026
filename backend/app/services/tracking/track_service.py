from typing import List, Dict, Any

class TrackService:
    def predict_track(self, center_lat: float, center_lon: float, fused_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        horizons = [6, 12, 24, 48, 72]
        deltas = [(0.6, -0.4), (1.2, -0.8), (2.6, -1.5), (5.0, -3.0), (7.2, -4.5)]
        
        results = []
        for h, (dlat, dlon) in zip(horizons, deltas):
            results.append({
                "lead_h": h,
                "lat": round(center_lat + dlat, 2),
                "lon": round(center_lon + dlon, 2),
                "confidence": max(40.0, 90.0 - h * 0.5)
            })
        return results
