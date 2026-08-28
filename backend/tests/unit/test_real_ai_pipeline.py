from app.ml.real_detector import detector_service
from app.ml.center_estimator import center_estimation_service
from app.ml.real_tracker import real_track_forecaster
from app.ml.real_uncertainty import real_uncertainty_generator
from app.ml.pipeline_runner import pipeline_runner

def test_pytorch_detector():
    candidates = detector_service.detect_from_tensor(None)
    assert len(candidates) >= 2
    assert "candidate_id" in candidates[0]
    assert 0.0 <= candidates[0]["probability"] <= 1.0

def test_center_estimator():
    res = center_estimation_service.estimate_center(None, coarse_lat=15.8, coarse_lon=84.6)
    assert "latitude" in res
    assert "longitude" in res
    assert abs(res["latitude"] - 15.8) < 1.0

def test_convlstm_track_forecaster():
    forecast_points = real_track_forecaster.forecast_track(center_lat=15.8, center_lon=84.6)
    assert len(forecast_points) == 5
    assert forecast_points[0]["lead_h"] == 6
    assert forecast_points[-1]["lead_h"] == 72

def test_quantile_uncertainty_generator():
    forecast_points = real_track_forecaster.forecast_track(center_lat=15.8, center_lon=84.6)
    res = real_uncertainty_generator.generate_uncertainty_for_forecast(forecast_points)
    assert len(res["forecast_points"]) == 5
    assert res["forecast_points"][0]["wind_p10"] <= res["forecast_points"][0]["wind_p50"] <= res["forecast_points"][0]["wind_p90"]

def test_pipeline_runner():
    res = pipeline_runner.run_pipeline(storm_id="TC-ARUN")
    assert res["pipeline_status"] == "SUCCESS"
    assert "candidates" in res
    assert "estimated_center" in res
    assert "state_vector" in res
    assert len(res["forecast"]) == 5
