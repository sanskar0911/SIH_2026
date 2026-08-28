from sqlalchemy import Column, String, Float, Integer, DateTime, func
from app.database.base import Base

class StormStateModel(Base):
    __tablename__ = "storm_states"

    id = Column(String, primary_key=True, index=True)
    storm_id = Column(String, index=True, nullable=False)
    timestamp = Column(String, nullable=False)

    center_lat = Column(Float, nullable=False)
    center_lon = Column(Float, nullable=False)

    wind_kt = Column(Float, nullable=False)
    pressure_hpa = Column(Float, nullable=False)

    classification = Column(String, nullable=False)

    genesis_probability = Column(Float, default=0.0)
    rapid_intensification_probability = Column(Float, default=0.0)

    organization = Column(Float, default=50.0)
    symmetry = Column(Float, default=50.0)
    asymmetry = Column(Float, default=50.0)

    eye_signature = Column(String, default="NOT DETECTED")
    eyewall_confidence = Column(Float, default=0.0)

    structure_trend = Column(String, default="STEADY")

    confidence = Column(Float, default=80.0)
    model_version = Column(String, default="v1.0.0")
