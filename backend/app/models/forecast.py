from sqlalchemy import Column, String, Float, Integer, DateTime, func
from app.database.base import Base

class ForecastModel(Base):
    __tablename__ = "forecasts"

    id = Column(String, primary_key=True, index=True)
    storm_id = Column(String, index=True, nullable=False)
    issue_time = Column(String, nullable=False)
    horizon_hours = Column(Integer, nullable=False)

    predicted_lat = Column(Float, nullable=False)
    predicted_lon = Column(Float, nullable=False)

    wind_p10 = Column(Float, nullable=False)
    wind_p50 = Column(Float, nullable=False)
    wind_p90 = Column(Float, nullable=False)

    pressure_p50 = Column(Float, nullable=False)

    confidence = Column(Float, default=80.0)
    model_version = Column(String, default="v1.0.0")
