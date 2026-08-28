from pydantic import BaseModel
from typing import List, Literal, Dict, Optional

ModalityStatusType = Literal['AVAILABLE', 'DEGRADED', 'STALE', 'MISSING', 'UNRELIABLE']

class SourceHealthSchema(BaseModel):
    source: str
    status: ModalityStatusType
    lastObservation: str
    age: str
    quality: float
    priority: Literal['P0', 'P1', 'P2']

class DataHealthSchema(BaseModel):
    score: float
    latency: str
    lastIngest: str
    sources: List[SourceHealthSchema]

class ModelPerformanceSchema(BaseModel):
    detectionF1: str
    segmentationDice: str
    intensityMAE: str
    intensityRMSE: str
    trackError: Dict[str, str]
    genesisCalibration: str
    brierScore: str
    uncertaintyCoverage: str
    operationalLatency: str
    memoryUsage: str

class ModelVersionSchema(BaseModel):
    id: str
    status: Literal['CHAMPION', 'CHALLENGER']
    datasetVersion: str
    preprocessingVersion: str
    gitCommit: str
    inferenceConfig: str

class ScenarioRequest(BaseModel):
    scenario: Literal[
        'NORMAL',
        'WEAK_DISTURBANCE',
        'RAPID_INTENSIFICATION',
        'RAPID_WEAKENING',
        'LAND_INTERACTION',
        'MULTIPLE_DISTURBANCES',
        'SATELLITE_GAP',
        'MISSING_MICROWAVE',
        'POOR_DATA',
        'OOD_CASE'
    ]

class ScenarioResponse(BaseModel):
    message: str
    currentScenario: str
    modalityStatus: Dict[str, ModalityStatusType]
    analysisStatus: str
