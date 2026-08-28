import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
from app.database.session import SessionLocal
from app.models import (
    StormModel, ObservationModel, StormStateModel, ForecastModel,
    UncertaintyModel, ModalityStatusModel, AlertModel, ExplanationModel,
    ModelVersionModel, AuditRecordModel
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tc_intel.seed_db")

def seed_db():
    db = SessionLocal()
    try:
        logger.info("Seeding persistent database records...")

        # 1. Storms
        if not db.query(StormModel).filter_by(storm_id="NIO-DEMO-001").first():
            demo_storm = StormModel(
                id="NIO-DEMO-001",
                storm_id="NIO-DEMO-001",
                name="NIO-DEMO-001",
                basin="NORTH_INDIAN_OCEAN",
                status="ACTIVE",
                source="IMD_MOSDAC"
            )
            db.add(demo_storm)

        if not db.query(StormModel).filter_by(storm_id="TC-ARUN").first():
            arun_storm = StormModel(
                id="TC-ARUN",
                storm_id="TC-ARUN",
                name="TC-ARUN",
                basin="NORTH_INDIAN_OCEAN",
                status="ACTIVE",
                source="IMD_MOSDAC"
            )
            db.add(arun_storm)

        # 2. Storm States
        if not db.query(StormStateModel).filter_by(storm_id="TC-ARUN").first():
            arun_state = StormStateModel(
                id="STATE-TC-ARUN-T0",
                storm_id="TC-ARUN",
                timestamp="14:30 UTC",
                center_lat=15.8,
                center_lon=84.6,
                wind_kt=78.0,
                pressure_hpa=972.0,
                classification="VERY SEVERE CYCLONIC STORM",
                genesis_probability=98.0,
                rapid_intensification_probability=64.0,
                organization=87.0,
                symmetry=72.0,
                eye_signature="DETECTED",
                eyewall_confidence=81.0,
                structure_trend="STRENGTHENING",
                confidence=91.0,
                model_version="v2.4.1-SIH-STABLE"
            )
            db.add(arun_state)

        # 3. Model Versions
        if not db.query(ModelVersionModel).filter_by(id="v2.4.1-SIH-STABLE").first():
            model_ver = ModelVersionModel(
                id="v2.4.1-SIH-STABLE",
                model_name="TC-INTEL Multimodal Fusion Champion",
                version="2.4.1",
                architecture="Cross-Modal Attention + ConvLSTM",
                dataset_version="MOSDAC-2025-V3",
                preprocessing_version="PRE-v1.8",
                git_commit="c8f93a1",
                inference_config="FP16_MIXED_PRECISION",
                checkpoint_uri="s3://cyclone-imagery/checkpoints/v2.4.1.pt",
                metrics={"detectionF1": "94.2%", "segmentationDice": "0.89", "trackError24h": "76 km"},
                status="CHAMPION"
            )
            db.add(model_ver)

        # 4. Modality Statuses
        modalities = [
            ("ir", "AVAILABLE", 98.0),
            ("microwave", "AVAILABLE", 94.0),
            ("scatterometer", "AVAILABLE", 91.0),
            ("sst", "AVAILABLE", 96.0),
            ("environment", "AVAILABLE", 95.0)
        ]
        for mod_name, status, q_score in modalities:
            if not db.query(ModalityStatusModel).filter_by(modality=mod_name).first():
                db.add(ModalityStatusModel(
                    id=f"MOD-{mod_name.upper()}",
                    modality=mod_name,
                    available=(status == "AVAILABLE"),
                    timestamp="14:30 UTC",
                    age_seconds=120.0,
                    quality_score=q_score,
                    reliability_score=95.0
                ))

        # 5. Audit Trail
        if not db.query(AuditRecordModel).filter_by(storm_id="NIO-DEMO-001").first():
            db.add(AuditRecordModel(
                id="AUDIT-DEMO-001",
                storm_id="NIO-DEMO-001",
                analysis_time="14:30 UTC",
                observation_ids=["OBS-3DR-01", "OBS-GPM-02", "OBS-SCAT-03"],
                modalities_used=["ir", "microwave", "scatterometer", "sst", "environment"],
                missing_modalities=[],
                model_version="v2.4.1-SIH-STABLE",
                preprocessing_version="PRE-v1.8",
                dataset_version="MOSDAC-2025-V3",
                confidence=94.0
            ))

        db.commit()
        logger.info("Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
