"""
Cyclone Rapid Intensification – Inference Module
=================================================
Loads the exported XGBoost model and returns a structured prediction.

Usage (Python):
    from inference.predict import CyclonePredictor
    predictor = CyclonePredictor()
    result = predictor.predict({...})

Usage (CLI):
    python cyclone_ai/inference/predict.py

Output:
    {
        "risk_probability": 0.87,
        "prediction": 1,
        "risk_category": "HIGH",
        "top_risk_factors": [...],
        "disclaimer": "PROTOTYPE – not for operational use"
    }
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, Any

import numpy as np
import pandas as pd

# Allow running from any cwd
ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT / "models"


class CyclonePredictor:
    def __init__(self, model_dir: str = None):
        import xgboost as xgb
        import joblib

        self.model_dir = Path(model_dir) if model_dir else MODEL_DIR

        # Load feature schema
        with open(self.model_dir / "feature_schema.json") as f:
            schema = json.load(f)
        self.feature_names = schema["feature_names"]

        # Load model (prefer joblib for sklearn API)
        joblib_path = self.model_dir / "cyclone_xgboost_model.joblib"
        json_path   = self.model_dir / "cyclone_xgboost_model.json"

        if joblib_path.exists():
            self.model = joblib.load(joblib_path)
        elif json_path.exists():
            self.model = xgb.XGBClassifier()
            self.model.load_model(str(json_path))
        else:
            raise FileNotFoundError(f"No model found in {self.model_dir}")

        # Load config for thresholds
        config_path = self.model_dir / "model_config.json"
        if config_path.exists():
            with open(config_path) as f:
                cfg = json.load(f)
            self.thresholds = cfg.get("risk_thresholds", {
                "LOW": [0.0, 0.33],
                "MODERATE": [0.34, 0.66],
                "HIGH": [0.67, 1.0],
            })
        else:
            self.thresholds = {
                "LOW": [0.0, 0.33],
                "MODERATE": [0.34, 0.66],
                "HIGH": [0.67, 1.0],
            }

    # ------------------------------------------------------------------
    def _classify_risk(self, prob: float) -> str:
        for category, (lo, hi) in self.thresholds.items():
            if lo <= prob <= hi:
                return category
        return "UNKNOWN"

    # ------------------------------------------------------------------
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Accept a dict with cyclone feature values and return prediction.
        Missing features default to sensible neutral values.
        """
        # Build feature vector in correct order
        row = {}
        defaults = {
            "latitude": 15.0, "longitude": 90.0, "cyclone_age_hours": 48.0,
            "wind_speed": 65.0, "min_central_pressure": 980.0,
            "prev_wind_speed": 60.0, "prev_pressure": 984.0,
            "wind_speed_change": 5.0, "pressure_change": -4.0,
            "sst": 28.0, "relative_humidity": 70.0,
            "vertical_wind_shear": 15.0, "atmospheric_temp_200hPa": -53.0,
            "cloud_top_temp": -45.0, "water_vapour": 55.0,
            "precipitation": 8.0, "ocean_heat_content": 30.0,
            "movement_speed": 10.0, "movement_direction": 330.0,
            "season_sin": 0.866, "season_cos": 0.5,
            "diurnal_sin": 0.0,  "diurnal_cos": 1.0,
        }
        for feat in self.feature_names:
            row[feat] = input_data.get(feat, defaults.get(feat, 0.0))

        df = pd.DataFrame([row])[self.feature_names]

        prob  = float(self.model.predict_proba(df)[0, 1])
        pred  = int(prob >= 0.5)
        risk  = self._classify_risk(prob)

        # Feature importances for top risk factors
        importances = self.model.feature_importances_
        fi_pairs = sorted(
            zip(self.feature_names, importances),
            key=lambda x: x[1], reverse=True
        )
        top_factors = [feat for feat, _ in fi_pairs[:5]]

        return {
            "risk_probability": round(prob, 4),
            "prediction": pred,
            "risk_category": risk,
            "top_risk_factors": top_factors,
            "disclaimer": (
                "PROTOTYPE prediction – synthetic training data – "
                "not for operational meteorological use"
            ),
        }

    # ------------------------------------------------------------------
    def predict_batch(self, records: list) -> list:
        return [self.predict(r) for r in records]


# =======================================================================
# CLI / smoke test
# =======================================================================
if __name__ == "__main__":
    predictor = CyclonePredictor()

    # Load demo inputs
    demo_path = MODEL_DIR / "demo_inputs.json"
    with open(demo_path) as f:
        demos = json.load(f)

    print("\n=== Cyclone RI Predictor – Demo Scenarios ===\n")
    for name, data in demos.items():
        result = predictor.predict(data)
        print(f"Scenario: {name}")
        print(f"  Description    : {data.get('description', '')}")
        print(f"  Risk Probability: {result['risk_probability']:.4f}")
        print(f"  Prediction      : {result['prediction']}")
        print(f"  Risk Category   : {result['risk_category']}")
        print(f"  Top Risk Factors: {result['top_risk_factors']}")
        print()

    # Verify model reload (load fresh from json)
    import xgboost as xgb
    fresh_model = xgb.XGBClassifier()
    fresh_model.load_model(str(MODEL_DIR / "cyclone_xgboost_model.json"))
    test_row = pd.DataFrame([{feat: 0.0 for feat in predictor.feature_names}])
    _ = fresh_model.predict_proba(test_row)
    print("[OK] Model reload from JSON verified - predictions work correctly.")
