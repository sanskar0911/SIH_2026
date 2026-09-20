import math
import datetime
from typing import Dict, Any, List, Tuple
from app.models.schemas.wind_field import (
    QuadrantRadii,
    ThresholdRadii,
    CenterCoordinates,
    WindFieldResponse,
    WindFieldForecastItem,
    WindFieldForecastResponse,
)

# Configurable Asymmetry Constants
BASE_R34_NM = 165.0
BASE_R50_NM = 95.0
BASE_R64_NM = 50.0

def calculate_asymmetric_radii(
    max_wind_kts: float = 96.0,
    pressure_hpa: float = 978.0,
    movement_dir: str = "NE",
    movement_speed_kmh: float = 14.0,
    forecast_hour: int = 0,
) -> ThresholdRadii:
    """
    Deterministic asymmetric wind-radius calculation for Northern Hemisphere cyclones.
    Calculates four quadrant radii (NE, SE, SW, NW) in nautical miles for R34, R50, and R64.
    Adjusts radii dynamically for storm intensity and motion asymmetry.
    """
    # Scale factor based on storm intensity (reference: 96 kt)
    intensity_scale = max(0.4, min(1.6, max_wind_kts / 96.0))
    
    # Asymmetry factors per quadrant based on movement direction (NH right-front quadrant boost)
    # Default motion NE: SE is right-front (boosted), NE is front, NW is left, SW is rear.
    dir_upper = movement_dir.upper()
    if "NE" in dir_upper:
        factors = {"NE": 1.08, "SE": 1.22, "SW": 0.88, "NW": 0.92}
    elif "NW" in dir_upper:
        factors = {"NE": 1.20, "SE": 0.92, "SW": 0.85, "NW": 1.10}
    elif "SE" in dir_upper:
        factors = {"NE": 0.90, "SE": 1.15, "SW": 1.20, "NW": 0.85}
    else:
        factors = {"NE": 1.05, "SE": 1.10, "SW": 0.95, "NW": 0.90}

    # Small forecast hour decay/expansion adjustment
    hour_factor = 1.0 + (forecast_hour * 0.003)

    def compute_quadrant(base_nm: float, min_val: float) -> QuadrantRadii:
        ne = round(max(min_val, base_nm * intensity_scale * factors["NE"] * hour_factor), 1)
        se = round(max(min_val, base_nm * intensity_scale * factors["SE"] * hour_factor), 1)
        sw = round(max(min_val, base_nm * intensity_scale * factors["SW"] * hour_factor), 1)
        nw = round(max(min_val, base_nm * intensity_scale * factors["NW"] * hour_factor), 1)
        return QuadrantRadii(NE=ne, SE=se, SW=sw, NW=nw)

    # Compute R34, R50, R64
    r34 = compute_quadrant(BASE_R34_NM, min_val=40.0)
    
    # Guarantee R50 < R34 for all quadrants
    r50_raw = compute_quadrant(BASE_R50_NM, min_val=20.0)
    r50 = QuadrantRadii(
        NE=round(min(r50_raw.NE, r34.NE * 0.75), 1),
        SE=round(min(r50_raw.SE, r34.SE * 0.75), 1),
        SW=round(min(r50_raw.SW, r34.SW * 0.75), 1),
        NW=round(min(r50_raw.NW, r34.NW * 0.75), 1),
    )

    # Guarantee R64 < R50 for all quadrants (if max wind >= 64 kt)
    if max_wind_kts >= 64.0:
        r64_raw = compute_quadrant(BASE_R64_NM, min_val=10.0)
        r64 = QuadrantRadii(
            NE=round(min(r64_raw.NE, r50.NE * 0.65), 1),
            SE=round(min(r64_raw.SE, r50.SE * 0.65), 1),
            SW=round(min(r64_raw.SW, r50.SW * 0.65), 1),
            NW=round(min(r64_raw.NW, r50.NW * 0.65), 1),
        )
    else:
        r64 = QuadrantRadii(NE=0.0, SE=0.0, SW=0.0, NW=0.0)

    return ThresholdRadii(R34=r34, R50=r50, R64=r64)

def interpolate_radius_for_angle(angle_deg: float, q_radii: QuadrantRadii) -> float:
    """
    Smooth cosine interpolation across 360 degrees given 4 quadrant radii.
    0° = East, 90° = North, 180° = West, 270° = South in standard mathematical polar coords,
    or geographic azimuths: 0° NE (0-90), 90° SE (90-180), 180° SW (180-270), 270° NW (270-360).
    """
    a = (angle_deg % 360)
    
    if 0 <= a < 90:
        t = a / 90.0
        r1, r2 = q_radii.NE, q_radii.SE
    elif 90 <= a < 180:
        t = (a - 90.0) / 90.0
        r1, r2 = q_radii.SE, q_radii.SW
    elif 180 <= a < 270:
        t = (a - 180.0) / 90.0
        r1, r2 = q_radii.SW, q_radii.NW
    else:
        t = (a - 270.0) / 90.0
        r1, r2 = q_radii.NW, q_radii.NE

    # Smooth cosine transition weight
    smooth_t = (1.0 - math.cos(t * math.pi)) / 2.0
    return r1 * (1.0 - smooth_t) + r2 * smooth_t

def generate_wind_radius_polygon(
    center_lat: float,
    center_lon: float,
    q_radii: QuadrantRadii,
    threshold_name: str,
    wind_speed_kt: int,
    num_points: int = 72,
) -> Dict[str, Any]:
    """
    Generates a smooth GeoJSON Polygon feature for a wind-radius threshold (e.g. R34).
    Converts radii in nautical miles to geographic coordinates with smooth 72-point interpolation.
    """
    if q_radii.NE <= 0 and q_radii.SE <= 0 and q_radii.SW <= 0 and q_radii.NW <= 0:
        return {
            "type": "Feature",
            "properties": {
                "threshold": threshold_name,
                "wind_speed_kt": wind_speed_kt,
                "source": "DEMO_MODEL",
                "is_empty": True,
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [],
            },
        }

    ring: List[List[float]] = []
    cos_lat = math.cos(math.radians(center_lat))

    for i in range(num_points):
        angle_deg = (i * 360.0) / num_points
        rad_nm = interpolate_radius_for_angle(angle_deg, q_radii)
        
        # 1 NM = 1.852 km
        dist_km = rad_nm * 1.852
        
        # Angle in radians (0° = North, clockwise for geographic azimuth)
        angle_rad = math.radians(angle_deg)
        
        d_lat_deg = (dist_km * math.cos(angle_rad)) / 111.0
        d_lon_deg = (dist_km * math.sin(angle_rad)) / (111.0 * max(0.1, cos_lat))
        
        lat_p = round(center_lat + d_lat_deg, 5)
        lon_p = round(center_lon + d_lon_deg, 5)
        
        ring.append([lon_p, lat_p])

    # Close polygon ring
    if ring:
        ring.append(ring[0])

    return {
        "type": "Feature",
        "properties": {
            "threshold": threshold_name,
            "wind_speed_kt": wind_speed_kt,
            "source": "DEMO_MODEL",
            "quadrant_radii": q_radii.model_dump(),
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [ring],
        },
    }

def get_wind_field(
    storm_id: str = "DEMO-BOB-001",
    forecast_hour: int = 0,
    center_lat: float = 18.6,
    center_lon: float = 87.4,
    max_wind_kts: float = 96.0,
    pressure_hpa: float = 978.0,
    movement_dir: str = "NE",
    movement_speed_kmh: float = 14.0,
) -> WindFieldResponse:
    """
    Main service function returning WindFieldResponse schema with radii & GeoJSON FeatureCollection.
    Resolves storm center position dynamically based on storm_id and forecast hour trajectory.
    """
    norm_id = storm_id.upper().strip()

    # Coordinates lookup table per storm_id and forecast_hour
    if "ARB" in norm_id or "043" in norm_id:
        # Cyclone ARB-02 (Arabian Sea)
        track_map = {
            0: (16.2, 67.8, 52.0, 994.0),
            6: (16.6, 66.9, 56.0, 990.0),
            12: (17.1, 65.8, 62.0, 985.0),
            24: (18.0, 64.2, 70.0, 978.0),
            48: (19.5, 61.8, 55.0, 990.0),
            72: (21.0, 59.5, 40.0, 1000.0),
        }
        base_dir = "WNW"
    else:
        # Cyclone BOB-04 (Bay of Bengal - Default)
        track_map = {
            0: (18.6, 87.4, 96.0, 978.0),
            6: (19.1, 87.9, 98.0, 974.0),
            12: (19.7, 88.5, 105.0, 968.0),
            24: (20.8, 89.4, 100.0, 972.0),
            48: (22.3, 90.6, 75.0, 988.0),
            72: (23.5, 91.8, 45.0, 1002.0),
        }
        base_dir = "NE"

    if forecast_hour in track_map:
        cur_lat, cur_lon, cur_wind, cur_press = track_map[forecast_hour]
    else:
        # Interpolate for arbitrary hour
        cur_lat = round(center_lat + (forecast_hour * 0.08), 4)
        cur_lon = round(center_lon + (forecast_hour * 0.09), 4)
        cur_wind = max_wind_kts
        cur_press = pressure_hpa

    radii = calculate_asymmetric_radii(
        max_wind_kts=cur_wind,
        pressure_hpa=cur_press,
        movement_dir=base_dir,
        movement_speed_kmh=movement_speed_kmh,
        forecast_hour=forecast_hour,
    )

    feat_r34 = generate_wind_radius_polygon(cur_lat, cur_lon, radii.R34, "R34", 34)
    feat_r50 = generate_wind_radius_polygon(cur_lat, cur_lon, radii.R50, "R50", 50)
    feat_r64 = generate_wind_radius_polygon(cur_lat, cur_lon, radii.R64, "R64", 64)

    geojson = {
        "type": "FeatureCollection",
        "features": [feat_r34, feat_r50, feat_r64],
    }

    now_utc = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    return WindFieldResponse(
        storm_id=storm_id,
        valid_time=now_utc,
        forecast_hour=forecast_hour,
        center=CenterCoordinates(lat=cur_lat, lon=cur_lon),
        radii=radii,
        geojson=geojson,
        units="nm",
        source="DEMO_MODEL",
        confidence=0.85,
        is_demo=True,
    )

def get_wind_field_forecast(storm_id: str = "DEMO-BOB-001") -> WindFieldForecastResponse:
    """
    Returns wind radii and GeoJSON polygons across all standard forecast horizons (0h, 6h, 12h, 24h, 48h, 72h).
    """
    horizons = [
        (0, "0h (NOW)"),
        (6, "+6h"),
        (12, "+12h"),
        (24, "+24h"),
        (48, "+48h"),
        (72, "+72h"),
    ]

    items: List[WindFieldForecastItem] = []
    for hr, label in horizons:
        wf = get_wind_field(storm_id=storm_id, forecast_hour=hr)
        items.append(
            WindFieldForecastItem(
                forecast_hour=hr,
                horizon_label=label,
                valid_time=wf.valid_time,
                center=wf.center,
                wind_kts=96.0 + (hr * 0.2 if hr <= 12 else -hr * 0.15),
                pressure_hpa=978.0 - (hr * 0.1 if hr <= 12 else -hr * 0.1),
                radii=wf.radii,
                geojson=wf.geojson,
            )
        )

    return WindFieldForecastResponse(
        storm_id=storm_id,
        storm_name="ASNA",
        source="DEMO_MODEL",
        is_demo=True,
        forecasts=items,
    )
