from sqlalchemy import Column, String, JSON, DateTime, func
from app.database.base import Base

class ModelVersionModel(Base):
    __tablename__ = "model_versions"

    id = Column(String, primary_key=True, index=True)
    model_name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    architecture = Column(String, nullable=False)

    dataset_version = Column(String, nullable=False)
    preprocessing_version = Column(String, nullable=False)
    git_commit = Column(String, nullable=False)

    inference_config = Column(String, nullable=True)
    checkpoint_uri = Column(String, nullable=True)
    metrics = Column(JSON, nullable=True)
    status = Column(String, default="CHAMPION")  # CHAMPION, CHALLENGER, ARCHIVED

    created_at = Column(DateTime(timezone=True), server_default=func.now())
