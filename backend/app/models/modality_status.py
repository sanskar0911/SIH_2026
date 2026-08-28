from sqlalchemy import Column, String, Float, Boolean, DateTime, func
from app.database.base import Base

class ModalityStatusModel(Base):
    __tablename__ = "modality_statuses"

    id = Column(String, primary_key=True, index=True)
    modality = Column(String, nullable=False, index=True)
    available = Column(Boolean, default=True)
    timestamp = Column(String, nullable=False)
    age_seconds = Column(Float, default=120.0)
    quality_score = Column(Float, default=95.0)
    reliability_score = Column(Float, default=95.0)
    missing_reason = Column(String, nullable=True)
