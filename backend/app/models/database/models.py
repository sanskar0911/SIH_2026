from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, JSON
from app.db.session import Base
import datetime

class StormModel(Base):
    __tablename__ = "storms"

    id = Column(Integer, primary_key=True, index=True)
    storm_id = Column(String, unique=True, index=True)
    name = Column(String)
    basin = Column(String)
    category = Column(String)
    center_lat = Column(Float)
    center_lng = Column(Float)
    wind_kts = Column(Float)
    pressure_hpa = Column(Float)
    confidence = Column(Float)
    movement_dir = Column(String)
    movement_speed_kmh = Column(Float)
    rapid_intensification_risk = Column(Float)
    genesis_probability = Column(Float)
    coastal_distance_km = Column(Float)
    nearest_landfall_point = Column(String)
    data_quality = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ForecastModel(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    storm_id = Column(String, index=True)
    horizon = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    wind_p10 = Column(Float)
    wind_p50 = Column(Float)
    wind_p90 = Column(Float)
    pressure_hpa = Column(Float)
    confidence = Column(Float)
    prediction_interval_km = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AlertModel(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String, unique=True, index=True)
    category = Column(String)
    severity = Column(String)
    storm_id = Column(String)
    title = Column(String)
    description = Column(String)
    trigger_reason = Column(String)
    confidence = Column(Float)
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AnnotationModel(Base):
    __tablename__ = "annotations"

    id = Column(Integer, primary_key=True, index=True)
    annotation_id = Column(String, unique=True, index=True)
    storm_id = Column(String)
    analyst_name = Column(String)
    action = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WindRadiusModel(Base):
    __tablename__ = "wind_radii"

    id = Column(Integer, primary_key=True, index=True)
    storm_id = Column(String, index=True)
    valid_time = Column(String)
    forecast_hour = Column(Integer, default=0)
    radius_type = Column(String)  # 'R34', 'R50', 'R64'
    ne_radius = Column(Float)     # in nautical miles
    se_radius = Column(Float)
    sw_radius = Column(Float)
    nw_radius = Column(Float)
    units = Column(String, default="nm")
    source = Column(String, default="DEMO_MODEL")
    confidence = Column(Float, default=0.85)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
