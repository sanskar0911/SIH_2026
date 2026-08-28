from fastapi import APIRouter
from app.services.genesis.genesis_service import GenesisService

router = APIRouter(prefix="/genesis", tags=["Genesis"])
genesis_service = GenesisService()

@router.get("")
@router.get("/")
def get_genesis_predictions():
    return genesis_service.predict_genesis({})
