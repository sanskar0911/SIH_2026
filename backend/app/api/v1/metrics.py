from fastapi import APIRouter
from typing import List
from app.schemas.system import ModelPerformanceSchema, ModelComparisonItem

router = APIRouter(prefix="/metrics", tags=["Metrics"])

@router.get("/operational", response_model=ModelPerformanceSchema)
def get_operational_metrics():
    return ModelPerformanceSchema(
        detectionF1="94.2%",
        segmentationDice="0.89",
        intensityMAE="4.8 KT",
        intensityRMSE="6.2 KT",
        trackError={
            "6h": "28 km",
            "12h": "44 km",
            "24h": "76 km",
            "48h": "135 km",
            "72h": "210 km"
        },
        genesisCalibration="0.92",
        brierScore="0.08",
        uncertaintyCoverage="89.5%",
        operationalLatency="1.4 sec",
        memoryUsage="3.2 GB VRAM"
    )

@router.get("/comparison", response_model=List[ModelComparisonItem])
def get_model_comparison():
    return [
        ModelComparisonItem(
            modelName="Persistence Baseline",
            trackError24hKm=142.0,
            trackError48hKm=265.0,
            intensityMaeKt=12.4,
            f1Score=0.72,
            latencyMs=12.0
        ),
        ModelComparisonItem(
            modelName="Single IR CNN",
            trackError24hKm=98.0,
            trackError48hKm=182.0,
            intensityMaeKt=7.5,
            f1Score=0.84,
            latencyMs=180.0
        ),
        ModelComparisonItem(
            modelName="IR + ConvLSTM",
            trackError24hKm=84.0,
            trackError48hKm=150.0,
            intensityMaeKt=5.8,
            f1Score=0.89,
            latencyMs=450.0
        ),
        ModelComparisonItem(
            modelName="TC-INTEL Multimodal Fusion (Champion)",
            trackError24hKm=76.0,
            trackError48hKm=135.0,
            intensityMaeKt=4.8,
            f1Score=0.94,
            latencyMs=1400.0
        )
    ]
