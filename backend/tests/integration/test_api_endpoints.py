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
    assert len(storms) >= 4
    assert any(s["id"] == "NIO-DEMO-001" for s in storms)

def test_set_scenario_api():
    res = client.post("/api/v1/system/scenario", json={"scenario": "RAPID_INTENSIFICATION"})
    assert res.status_code == 200
    assert res.json()["currentScenario"] == "RAPID_INTENSIFICATION"

def test_run_counterfactual():
    res = client.post("/api/v1/explainability/counterfactual", json={"stormId": "TC-ARUN", "removeModality": "MICROWAVE"})
    assert res.status_code == 200
    data = res.json()
    assert data["trackDifferenceKm"] > 0

def test_risk_api():
    res = client.get("/api/v1/risk/NIO-DEMO-001")
    assert res.status_code == 200
    assert "overallRiskScore" in res.json()

def test_audit_api():
    res = client.get("/api/v1/audit/NIO-DEMO-001")
    assert res.status_code == 200
    assert res.json()["modelVersion"] == "v2.4.1-SIH-STABLE"

def test_metrics_comparison_api():
    res = client.get("/api/v1/metrics/comparison")
    assert res.status_code == 200
    assert len(res.json()) >= 4
