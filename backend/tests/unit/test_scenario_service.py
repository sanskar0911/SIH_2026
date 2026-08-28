from app.services.scenario_service import ScenarioEngine

def test_scenario_engine_defaults():
    engine = ScenarioEngine()
    storms = engine.get_active_storms()
    assert len(storms) >= 3
    assert storms[0].id == "TC-ARUN"

def test_scenario_missing_microwave():
    engine = ScenarioEngine()
    res = engine.set_scenario("MISSING_MICROWAVE")
    assert res["currentScenario"] == "MISSING_MICROWAVE"
    assert engine.modality_status["microwave"] == "MISSING"

def test_scenario_rapid_intensification():
    engine = ScenarioEngine()
    engine.set_scenario("RAPID_INTENSIFICATION")
    storms = engine.get_active_storms()
    arun = next(s for s in storms if s.id == "TC-ARUN")
    assert arun.wind >= 98.0
    assert arun.rapidIntensificationProb >= 90.0

def test_forecast_uncertainty_multiplier():
    engine = ScenarioEngine()
    engine.set_scenario("POOR_DATA")
    fcst = engine.get_forecast("TC-ARUN")
    assert len(fcst) == 6
    # Lead 72h confidence should be reduced in POOR_DATA scenario
    assert fcst[-1].confidence < 70.0
