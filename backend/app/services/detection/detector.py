from typing import List, Dict, Any

class CandidateDetector:
    def detect_candidates(self, imagery_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [
            {
                "candidate_id": "CAND-01",
                "probability": 0.94,
                "latitude": 15.8,
                "longitude": 84.6,
                "bbox": [14.8, 83.6, 16.8, 85.6],
                "confidence": 91.0
            },
            {
                "candidate_id": "CAND-02",
                "probability": 0.88,
                "latitude": 17.2,
                "longitude": 68.4,
                "bbox": [16.2, 67.4, 18.2, 69.4],
                "confidence": 84.0
            }
        ]
