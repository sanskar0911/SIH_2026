from sqlalchemy import Column, String, Float, DateTime, func
from app.database.base import Base

class AnalysisJobModel(Base):
    __tablename__ = "analysis_jobs"

    id = Column(String, primary_key=True, index=True)
    storm_id = Column(String, index=True, nullable=False)
    status = Column(String, default="QUEUED")  # QUEUED, PROCESSING, COMPLETE, FAILED
    progress = Column(Float, default=0.0)
    current_stage = Column(String, default="INITIALIZING")
    error = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
