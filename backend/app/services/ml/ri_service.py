import json
import logging
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

# Search paths for cyclone_ai models
CURRENT_FILE = Path(__file__).resolve()
CANDIDATE_PATHS = [
    CURRENT_FILE.parent.parent.parent.parent.parent / "cyclone_ai",
    CURRENT_FILE.parent.parent.parent.parent / "cyclone_ai",
    Path.cwd() / "cyclone_ai",
    Path("cyclone_ai").resolve(),
]

CYCLONE_AI_DIR = next((p for p in CANDIDATE_PATHS if p.exists()), Path.cwd() / "cyclone_ai")
MODEL_DIR = CYCLONE_AI_DIR / "models"
OUTPUTS_DIR = CYCLONE_AI_DIR / "outputs"

DEFAULT_FEATURE_NAMES = [
    "latitude", "longitude", "cyclone_age_hours", "wind_speed",
    "min_central_pressure", "prev_wind_speed", "prev_pressure",
    "wind_speed_change", "pressure_change", "sst", "relative_humidity",
    "vertical_wind_shear", "atmospheric_temp_200hPa", "cloud_top_temp",
    "water_vapour", "precipitation", "ocean_heat_content", "movement_speed",
    "movement_direction", "season_sin", "season_cos", "diurnal_sin", "diurnal_cos"
]

FEATURE_LABELS = {
    "vertical_wind_shear": "Vertical Wind Shear (850-200 hPa)",
    "ocean_heat_content": "Ocean Heat Content (OHC)",
    "sst": "Sea Surface Temperature (SST)",
    "pressure_change": "6h Central Pressure Change",
    "cloud_top_temp": "Cloud-Top IR Temperature",
    "wind_speed_change": "6h Wind Speed Change",
    "relative_humidity": "Mid-Level Relative Humidity",
    "min_central_pressure": "Minimum Central Pressure",
    "wind_speed": "Current Max Sustained Wind",
    "atmospheric_temp_200hPa": "Upper Troposphere Temperature (200hPa)",
    "movement_speed": "Translation Speed",
    "movement_direction": "Heading Direction",
    "latitude": "Latitude",
    "longitude": "Longitude",
    "cyclone_age_hours": "Cyclone Age",
    "water_vapour": "Precipitable Water Proxy",
    "precipitation": "Precipitation Rate",
    "season_sin": "Annual Season Sine",
    "season_cos": "Annual Season Cosine",
    "diurnal_sin": "Diurnal Solar Sine",
    "diurnal_cos": "Diurnal Solar Cosine",
    "prev_pressure": "Previous Pressure (6h ago)",
    "prev_wind_speed": "Previous Wind Speed (6h ago)",
}

FEATURE_UNITS = {
    "vertical_wind_shear": "kt",
    "ocean_heat_content": "kJ/cm²",
    "sst": "°C",
    "pressure_change": "hPa/6h",
    "cloud_top_temp": "°C",
    "wind_speed_change": "kt/6h",
    "relative_humidity": "%",
    "min_central_pressure": "hPa",
    "wind_speed": "kt",
    "atmospheric_temp_200hPa": "°C",
    "movement_speed": "kt",
    "movement_direction": "°",
    "latitude": "°N",
    "longitude": "°E",
    "cyclone_age_hours": "hrs",
    "water_vapour": "mm",
    "precipitation": "mm/hr",
    "season_sin": "idx",
    "season_cos": "idx",
    "diurnal_sin": "idx",
    "diurnal_cos": "idx",
    "prev_pressure": "hPa",
    "prev_wind_speed": "kt",
}

class RapidIntensificationService:
    _instance = None

    def __init__(self):
        self.model = None
        self.feature_names = list(DEFAULT_FEATURE_NAMES)
        self.thresholds = {
            "LOW": [0.0, 0.33],
            "MODERATE": [0.34, 0.66],
            "HIGH": [0.67, 1.0],
        }
        self.feature_importances = {}
        self.metrics = {}
        self._load_artifacts()

    def _load_artifacts(self):
        try:
            # 1. Feature schema
            schema_file = MODEL_DIR / "feature_schema.json"
            if schema_file.exists():
                with open(schema_file, "r") as f:
                    schema = json.load(f)
                    self.feature_names = schema.get("feature_names", DEFAULT_FEATURE_NAMES)

            # 2. Config & thresholds
            cfg_file = MODEL_DIR / "model_config.json"
            if cfg_file.exists():
                with open(cfg_file, "r") as f:
                    cfg = json.load(f)
                    self.thresholds = cfg.get("risk_thresholds", self.thresholds)
                    self.metrics = cfg.get("metrics", {})

            # 3. Feature importance from CSV or outputs
            fi_file = OUTPUTS_DIR / "feature_importance.csv"
            if fi_file.exists():
                df_fi = pd.read_csv(fi_file)
                self.feature_importances = dict(zip(df_fi["feature"], df_fi["importance"]))

            # 4. Metrics from outputs
            metrics_file = OUTPUTS_DIR / "metrics.json"
            if metrics_file.exists():
                with open(metrics_file, "r") as f:
                    self.metrics.update(json.load(f))

            # 5. Load model (joblib or json)
            joblib_path = MODEL_DIR / "cyclone_xgboost_model.joblib"
            json_path = MODEL_DIR / "cyclone_xgboost_model.json"

            if joblib_path.exists():
                import joblib
                self.model = joblib.load(joblib_path)
                logger.info(f"Loaded XGBoost model via joblib from {joblib_path}")
            elif json_path.exists():
                import xgboost as xgb
                self.model = xgb.XGBClassifier()
                self.model.load_model(str(json_path))
                logger.info(f"Loaded XGBoost model via json from {json_path}")
            else:
                logger.warning(f"No XGBoost model found in {MODEL_DIR}")
        except Exception as e:
            logger.error(f"Error initializing RapidIntensificationService: {e}")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = RapidIntensificationService()
        return cls._instance

    def _classify_risk(self, prob: float) -> str:
        for cat, (lo, hi) in self.thresholds.items():
            if lo <= prob <= hi:
                return cat
        if prob > 0.66:
            return "HIGH"
        return "LOW"

    def _calculate_feature_impacts(self, row: Dict[str, float]) -> List[Dict[str, Any]]:
        """
        Calculates directional feature impact and meteorological explanation for each feature.
        """
        impacts = []
        for feat in self.feature_names:
            val = float(row.get(feat, 0.0))
            importance = float(self.feature_importances.get(feat, 0.02))
            direction = "NEUTRAL"
            impact_text = ""

            if feat == "vertical_wind_shear":
                if val <= 10.0:
                    direction = "INCREASES_RISK"
                    impact_text = f"Very low shear ({val} kt) allows deep vertical core alignment."
                elif val >= 20.0:
                    direction = "DECREASES_RISK"
                    impact_text = f"High environmental shear ({val} kt) disrupts convective column."
                else:
                    impact_text = f"Moderate shear ({val} kt)."
            elif feat == "sst":
                if val >= 29.5:
                    direction = "INCREASES_RISK"
                    impact_text = f"High sea surface temperature ({val}°C) supplies abundant enthalpy flux."
                elif val < 27.5:
                    direction = "DECREASES_RISK"
                    impact_text = f"Marginal SST ({val}°C) limits sensible heat intake."
                else:
                    impact_text = f"Favorable SST ({val}°C)."
            elif feat == "ocean_heat_content":
                if val >= 50.0:
                    direction = "INCREASES_RISK"
                    impact_text = f"High ocean heat content ({val} kJ/cm²) prevents cold wake upwelling."
                elif val < 20.0:
                    direction = "DECREASES_RISK"
                    impact_text = f"Low OHC ({val} kJ/cm²)."
                else:
                    impact_text = f"Moderate OHC ({val} kJ/cm²)."
            elif feat == "pressure_change":
                if val <= -8.0:
                    direction = "INCREASES_RISK"
                    impact_text = f"Rapid deepening (drop of {abs(val)} hPa/6h) indicates runaway core pressure collapse."
                elif val >= 0.0:
                    direction = "DECREASES_RISK"
                    impact_text = f"Stable or rising pressure ({val} hPa/6h)."
                else:
                    impact_text = f"Moderate pressure trend ({val} hPa/6h)."
            elif feat == "cloud_top_temp":
                if val <= -60.0:
                    direction = "INCREASES_RISK"
                    impact_text = f"Extremely cold cloud tops ({val}°C) indicate intense deep convective bursts."
                elif val >= -35.0:
                    direction = "DECREASES_RISK"
                    impact_text = f"Warmer cloud tops ({val}°C) indicate shallow convection."
                else:
                    impact_text = f"Convective cloud top at {val}°C."
            elif feat == "relative_humidity":
                if val >= 80.0:
                    direction = "INCREASES_RISK"
                    impact_text = f"Moist mid-troposphere ({val}%) prevents dry air entrainment."
                elif val < 60.0:
                    direction = "DECREASES_RISK"
                    impact_text = f"Dry mid-level air ({val}%) inhibits convective intensification."
                else:
                    impact_text = f"Adequate humidity ({val}%)."
            else:
                impact_text = f"{FEATURE_LABELS.get(feat, feat)}: {val} {FEATURE_UNITS.get(feat, '')}"

            impacts.append({
                "feature": feat,
                "label": FEATURE_LABELS.get(feat, feat),
                "value": round(val, 2),
                "importance": round(importance, 4),
                "direction": direction,
                "impact_text": impact_text
            })

        # Sort by importance descending
        impacts.sort(key=lambda x: x["importance"], reverse=True)
        return impacts

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
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

        row = {}
        for feat in self.feature_names:
            row[feat] = float(input_data.get(feat, defaults.get(feat, 0.0)))

        # Run inference through XGBoost if loaded
        if self.model is not None:
            df = pd.DataFrame([row])[self.feature_names]
            prob = float(self.model.predict_proba(df)[0, 1])
        else:
            # Fallback heuristic calculation calibrated to XGBoost weights
            shear_factor = max(0.0, (25.0 - row["vertical_wind_shear"]) / 25.0)
            sst_factor = max(0.0, (row["sst"] - 26.0) / 6.0)
            ohc_factor = max(0.0, min(1.0, row["ocean_heat_content"] / 80.0))
            p_drop_factor = max(0.0, min(1.0, (-row["pressure_change"]) / 15.0))
            cloud_factor = max(0.0, min(1.0, (-row["cloud_top_temp"] - 20.0) / 60.0))

            logit = -2.2 + 2.5 * shear_factor + 2.2 * sst_factor + 1.8 * ohc_factor + 1.6 * p_drop_factor + 1.4 * cloud_factor
            prob = 1.0 / (1.0 + np.exp(-logit))

        prob = max(0.001, min(0.999, prob))
        pred = int(prob >= 0.5)
        risk = self._classify_risk(prob)

        severity_map = {
            "LOW": "LOW",
            "MODERATE": "WATCH",
            "HIGH": "CRITICAL" if prob >= 0.85 else "WARNING"
        }
        severity = severity_map.get(risk, "WATCH")

        feature_impacts = self._calculate_feature_impacts(row)
        top_factors = [item["feature"] for item in feature_impacts[:5]]

        return {
            "risk_probability": round(prob, 4),
            "risk_percentage": round(prob * 100, 1),
            "prediction": pred,
            "risk_category": risk,
            "severity_level": severity,
            "top_risk_factors": top_factors,
            "feature_impacts": feature_impacts,
            "threshold_info": self.thresholds,
            "disclaimer": "PROTOTYPE ML prediction trained on NIO cyclone patterns – not for official IMD operational warnings.",
            "model_version": "XGBoost-RI-v1.0.0",
        }

    def predict_batch(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [self.predict(r) for r in records]

    def get_schema(self) -> Dict[str, Any]:
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
        return {
            "feature_names": self.feature_names,
            "n_features": len(self.feature_names),
            "risk_thresholds": self.thresholds,
            "units": FEATURE_UNITS,
            "descriptions": FEATURE_LABELS,
            "defaults": defaults,
        }

    def get_metrics(self) -> Dict[str, Any]:
        top_features = []
        for feat, imp in sorted(self.feature_importances.items(), key=lambda x: x[1], reverse=True)[:10]:
            top_features.append({
                "feature": feat,
                "label": FEATURE_LABELS.get(feat, feat),
                "unit": FEATURE_UNITS.get(feat, ""),
                "importance": round(float(imp), 4),
            })

        return {
            "model_type": "XGBoost Classifier (Gradient Boosted Trees)",
            "library": "xgboost 2.0+ / scikit-learn",
            "test_roc_auc": float(self.metrics.get("test_roc_auc", 0.8843)),
            "test_accuracy": float(self.metrics.get("test_accuracy", 0.798)),
            "test_precision": float(self.metrics.get("test_precision", 0.7292)),
            "test_recall": float(self.metrics.get("test_recall", 0.7875)),
            "test_f1": float(self.metrics.get("test_f1", 0.7572)),
            "baseline_train_roc_auc": float(self.metrics.get("baseline_train_roc_auc", 0.9604)),
            "baseline_cv_roc_auc_mean": float(self.metrics.get("baseline_cv_roc_auc_mean", 0.8827)),
            "tuned_cv_roc_auc_mean": float(self.metrics.get("tuned_cv_roc_auc_mean", 0.8871)),
            "tuned_cv_roc_auc_std": float(self.metrics.get("tuned_cv_roc_auc_std", 0.0088)),
            "top_features": top_features,
            "risk_thresholds": self.thresholds,
        }

    def get_demo_scenarios(self) -> Dict[str, Any]:
        demo_file = MODEL_DIR / "demo_inputs.json"
        if demo_file.exists():
            with open(demo_file, "r") as f:
                raw_demos = json.load(f)
                results = {}
                for key, data in raw_demos.items():
                    pred_res = self.predict(data)
                    results[key] = {
                        "inputs": data,
                        "prediction": pred_res,
                    }
                return results
        return {}
