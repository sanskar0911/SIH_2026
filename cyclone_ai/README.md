# SIH 2026 Cyclone Intelligence – AI/ML Prototype

> **PROTOTYPE NOTICE**: This model is trained on **synthetic data** generated to mimic the structure of real tropical cyclone datasets (IBTrACS, TCIR, MOSDAC). It is **not** a certified meteorological forecasting system and must **not** be used for operational cyclone warnings.

---

## What This Does

Predicts the **probability of rapid intensification (RI)** of a tropical cyclone given current and recent environmental + intensity parameters, using an **XGBoost classifier**.

Output:
```json
{
  "risk_probability": 0.87,
  "prediction": 1,
  "risk_category": "HIGH",
  "top_risk_factors": ["vertical_wind_shear", "sst", "pressure_change", "cloud_top_temp", "ocean_heat_content"],
  "disclaimer": "PROTOTYPE prediction – synthetic training data – not for operational meteorological use"
}
```

Risk thresholds (prototype):

| Probability | Category |
|-------------|----------|
| 0.00 – 0.33 | LOW      |
| 0.34 – 0.66 | MODERATE |
| 0.67 – 1.00 | HIGH     |

---

## Project Structure

```
cyclone_ai/
├── data/
│   ├── generate_dataset.py         # Synthetic dataset generator
│   └── synthetic_cyclone_dataset.csv  # Generated after training
├── models/
│   ├── cyclone_xgboost_model.json  # XGBoost native format
│   ├── cyclone_xgboost_model.joblib
│   ├── feature_schema.json
│   ├── model_config.json           # Best params + metrics
│   └── demo_inputs.json            # 3 demo scenarios
├── training/
│   └── train_pipeline.py           # Full training run (all steps)
├── inference/
│   └── predict.py                  # CyclonePredictor class + CLI
├── api/
│   └── app.py                      # FastAPI REST endpoint
├── evaluation/
│   └── evaluate.py                 # SHAP analysis
├── outputs/
│   ├── metrics.json
│   ├── feature_importance.csv
│   └── plots/
│       ├── class_distribution.png
│       ├── baseline_cv_auc.png
│       ├── roc_curve.png
│       ├── confusion_matrix.png
│       ├── feature_importance.png
│       ├── cv_comparison.png
│       └── shap_summary.png        # If SHAP installed
└── requirements.txt
```

---

## Quick Start

### 1. Install dependencies

```bash
cd cyclone_ai
pip install -r requirements.txt
```

### 2. Train the model (generates dataset + all artefacts)

```bash
# From the repo root (SIH-Model-Training-Ishaan-Task/)
python -m cyclone_ai.training.train_pipeline
```

Or from the `cyclone_ai/` directory:

```bash
python training/train_pipeline.py
```

Training takes **< 5 minutes** on any modern CPU.

### 3. Run inference (CLI smoke test)

```bash
python cyclone_ai/inference/predict.py
```

### 4. Start the REST API

```bash
uvicorn cyclone_ai.api.app:app --reload --port 8000
```

Then send a POST to `http://localhost:8000/predict`:

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 18.0,
    "longitude": 90.0,
    "wind_speed": 110.0,
    "min_central_pressure": 955.0,
    "sst": 31.0,
    "relative_humidity": 92.0,
    "vertical_wind_shear": 5.0
  }'
```

### 5. (Optional) SHAP analysis

```bash
python cyclone_ai/evaluation/evaluate.py
```

---

## Input Feature Schema

| Feature | Unit | Description |
|---|---|---|
| `latitude` | °N | Storm centre latitude |
| `longitude` | °E | Storm centre longitude |
| `cyclone_age_hours` | hours | Hours since genesis |
| `wind_speed` | kt | Current max sustained wind |
| `min_central_pressure` | hPa | Current minimum central pressure |
| `prev_wind_speed` | kt | Wind 6h ago |
| `prev_pressure` | hPa | Pressure 6h ago |
| `wind_speed_change` | kt | Wind change over 6h |
| `pressure_change` | hPa | Pressure change over 6h (negative = falling) |
| `sst` | °C | Sea surface temperature |
| `relative_humidity` | % | Mid-level relative humidity |
| `vertical_wind_shear` | kt | Deep-layer vertical wind shear |
| `atmospheric_temp_200hPa` | °C | Upper-tropospheric temperature |
| `cloud_top_temp` | °C | Cloud-top temperature (IR proxy) |
| `water_vapour` | mm | Precipitable water proxy |
| `precipitation` | mm/hr | Rainfall proxy |
| `ocean_heat_content` | kJ/cm² | Ocean heat content proxy |
| `movement_speed` | kt | Storm translation speed |
| `movement_direction` | ° | Storm heading |
| `season_sin` | – | sin(2π × day_of_year / 365.25) |
| `season_cos` | – | cos(2π × day_of_year / 365.25) |
| `diurnal_sin` | – | sin(2π × hour / 24) |
| `diurnal_cos` | – | cos(2π × hour / 24) |

All features are **numerical**. Missing values are filled with neutral defaults by the predictor.

---

## Integration (for the frontend developer)

1. Start the API: `uvicorn cyclone_ai.api.app:app --port 8000`
2. POST any subset of features to `/predict` (defaults fill gaps)
3. Parse the JSON response
4. Use `risk_category` for colour coding: `LOW` → green, `MODERATE` → amber, `HIGH` → red

Or use the Python class directly:
```python
from cyclone_ai.inference.predict import CyclonePredictor
p = CyclonePredictor()
result = p.predict({"sst": 31.0, "vertical_wind_shear": 5.0, "wind_speed": 110.0})
```

---

## Training Pipeline Summary

| Step | Description |
|---|---|
| 1 | Generate 10,000-row synthetic dataset (seed=42) |
| 2 | Inspect shape, class balance, missing values |
| 3 | Stratified 80/20 train/test split |
| 4 | Baseline XGBoost (default params) |
| 5 | 5-fold StratifiedKFold CV on training set |
| 6 | GridSearchCV (ROC-AUC, StratifiedKFold-5) |
| 7 | Best model re-evaluated with CV |
| 8 | Single final evaluation on untouched test set |
| 9 | Overfitting/underfitting check |
| 10 | Export model (JSON + joblib) + all artefacts |
| 11 | Demo scenarios run through actual model |

---

## Model Loading (verification)

```python
import xgboost as xgb, pandas as pd, json

# Load schema
with open("cyclone_ai/models/feature_schema.json") as f:
    schema = json.load(f)

# Load model
model = xgb.XGBClassifier()
model.load_model("cyclone_ai/models/cyclone_xgboost_model.json")

# Predict
row = pd.DataFrame([{f: 0.0 for f in schema["feature_names"]}])
prob = model.predict_proba(row)[0, 1]
print(f"RI probability: {prob:.4f}")
```

---

## Real Data Integration (future)

When real IBTrACS / TCIR / MOSDAC data is available:

1. Extract the same 23 feature columns
2. Create the same `rapid_intensification` target (ΔV ≥ 30kt / 24h)
3. Run `train_pipeline.py` – **no structural changes needed**
4. Re-export the model
5. The inference API remains identical

The synthetic prototype is a drop-in placeholder designed for this transition.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/schema` | Feature schema + risk thresholds |
| POST | `/predict` | Single prediction |
| POST | `/predict/batch` | Batch predictions |

Interactive docs: `http://localhost:8000/docs`

---

*SIH 2026 Cyclone Intelligence Prototype – AI/ML Component*
