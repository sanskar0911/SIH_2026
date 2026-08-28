"""Initial database schema for TC-INTEL INDIA

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-28 06:42:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Storms
    op.create_table(
        'storms',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('storm_id', sa.String(), nullable=False, index=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('basin', sa.String(), server_default='NORTH_INDIAN_OCEAN'),
        sa.Column('status', sa.String(), server_default='ACTIVE'),
        sa.Column('source', sa.String(), server_default='IMD_MOSDAC'),
        sa.Column('start_time', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True)
    )

    # Observations
    op.create_table(
        'observations',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('storm_id', sa.String(), nullable=False, index=True),
        sa.Column('timestamp', sa.String(), nullable=False),
        sa.Column('satellite', sa.String(), nullable=False),
        sa.Column('product', sa.String(), nullable=False),
        sa.Column('channel', sa.String(), nullable=True),
        sa.Column('storage_uri', sa.String(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('resolution', sa.String(), server_default='1km'),
        sa.Column('quality_score', sa.Float(), server_default='100.0'),
        sa.Column('observation_age', sa.String(), server_default='0m'),
        sa.Column('available', sa.Boolean(), server_default='1'),
        sa.Column('meta_info', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )

    # Storm States
    op.create_table(
        'storm_states',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('storm_id', sa.String(), nullable=False, index=True),
        sa.Column('timestamp', sa.String(), nullable=False),
        sa.Column('center_lat', sa.Float(), nullable=False),
        sa.Column('center_lon', sa.Float(), nullable=False),
        sa.Column('wind_kt', sa.Float(), nullable=False),
        sa.Column('pressure_hpa', sa.Float(), nullable=False),
        sa.Column('classification', sa.String(), nullable=False),
        sa.Column('genesis_probability', sa.Float(), server_default='0.0'),
        sa.Column('rapid_intensification_probability', sa.Float(), server_default='0.0'),
        sa.Column('organization', sa.Float(), server_default='50.0'),
        sa.Column('symmetry', sa.Float(), server_default='50.0'),
        sa.Column('asymmetry', sa.Float(), server_default='50.0'),
        sa.Column('eye_signature', sa.String(), server_default='NOT DETECTED'),
        sa.Column('eyewall_confidence', sa.Float(), server_default='0.0'),
        sa.Column('structure_trend', sa.String(), server_default='STEADY'),
        sa.Column('confidence', sa.Float(), server_default='80.0'),
        sa.Column('model_version', sa.String(), server_default='v1.0.0')
    )

    # Forecasts
    op.create_table(
        'forecasts',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('storm_id', sa.String(), nullable=False, index=True),
        sa.Column('issue_time', sa.String(), nullable=False),
        sa.Column('horizon_hours', sa.Integer(), nullable=False),
        sa.Column('predicted_lat', sa.Float(), nullable=False),
        sa.Column('predicted_lon', sa.Float(), nullable=False),
        sa.Column('wind_p10', sa.Float(), nullable=False),
        sa.Column('wind_p50', sa.Float(), nullable=False),
        sa.Column('wind_p90', sa.Float(), nullable=False),
        sa.Column('pressure_p50', sa.Float(), nullable=False),
        sa.Column('confidence', sa.Float(), server_default='80.0'),
        sa.Column('model_version', sa.String(), server_default='v1.0.0')
    )

    # Uncertainty
    op.create_table(
        'uncertainty',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('forecast_id', sa.String(), nullable=False, index=True),
        sa.Column('mean_lat', sa.Float(), nullable=False),
        sa.Column('mean_lon', sa.Float(), nullable=False),
        sa.Column('dispersion_km', sa.Float(), server_default='25.0'),
        sa.Column('covariance', sa.JSON(), nullable=True),
        sa.Column('confidence_region', sa.JSON(), nullable=True),
        sa.Column('coverage_probability', sa.Float(), server_default='0.90'),
        sa.Column('calibration_score', sa.Float(), server_default='0.94'),
        sa.Column('ensemble_metadata', sa.JSON(), nullable=True)
    )

    # Modality Statuses
    op.create_table(
        'modality_statuses',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('modality', sa.String(), nullable=False, index=True),
        sa.Column('available', sa.Boolean(), server_default='1'),
        sa.Column('timestamp', sa.String(), nullable=False),
        sa.Column('age_seconds', sa.Float(), server_default='120.0'),
        sa.Column('quality_score', sa.Float(), server_default='95.0'),
        sa.Column('reliability_score', sa.Float(), server_default='95.0'),
        sa.Column('missing_reason', sa.String(), nullable=True)
    )

    # Alerts
    op.create_table(
        'alerts',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('storm_id', sa.String(), nullable=True, index=True),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('level', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('detail', sa.String(), nullable=False),
        sa.Column('probability', sa.Float(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('threshold', sa.Float(), nullable=True),
        sa.Column('timestamp', sa.String(), nullable=False),
        sa.Column('status', sa.String(), server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )

    # Explanations
    op.create_table(
        'explanations',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('storm_id', sa.String(), nullable=False, index=True),
        sa.Column('forecast_id', sa.String(), nullable=True),
        sa.Column('modality_contributions', sa.JSON(), nullable=False),
        sa.Column('model_evidence', sa.JSON(), nullable=False),
        sa.Column('temporal_influence', sa.JSON(), nullable=False),
        sa.Column('visual_evidence_uri', sa.String(), nullable=True)
    )

    # Annotations
    op.create_table(
        'annotations',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('storm_id', sa.String(), nullable=False, index=True),
        sa.Column('timestamp', sa.String(), nullable=False),
        sa.Column('observed_issue', sa.String(), nullable=False),
        sa.Column('corrected_center_lat', sa.Float(), nullable=False),
        sa.Column('corrected_center_lon', sa.Float(), nullable=False),
        sa.Column('corrected_class', sa.String(), nullable=False),
        sa.Column('comment', sa.String(), nullable=True),
        sa.Column('analyst_id', sa.String(), server_default='ANALYST-01'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )

    # Analysis Jobs
    op.create_table(
        'analysis_jobs',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('storm_id', sa.String(), nullable=False, index=True),
        sa.Column('status', sa.String(), server_default='QUEUED'),
        sa.Column('progress', sa.Float(), server_default='0.0'),
        sa.Column('current_stage', sa.String(), server_default='INITIALIZING'),
        sa.Column('error', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True)
    )

    # Model Versions
    op.create_table(
        'model_versions',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('model_name', sa.String(), nullable=False),
        sa.Column('version', sa.String(), nullable=False),
        sa.Column('architecture', sa.String(), nullable=False),
        sa.Column('dataset_version', sa.String(), nullable=False),
        sa.Column('preprocessing_version', sa.String(), nullable=False),
        sa.Column('git_commit', sa.String(), nullable=False),
        sa.Column('inference_config', sa.String(), nullable=True),
        sa.Column('checkpoint_uri', sa.String(), nullable=True),
        sa.Column('metrics', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(), server_default='CHAMPION'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )

    # Audit Records
    op.create_table(
        'audit_records',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('storm_id', sa.String(), nullable=False, index=True),
        sa.Column('analysis_time', sa.String(), nullable=False),
        sa.Column('observation_ids', sa.JSON(), nullable=False),
        sa.Column('modalities_used', sa.JSON(), nullable=False),
        sa.Column('missing_modalities', sa.JSON(), nullable=False),
        sa.Column('model_version', sa.String(), server_default='v2.4.1-SIH-STABLE'),
        sa.Column('preprocessing_version', sa.String(), server_default='PRE-v1.8'),
        sa.Column('dataset_version', sa.String(), server_default='MOSDAC-2025-V3'),
        sa.Column('forecast_snapshot', sa.JSON(), nullable=True),
        sa.Column('uncertainty_snapshot', sa.JSON(), nullable=True),
        sa.Column('consistency_result', sa.JSON(), nullable=True),
        sa.Column('confidence', sa.Float(), server_default='91.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )

def downgrade() -> None:
    op.drop_table('audit_records')
    op.drop_table('model_versions')
    op.drop_table('analysis_jobs')
    op.drop_table('annotations')
    op.drop_table('explanations')
    op.drop_table('alerts')
    op.drop_table('modality_statuses')
    op.drop_table('uncertainty')
    op.drop_table('forecasts')
    op.drop_table('storm_states')
    op.drop_table('observations')
    op.drop_table('storms')
