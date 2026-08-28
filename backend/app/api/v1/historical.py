from fastapi import APIRouter
from app.services.historical.replay_service import HistoricalReplayService

router = APIRouter(prefix="/historical", tags=["Historical Replay"])
replay_service = HistoricalReplayService()

@router.get("", response_model=list)
@router.get("/", response_model=list)
def get_historical_storms():
    return [
        replay_service.get_historical_replay("TC-ARUN"),
        replay_service.get_historical_replay("TC-VEER")
    ]

@router.get("/{storm_id}/replay")
def get_historical_replay(storm_id: str):
    return replay_service.get_historical_replay(storm_id)
