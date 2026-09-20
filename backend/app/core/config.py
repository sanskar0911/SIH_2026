from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "TC-INTEL INDIA — SIH 2026 PS26070"
    API_V1_STR: str = "/api/v1"
    
    # Operational Modes
    MOCK_DATA_MODE: bool = True
    MOSDAC_ENABLED: bool = False
    GPU_ENABLED: bool = False
    
    # MOSDAC Credentials (Backend Only - Optional)
    MOSDAC_BASE_URL: str = "https://mosdac.gov.in/api"
    MOSDAC_USERNAME: Optional[str] = ""
    MOSDAC_PASSWORD: Optional[str] = ""
    MOSDAC_DATASET_ID: Optional[str] = ""

    # Map & Overlay API Integrations
    OPENWEATHERMAP_API_KEY: str = "your_openweathermap_api_key_here"
    CARTO_API_URL: str = "https://gcp-us-east1.api.carto.com/mcp/ac_vm68s9ah"
    CARTO_API_KEY: str = "your_carto_api_key_here"
    
    # Model Metadata & Checkpoints
    MODEL_PATH: str = "./models/checkpoints"
    MODEL_VERSION: str = "v1.4.2 (NIO-DualNet)"
    GIT_COMMIT: str = "a83f92d"
    DATASET_VERSION: str = "NIO Dataset Snapshot 2026.08"
    
    # Database & Storage
    DATABASE_URL: str = "sqlite:///./sqlite_cyclone.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security
    JWT_SECRET: str = "sih-2026-cyclone-intelligence-super-secret-key-32bytes"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:4173",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    # Logging & Operations
    LOG_LEVEL: str = "INFO"
    
    class Config:
        case_sensitive = True
        extra = "ignore"
        env_file = ".env"

settings = Settings()
