from fastapi import APIRouter
from app.schemas.system import ModelPerformanceSchema

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
