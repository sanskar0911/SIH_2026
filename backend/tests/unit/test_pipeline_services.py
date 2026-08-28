from app.services.detection.detector import CandidateDetector
from app.services.fusion.multimodal_fusion import MultimodalFusionService
from app.services.intensity.intensity_service import IntensityService
from app.services.tracking.track_service import TrackService
from app.services.consistency.physics_checker import PhysicsChecker

def test_candidate_detector():
    detector = CandidateDetector()
    candidates = detector.detect_candidates({})
    assert len(candidates) >= 2
    assert candidates[0]["candidate_id"] == "CAND-01"

def test_multimodal_fusion():
    fusion = MultimodalFusionService()
    res = fusion.fuse_modalities({}, {"ir": "AVAILABLE", "microwave": "MISSING"})
    assert res["degraded_mode"] is True
    assert "microwave" in res["missing_modalities"]

def test_physics_checker():
    checker = PhysicsChecker()
    res = checker.validate_consistency({"wind_kt": 78, "pressure_hpa": 972}, [])
    assert res["status"] == "PASSED"
