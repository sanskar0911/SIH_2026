from sqlalchemy import Column, String, Float, JSON
from app.database.base import Base

class UncertaintyModel(Base):
    __tablename__ = "uncertainty"

    id = Column(String, primary_key=True, index=True)
    forecast_id = Column(String, index=True, nullable=False)

    mean_lat = Column(Float, nullable=False)
    mean_lon = Column(Float, nullable=False)

    dispersion_km = Column(Float, default=25.0)

    covariance = Column(JSON, nullable=True)
    confidence_region = Column(JSON, nullable=True)

    coverage_probability = Column(Float, default=0.90)
    calibration_score = Column(Float, default=0.94)

    ensemble_metadata = Column(JSON, nullable=True)
