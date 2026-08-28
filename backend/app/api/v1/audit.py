from fastapi import APIRouter
from app.schemas.system import AuditRecordSchema
from app.services.scenario_service import scenario_engine

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("/{storm_id}", response_model=AuditRecordSchema)
def get_storm_audit_trail(storm_id: str):
    available_mods = [m for m, s in scenario_engine.modality_status.items() if s == "AVAILABLE"]
    missing_mods = [m for m, s in scenario_engine.modality_status.items() if s != "AVAILABLE"]

    return AuditRecordSchema(
        id=f"AUDIT-{storm_id}-001",
        stormId=storm_id,
        analysisTime="14:32 UTC",
        observationIds=["OBS-3DR-01", "OBS-GPM-02", "OBS-SCAT-03"],
        modalitiesUsed=available_mods,
        missingModalities=missing_mods,
        modelVersion="v2.4.1-SIH-STABLE",
        preprocessingVersion="PRE-v1.8",
        datasetVersion="MOSDAC-2025-V3",
        confidence=91.0 if len(missing_mods) == 0 else 76.0
    )
