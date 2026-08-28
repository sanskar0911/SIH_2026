import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "TC-INTEL INDIA — SIH 2026 PS26070"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite:///./tc_intel.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security
    JWT_SECRET: str = "super-secret-sih-2026-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # AI & Simulation
    MOCK_DATA_MODE: bool = True
    GPU_ENABLED: bool = False
    MODEL_PATH: str = "./models/checkpoints"

    # External Provider Configs
    MOSDAC_BASE_URL: Optional[str] = "https://mosdac.gov.in/api"
    MOSDAC_API_KEY: Optional[str] = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
