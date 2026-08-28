from app.services.ingestion.base import DataSource
from typing import List, Dict, Any

class MockSatelliteProvider(DataSource):
    def fetch(self, storm_id: str) -> List[Dict[str, Any]]:
        return [
            {
                "id": f"OBS-{storm_id}-IR",
                "satellite": "INSAT-3DR",
                "product": "IR1_10.8um",
                "quality_score": 98.5,
                "timestamp": "14:30 UTC"
            }
        ]

    def validate(self, raw_data: List[Dict[str, Any]]) -> bool:
        return len(raw_data) > 0

    def normalize(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return raw_data

class MOSDACProvider(DataSource):
    def fetch(self, storm_id: str) -> List[Dict[str, Any]]:
        # Ready for live MOSDAC API integration
        return []

    def validate(self, raw_data: List[Dict[str, Any]]) -> bool:
        return True

    def normalize(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return raw_data

class BestTrackProvider(DataSource):
    def fetch(self, storm_id: str) -> List[Dict[str, Any]]:
        return []

    def validate(self, raw_data: List[Dict[str, Any]]) -> bool:
        return True

    def normalize(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return raw_data

class IBTrACSProvider(DataSource):
    def fetch(self, storm_id: str) -> List[Dict[str, Any]]:
        return []

    def validate(self, raw_data: List[Dict[str, Any]]) -> bool:
        return True

    def normalize(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return raw_data

class MicrowaveProvider(DataSource):
    def fetch(self, storm_id: str) -> List[Dict[str, Any]]:
        return []

    def validate(self, raw_data: List[Dict[str, Any]]) -> bool:
        return True

    def normalize(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return raw_data

class ScatterometerProvider(DataSource):
    def fetch(self, storm_id: str) -> List[Dict[str, Any]]:
        return []

    def validate(self, raw_data: List[Dict[str, Any]]) -> bool:
        return True

    def normalize(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return raw_data

class EnvironmentProvider(DataSource):
    def fetch(self, storm_id: str) -> List[Dict[str, Any]]:
        return []

    def validate(self, raw_data: List[Dict[str, Any]]) -> bool:
        return True

    def normalize(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return raw_data
