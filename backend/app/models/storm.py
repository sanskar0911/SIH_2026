from sqlalchemy import Column, String, DateTime, func
from app.database.base import Base

class StormModel(Base):
    __tablename__ = "storms"

    id = Column(String, primary_key=True, index=True)
    storm_id = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    basin = Column(String, default="NORTH_INDIAN_OCEAN")
    status = Column(String, default="ACTIVE")
    source = Column(String, default="IMD_MOSDAC")
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
