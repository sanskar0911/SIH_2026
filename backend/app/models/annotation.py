from sqlalchemy import Column, String, Float, DateTime, func
from app.database.base import Base

class AnnotationModel(Base):
    __tablename__ = "annotations"

    id = Column(String, primary_key=True, index=True)
    storm_id = Column(String, index=True, nullable=False)
    timestamp = Column(String, nullable=False)

    observed_issue = Column(String, nullable=False)
    corrected_center_lat = Column(Float, nullable=False)
    corrected_center_lon = Column(Float, nullable=False)
    corrected_class = Column(String, nullable=False)
    comment = Column(String, nullable=True)
    analyst_id = Column(String, default="ANALYST-01")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
