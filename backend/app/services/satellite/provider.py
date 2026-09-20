from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import datetime
from app.core.config import settings

class SatelliteProvider(ABC):
    @abstractmethod
    def get_latest_observation(self, storm_id: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_available_channels(self) -> List[str]:
        pass

class MockSatelliteProvider(SatelliteProvider):
    """
    Deterministic Demo Satellite Provider for North Indian Ocean scenario (DEMO-BOB-001).
    Does NOT require MOSDAC or external API credentials.
    """
    def get_latest_observation(self, storm_id: str) -> Dict[str, Any]:
        now_utc = datetime.datetime.utcnow().isoformat() + "Z"
        return {
            "storm_id": storm_id,
            "satellite_id": "INSAT-3D",
            "observation_time": now_utc,
            "basin": "BAY_OF_BENGAL",
            "center": {"lat": 16.2, "lon": 86.4},
            "channels": {
                "TIR1": {"available": True, "brightness_temp_k": 190.8, "quality": "EXCELLENT"},
                "TIR2": {"available": True, "brightness_temp_k": 192.1, "quality": "EXCELLENT"},
                "WV": {"available": True, "moisture_index": 0.88, "quality": "EXCELLENT"},
                "VIS": {"available": True, "albedo": 0.76, "quality": "GOOD"},
                "PMW": {"available": True, "sensor": "AMSR2", "quality": "SIMULATED"},
            },
            "source": "DEMO_MODEL",
            "is_demo": True,
        }

    def get_available_channels(self) -> List[str]:
        return ["TIR1", "TIR2", "WV", "VIS", "PMW"]

class MOSDACSatelliteProvider(SatelliteProvider):
    """
    MOSDAC Provider for INSAT-3D/3DR integration.
    Handles missing credentials gracefully without crashing application startup.
    """
    def __init__(self):
        self.base_url = settings.MOSDAC_BASE_URL
        self.has_credentials = bool(settings.MOSDAC_USERNAME and settings.MOSDAC_PASSWORD)

    def get_latest_observation(self, storm_id: str) -> Dict[str, Any]:
        if not settings.MOSDAC_ENABLED or not self.has_credentials:
            # Fall back to Mock Provider safely
            fallback = MockSatelliteProvider()
            res = fallback.get_latest_observation(storm_id)
            res["notice"] = "MOSDAC disabled or missing credentials; using deterministic fallback."
            return res

        # Structural placeholder for future live MOSDAC HTTP ingestion
        return {
            "storm_id": storm_id,
            "satellite_id": "INSAT-3D_LIVE",
            "source": "MOSDAC",
            "is_demo": False,
        }

    def get_available_channels(self) -> List[str]:
        return ["TIR1", "TIR2", "WV", "VIS", "MIR", "SWIR"]

def get_satellite_provider() -> SatelliteProvider:
    if settings.MOCK_DATA_MODE or not settings.MOSDAC_ENABLED:
        return MockSatelliteProvider()
    return MOSDACSatelliteProvider()
