from abc import ABC, abstractmethod
from typing import List, Dict, Any

class DataSource(ABC):
    @abstractmethod
    def fetch(self, storm_id: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def validate(self, raw_data: List[Dict[str, Any]]) -> bool:
        pass

    @abstractmethod
    def normalize(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        pass
