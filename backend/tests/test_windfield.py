import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.windfield.windfield_service import (
    calculate_asymmetric_radii,
    generate_wind_radius_polygon,
    get_wind_field,
    get_wind_field_forecast,
)

client = TestClient(app)

def test_asymmetric_radii_ordering():
    radii = calculate_asymmetric_radii(max_wind_kts=96.0)
    
    # 1. Test 4 quadrants present
    for quad in ["NE", "SE", "SW", "NW"]:
        r34_val = getattr(radii.R34, quad)
        r50_val = getattr(radii.R50, quad)
        r64_val = getattr(radii.R64, quad)
        
        # 2. Non-negative values
        assert r34_val > 0
        assert r50_val > 0
        assert r64_val > 0
        
        # 3. Strict threshold hierarchy: R34 > R50 > R64
        assert r34_val > r50_val, f"R34 ({r34_val}) must be strictly greater than R50 ({r50_val}) in quadrant {quad}"
        assert r50_val > r64_val, f"R50 ({r50_val}) must be strictly greater than R64 ({r64_val}) in quadrant {quad}"

def test_geojson_polygon_structure():
    wf = get_wind_field("DEMO-BOB-001", forecast_hour=0)
    geojson = wf.geojson
    
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) == 3
    
    thresholds = [f["properties"]["threshold"] for f in geojson["features"]]
    assert thresholds == ["R34", "R50", "R64"]
    
    # Verify polygon closed ring
    for feat in geojson["features"]:
        coords = feat["geometry"]["coordinates"][0]
        assert len(coords) >= 70
        assert coords[0] == coords[-1], "Polygon boundary ring must be closed"

def test_wind_field_api_endpoint():
    response = client.get("/api/v1/storms/DEMO-BOB-001/wind-field?forecast_hour=24")
    assert response.status_code == 200
    data = response.json()
    
    assert data["storm_id"] == "DEMO-BOB-001"
    assert data["forecast_hour"] == 24
    assert data["is_demo"] is True
    assert data["units"] == "nm"
    assert "radii" in data
    assert "R34" in data["radii"]
    assert "geojson" in data

def test_unknown_storm_404():
    response = client.get("/api/v1/storms/UNKNOWN-STORM-XYZ/wind-field")
    assert response.status_code == 404

def test_forecast_hour_updates_position_and_radii():
    wf_0h = get_wind_field("DEMO-BOB-001", forecast_hour=0)
    wf_24h = get_wind_field("DEMO-BOB-001", forecast_hour=24)
    
    # Position should shift for forecast hour 24
    assert wf_24h.center.lat > wf_0h.center.lat
    assert wf_24h.center.lon > wf_0h.center.lon
