from sqlalchemy import Column, String, JSON
from app.database.base import Base

class ExplanationModel(Base):
    __tablename__ = "explanations"

    id = Column(String, primary_key=True, index=True)
    storm_id = Column(String, index=True, nullable=False)
    forecast_id = Column(String, nullable=True)

    modality_contributions = Column(JSON, nullable=False)
    model_evidence = Column(JSON, nullable=False)
    temporal_influence = Column(JSON, nullable=False)
    visual_evidence_uri = Column(String, nullable=True)
