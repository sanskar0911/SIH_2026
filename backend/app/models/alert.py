from sqlalchemy import Column, String, Float, DateTime, func
from app.database.base import Base

class AlertModel(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    storm_id = Column(String, index=True, nullable=True)
    type = Column(String, nullable=False)
    level = Column(String, nullable=False)
    title = Column(String, nullable=False)
    detail = Column(String, nullable=False)
    probability = Column(Float, nullable=True)
    confidence = Column(Float, nullable=True)
    threshold = Column(Float, nullable=True)
    timestamp = Column(String, nullable=False)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
