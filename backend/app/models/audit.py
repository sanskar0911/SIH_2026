from sqlalchemy import Column, String, Float, JSON, DateTime, func
from app.database.base import Base

class AuditRecordModel(Base):
    __tablename__ = "audit_records"

    id = Column(String, primary_key=True, index=True)
    storm_id = Column(String, index=True, nullable=False)
    analysis_time = Column(String, nullable=False)
    observation_ids = Column(JSON, nullable=False)
    modalities_used = Column(JSON, nullable=False)
    missing_modalities = Column(JSON, nullable=False)
    model_version = Column(String, default="v2.4.1-SIH-STABLE")
    preprocessing_version = Column(String, default="PRE-v1.8")
    dataset_version = Column(String, default="MOSDAC-2025-V3")
    forecast_snapshot = Column(JSON, nullable=True)
    uncertainty_snapshot = Column(JSON, nullable=True)
    consistency_result = Column(JSON, nullable=True)
    confidence = Column(Float, default=91.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
