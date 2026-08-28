from fastapi import APIRouter
from app.api.v1 import (
    storms, observations, forecasts, genesis, alerts,
    explanations, historical, data_health, analysis,
    feedback, models, metrics, system
)

api_router = APIRouter()

api_router.include_router(storms.router)
api_router.include_router(forecasts.router)
api_router.include_router(observations.router)
api_router.include_router(genesis.router)
api_router.include_router(alerts.router)
api_router.include_router(data_health.router)
api_router.include_router(explanations.router)
api_router.include_router(historical.router)
api_router.include_router(analysis.router)
api_router.include_router(feedback.router)
api_router.include_router(models.router)
api_router.include_router(metrics.router)
api_router.include_router(system.router)
