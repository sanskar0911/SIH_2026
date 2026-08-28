from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, JSON, func
from app.database.base import Base

class ObservationModel(Base):
    __tablename__ = "observations"

    id = Column(String, primary_key=True, index=True)
    storm_id = Column(String, index=True, nullable=False)
    timestamp = Column(String, nullable=False)
    satellite = Column(String, nullable=False)
    product = Column(String, nullable=False)
    channel = Column(String, nullable=True)
    storage_uri = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    resolution = Column(String, default="1km")
    quality_score = Column(Float, default=100.0)
    observation_age = Column(String, default="0m")
    available = Column(Boolean, default=True)
    meta_info = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
