from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_system_health():
    res = client.get("/api/v1/system/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_get_current_storms():
    res = client.get("/api/v1/storms/current")
    assert res.status_code == 200
    storms = res.json()
    assert len(storms) >= 3

def test_set_scenario_api():
    res = client.post("/api/v1/system/scenario", json={"scenario": "RAPID_INTENSIFICATION"})
    assert res.status_code == 200
    assert res.json()["currentScenario"] == "RAPID_INTENSIFICATION"

def test_run_counterfactual():
    res = client.post("/api/v1/explainability/counterfactual", json={"stormId": "TC-ARUN", "removeModality": "MICROWAVE"})
    assert res.status_code == 200
    data = res.json()
    assert data["trackDifferenceKm"] > 0
