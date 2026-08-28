from typing import List, Dict, Any

class HistoricalReplayService:
    def get_historical_replay(self, storm_id: str) -> Dict[str, Any]:
        states = [
            {
                "timestamp": "2024-10-22 00:00 UTC",
                "timeOffset": "T-48H",
                "lat": 12.1,
                "lon": 88.5,
                "wind": 30,
                "pressure": 1004,
                "classification": "LOW PRESSURE AREA",
                "organization": 35,
                "symmetry": 30,
                "eyeSignature": "NOT DETECTED",
                "actualLat": 12.1,
                "actualLon": 88.5,
                "actualWind": 30,
                "actualPressure": 1004,
                "forecastPoints": []
            },
            {
                "timestamp": "2024-10-23 00:00 UTC",
                "timeOffset": "T-24H",
                "lat": 13.8,
                "lon": 86.8,
                "wind": 45,
                "pressure": 994,
                "classification": "CYCLONIC STORM",
                "organization": 60,
                "symmetry": 55,
                "eyeSignature": "NOT DETECTED",
                "actualLat": 13.8,
                "actualLon": 86.8,
                "actualWind": 45,
                "actualPressure": 994,
                "forecastPoints": []
            },
            {
                "timestamp": "2024-10-24 00:00 UTC",
                "timeOffset": "T0",
                "lat": 15.8,
                "lon": 84.6,
                "wind": 78,
                "pressure": 972,
                "classification": "VERY SEVERE CYCLONIC STORM",
                "organization": 87,
                "symmetry": 72,
                "eyeSignature": "DETECTED",
                "actualLat": 15.8,
                "actualLon": 84.6,
                "actualWind": 78,
                "actualPressure": 972,
                "forecastPoints": [
                    {"lead_h": 24, "lat": 18.4, "lon": 83.1, "wind_p10": 79, "wind_p50": 85, "wind_p90": 93, "pressure": 964, "confidence": 87},
                    {"lead_h": 48, "lat": 20.8, "lon": 81.6, "wind_p10": 84, "wind_p50": 92, "wind_p90": 100, "pressure": 955, "confidence": 78}
                ]
            }
        ]

        return {
            "id": storm_id,
            "name": storm_id,
            "states": states
        }
