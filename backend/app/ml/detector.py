import numpy as np

class MockCycloneDetector:
    def detect_candidates(self, satellite_data: dict):
        return [
            {
                "candidate_id": "DIST-BOB-09",
                "probability": 0.82,
                "center": {"lat": 10.4, "lng": 88.2},
                "bbox": {"min_lat": 9.2, "max_lat": 11.6, "min_lng": 87.0, "max_lng": 89.4},
                "confidence": 0.88,
                "status": "HIGH"
            },
            {
                "candidate_id": "DIST-ARB-04",
                "probability": 0.38,
                "center": {"lat": 11.8, "lng": 72.1},
                "bbox": {"min_lat": 10.8, "max_lat": 12.8, "min_lng": 71.1, "max_lng": 73.1},
                "confidence": 0.62,
                "status": "WATCH"
            }
        ]

class TorchCycloneDetector:
    def __init__(self, checkpoint_path: str = None):
        self.checkpoint_path = checkpoint_path
    
    def detect_candidates(self, satellite_data: dict):
        # Torch implementation fallback wrapper
        return MockCycloneDetector().detect_candidates(satellite_data)
