"""
Full Training Pipeline: Baseline → Cross-Validation → GridSearchCV → Final Evaluation
========================================================================================
Steps:
  1. Generate synthetic dataset
  2. Split train/test (80/20 stratified)
  3. Baseline XGBoost + 5-fold StratifiedKFold CV
  4. GridSearchCV (ROC-AUC optimised)
  5. Final model evaluation on untouched test set
  6. Export model + preprocessing artefacts
  7. Visual outputs
"""

import json
import warnings
import os
import sys

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.model_selection import (
    StratifiedKFold,
    GridSearchCV,
    train_test_split,
)
from sklearn.metrics import (
    roc_auc_score,
    roc_curve,
    confusion_matrix,
    classification_report,
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    ConfusionMatrixDisplay,
)
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import xgboost as xgb

# Add parent so imports from data/ work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from data.generate_dataset import generate_dataset

warnings.filterwarnings("ignore")

SEED = 42
PLOT_DIR = "cyclone_ai/outputs/plots"
MODEL_DIR = "cyclone_ai/models"
OUTPUT_DIR = "cyclone_ai/outputs"
os.makedirs(PLOT_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -----------------------------------------------------------------------
# Feature columns (NO future/leakage variables)
# -----------------------------------------------------------------------
FEATURE_COLS = [
    "latitude", "longitude", "cyclone_age_hours",
    "wind_speed", "min_central_pressure",
    "prev_wind_speed", "prev_pressure",
    "wind_speed_change", "pressure_change",
    "sst", "relative_humidity", "vertical_wind_shear",
    "atmospheric_temp_200hPa", "cloud_top_temp",
    "water_vapour", "precipitation",
    "ocean_heat_content", "movement_speed", "movement_direction",
    "season_sin", "season_cos", "diurnal_sin", "diurnal_cos",
]
TARGET_COL = "rapid_intensification"


# =======================================================================
# STEP 1: Generate & Inspect Dataset
# =======================================================================
print("=" * 60)
print("STEP 1: Generating synthetic dataset ...")
df = generate_dataset(n_samples=10_000, seed=SEED)
print(f"Shape: {df.shape}")
print(f"Missing values: {df.isnull().sum().sum()}")
print(f"Duplicate rows: {df.duplicated().sum()}")
print(f"\nClass distribution:\n{df[TARGET_COL].value_counts()}")
print(f"Positive class rate: {df[TARGET_COL].mean():.2%}")
print(f"\nFeature stats:\n{df[FEATURE_COLS].describe().round(2)}")

# Save raw dataset
df.to_csv("cyclone_ai/data/synthetic_cyclone_dataset.csv", index=False)

# Class distribution plot
fig, ax = plt.subplots(figsize=(5, 4))
counts = df[TARGET_COL].value_counts().sort_index()
ax.bar(["No RI (0)", "Rapid Intensification (1)"], counts.values,
       color=["#4C72B0", "#DD8452"])
ax.set_title("Class Distribution")
ax.set_ylabel("Count")
for i, v in enumerate(counts.values):
    ax.text(i, v + 50, str(v), ha="center", fontweight="bold")
plt.tight_layout()
plt.savefig(f"{PLOT_DIR}/class_distribution.png", dpi=120)
plt.close()
print(f"\n[Plot saved] class_distribution.png")


# =======================================================================
# STEP 2: Train / Test Split
# =======================================================================
print("\n" + "=" * 60)
print("STEP 2: Splitting train/test (80/20 stratified) ...")
X = df[FEATURE_COLS]
y = df[TARGET_COL]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=SEED, stratify=y
)
print(f"Train: {X_train.shape}  |  Test: {X_test.shape}")
print(f"Train positive rate: {y_train.mean():.2%}  |  Test positive rate: {y_test.mean():.2%}")


# =======================================================================
# STEP 3: Baseline XGBoost + 5-Fold CV
# =======================================================================
print("\n" + "=" * 60)
print("STEP 3 & 4: Baseline XGBoost + 5-Fold Stratified CV ...")

scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()

baseline_model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    scale_pos_weight=scale_pos_weight,
    random_state=SEED,
    eval_metric="logloss",
)

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)

cv_auc_scores = []
cv_acc_scores = []
cv_f1_scores  = []

for fold, (tr_idx, val_idx) in enumerate(skf.split(X_train, y_train), 1):
    X_tr, X_val = X_train.iloc[tr_idx], X_train.iloc[val_idx]
    y_tr, y_val = y_train.iloc[tr_idx], y_train.iloc[val_idx]
    baseline_model.fit(X_tr, y_tr)
    prob = baseline_model.predict_proba(X_val)[:, 1]
    auc = roc_auc_score(y_val, prob)
    pred = (prob >= 0.5).astype(int)
    acc  = accuracy_score(y_val, pred)
    f1   = f1_score(y_val, pred)
    cv_auc_scores.append(auc)
    cv_acc_scores.append(acc)
    cv_f1_scores.append(f1)
    print(f"  Fold {fold}: ROC-AUC={auc:.4f}  Acc={acc:.4f}  F1={f1:.4f}")

cv_mean_auc = np.mean(cv_auc_scores)
cv_std_auc  = np.std(cv_auc_scores)
print(f"\nBaseline CV  ROC-AUC: {cv_mean_auc:.4f} ± {cv_std_auc:.4f}")

# Training performance (full train set)
baseline_model.fit(X_train, y_train)
train_prob = baseline_model.predict_proba(X_train)[:, 1]
train_auc  = roc_auc_score(y_train, train_prob)
print(f"Baseline Train ROC-AUC: {train_auc:.4f}")

# CV AUC bar chart
fig, ax = plt.subplots(figsize=(7, 4))
folds = [f"Fold {i}" for i in range(1, 6)]
ax.bar(folds, cv_auc_scores, color="#4C72B0", alpha=0.8, label="Fold AUC")
ax.axhline(cv_mean_auc, color="red", linestyle="--", label=f"Mean={cv_mean_auc:.4f}")
ax.set_ylim(0.7, 1.0)
ax.set_title("Baseline 5-Fold CV ROC-AUC")
ax.set_ylabel("ROC-AUC")
ax.legend()
plt.tight_layout()
plt.savefig(f"{PLOT_DIR}/baseline_cv_auc.png", dpi=120)
plt.close()
print("[Plot saved] baseline_cv_auc.png")


# =======================================================================
# STEP 5-6: GridSearchCV (ROC-AUC optimised)
# =======================================================================
print("\n" + "=" * 60)
print("STEP 5-6: GridSearchCV hyperparameter tuning ...")

param_grid = {
    "n_estimators":     [100, 200],
    "max_depth":        [3, 5, 7],
    "learning_rate":    [0.03, 0.05, 0.1],
    "subsample":        [0.8, 1.0],
    "colsample_bytree": [0.8, 1.0],
}

base_xgb = xgb.XGBClassifier(
    scale_pos_weight=scale_pos_weight,
    random_state=SEED,
    eval_metric="logloss",
)

grid_cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)

gs = GridSearchCV(
    estimator=base_xgb,
    param_grid=param_grid,
    scoring="roc_auc",
    cv=grid_cv,
    n_jobs=-1,
    verbose=1,
    refit=True,
)
gs.fit(X_train, y_train)

print(f"\nBest params: {gs.best_params_}")
print(f"Best CV ROC-AUC (GridSearch): {gs.best_score_:.4f}")


# =======================================================================
# STEP 7: Evaluate Best Model
# =======================================================================
print("\n" + "=" * 60)
print("STEP 7: Final evaluation on untouched test set ...")

best_model = gs.best_estimator_

# Cross-validate tuned model on training set for honest comparison
tuned_cv_scores = []
for _, (tr_idx, val_idx) in enumerate(skf.split(X_train, y_train)):
    X_tr, X_val = X_train.iloc[tr_idx], X_train.iloc[val_idx]
    y_tr, y_val = y_train.iloc[tr_idx], y_train.iloc[val_idx]
    best_model.fit(X_tr, y_tr)
    prob = best_model.predict_proba(X_val)[:, 1]
    tuned_cv_scores.append(roc_auc_score(y_val, prob))

tuned_cv_mean = np.mean(tuned_cv_scores)
tuned_cv_std  = np.std(tuned_cv_scores)

# Refit on full training data
best_model.fit(X_train, y_train)

# Train metrics
train_prob_tuned = best_model.predict_proba(X_train)[:, 1]
train_auc_tuned  = roc_auc_score(y_train, train_prob_tuned)

# Test metrics (UNTOUCHED – evaluated exactly once)
test_prob  = best_model.predict_proba(X_test)[:, 1]
test_pred  = (test_prob >= 0.5).astype(int)
test_auc   = roc_auc_score(y_test, test_prob)
test_acc   = accuracy_score(y_test, test_pred)
test_prec  = precision_score(y_test, test_pred)
test_rec   = recall_score(y_test, test_pred)
test_f1    = f1_score(y_test, test_pred)

print("\n--- COMPARISON ---")
print(f"Baseline XGBoost:")
print(f"  Train ROC-AUC : {train_auc:.4f}")
print(f"  CV ROC-AUC    : {cv_mean_auc:.4f} ± {cv_std_auc:.4f}")
print(f"\nTuned XGBoost:")
print(f"  Train ROC-AUC : {train_auc_tuned:.4f}")
print(f"  CV ROC-AUC    : {tuned_cv_mean:.4f} ± {tuned_cv_std:.4f}")
print(f"  Test ROC-AUC  : {test_auc:.4f}")
print(f"  Test Accuracy : {test_acc:.4f}")
print(f"  Test Precision: {test_prec:.4f}")
print(f"  Test Recall   : {test_rec:.4f}")
print(f"  Test F1       : {test_f1:.4f}")
print(f"\nClassification Report:\n{classification_report(y_test, test_pred)}")

# Overfitting check
gap = train_auc_tuned - test_auc
if gap > 0.10:
    flag = "[WARN] POTENTIAL OVERFITTING (train-test AUC gap > 0.10)"
elif train_auc_tuned < 0.70:
    flag = "[WARN] POTENTIAL UNDERFITTING (train AUC < 0.70)"
else:
    flag = "[OK] Model appears to generalise well"
print(f"\nGeneralisation check: {flag}")


# =======================================================================
# STEP 8: Visual Outputs
# =======================================================================

# ROC Curve
fpr, tpr, _ = roc_curve(y_test, test_prob)
fig, ax = plt.subplots(figsize=(6, 5))
ax.plot(fpr, tpr, color="#4C72B0", lw=2, label=f"Tuned XGB (AUC={test_auc:.4f})")
ax.plot([0, 1], [0, 1], "k--", lw=1)
ax.set_xlabel("False Positive Rate")
ax.set_ylabel("True Positive Rate")
ax.set_title("ROC Curve – Test Set")
ax.legend(loc="lower right")
plt.tight_layout()
plt.savefig(f"{PLOT_DIR}/roc_curve.png", dpi=120)
plt.close()
print("\n[Plot saved] roc_curve.png")

# Confusion Matrix
cm = confusion_matrix(y_test, test_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm,
                               display_labels=["No RI", "RI"])
fig, ax = plt.subplots(figsize=(5, 4))
disp.plot(ax=ax, colorbar=False, cmap="Blues")
ax.set_title("Confusion Matrix – Test Set")
plt.tight_layout()
plt.savefig(f"{PLOT_DIR}/confusion_matrix.png", dpi=120)
plt.close()
print("[Plot saved] confusion_matrix.png")

# Feature Importance
importances = best_model.feature_importances_
fi_df = pd.DataFrame({"feature": FEATURE_COLS, "importance": importances})
fi_df = fi_df.sort_values("importance", ascending=False)

fig, ax = plt.subplots(figsize=(8, 7))
ax.barh(fi_df["feature"][::-1], fi_df["importance"][::-1], color="#4C72B0")
ax.set_title("Feature Importance (XGBoost gain)")
ax.set_xlabel("Importance")
plt.tight_layout()
plt.savefig(f"{PLOT_DIR}/feature_importance.png", dpi=120)
plt.close()
print("[Plot saved] feature_importance.png")

fi_df.to_csv(f"{OUTPUT_DIR}/feature_importance.csv", index=False)
print("[CSV saved] feature_importance.csv")

# CV comparison baseline vs tuned
fig, ax = plt.subplots(figsize=(7, 4))
x = np.arange(5)
width = 0.35
ax.bar(x - width/2, cv_auc_scores,   width, label="Baseline", color="#4C72B0", alpha=0.8)
ax.bar(x + width/2, tuned_cv_scores, width, label="Tuned",    color="#DD8452", alpha=0.8)
ax.axhline(cv_mean_auc,  color="#4C72B0", linestyle="--", lw=1)
ax.axhline(tuned_cv_mean, color="#DD8452", linestyle="--", lw=1)
ax.set_xticks(x)
ax.set_xticklabels([f"Fold {i}" for i in range(1, 6)])
ax.set_ylim(0.7, 1.0)
ax.set_title("CV ROC-AUC: Baseline vs Tuned")
ax.set_ylabel("ROC-AUC")
ax.legend()
plt.tight_layout()
plt.savefig(f"{PLOT_DIR}/cv_comparison.png", dpi=120)
plt.close()
print("[Plot saved] cv_comparison.png")


# =======================================================================
# STEP 9: Export Model & Artefacts
# =======================================================================
print("\n" + "=" * 60)
print("STEP 9: Exporting model and artefacts ...")

# Save XGBoost model in native JSON format
model_json_path = f"{MODEL_DIR}/cyclone_xgboost_model.json"
best_model.save_model(model_json_path)
print(f"[Saved] {model_json_path}")

# Also save via joblib for sklearn pipeline compatibility
joblib.dump(best_model, f"{MODEL_DIR}/cyclone_xgboost_model.joblib")
print(f"[Saved] {MODEL_DIR}/cyclone_xgboost_model.joblib")

# Feature schema
feature_schema = {
    "feature_names": FEATURE_COLS,
    "n_features": len(FEATURE_COLS),
    "target": TARGET_COL,
    "description": "Feature schema for cyclone RI XGBoost prototype model",
}
with open(f"{MODEL_DIR}/feature_schema.json", "w") as f:
    json.dump(feature_schema, f, indent=2)
print(f"[Saved] {MODEL_DIR}/feature_schema.json")

# Model config / metadata
model_config = {
    "model_type": "XGBClassifier",
    "library": "xgboost",
    "seed": SEED,
    "best_params": gs.best_params_,
    "scale_pos_weight": float(scale_pos_weight),
    "metrics": {
        "baseline_train_roc_auc": round(train_auc, 4),
        "baseline_cv_roc_auc_mean": round(cv_mean_auc, 4),
        "baseline_cv_roc_auc_std": round(cv_std_auc, 4),
        "tuned_train_roc_auc": round(train_auc_tuned, 4),
        "tuned_cv_roc_auc_mean": round(tuned_cv_mean, 4),
        "tuned_cv_roc_auc_std": round(tuned_cv_std, 4),
        "test_roc_auc": round(test_auc, 4),
        "test_accuracy": round(test_acc, 4),
        "test_precision": round(test_prec, 4),
        "test_recall": round(test_rec, 4),
        "test_f1": round(test_f1, 4),
    },
    "generalisation_check": flag,
    "risk_thresholds": {
        "LOW": [0.0, 0.33],
        "MODERATE": [0.34, 0.66],
        "HIGH": [0.67, 1.0],
    },
    "data_note": (
        "PROTOTYPE: Trained on SYNTHETIC data. "
        "Not a real meteorological forecasting system."
    ),
}
with open(f"{MODEL_DIR}/model_config.json", "w") as f:
    json.dump(model_config, f, indent=2)
print(f"[Saved] {MODEL_DIR}/model_config.json")

# Save metrics to outputs/
with open(f"{OUTPUT_DIR}/metrics.json", "w") as f:
    json.dump(model_config["metrics"], f, indent=2)
print(f"[Saved] {OUTPUT_DIR}/metrics.json")


# =======================================================================
# STEP 10: Demo Scenarios
# =======================================================================
print("\n" + "=" * 60)
print("STEP 10: Creating demo scenarios ...")

demo_inputs = {
    "low_risk": {
        "description": "Weak tropical depression, hostile environment",
        "latitude": 12.0, "longitude": 88.0, "cyclone_age_hours": 18.0,
        "wind_speed": 35.0, "min_central_pressure": 998.0,
        "prev_wind_speed": 33.0, "prev_pressure": 999.0,
        "wind_speed_change": 2.0, "pressure_change": -1.0,
        "sst": 26.5, "relative_humidity": 58.0, "vertical_wind_shear": 28.0,
        "atmospheric_temp_200hPa": -48.0, "cloud_top_temp": -20.0,
        "water_vapour": 38.0, "precipitation": 2.5,
        "ocean_heat_content": 8.0, "movement_speed": 15.0,
        "movement_direction": 315.0,
        "season_sin": 0.5, "season_cos": 0.866,
        "diurnal_sin": 0.0, "diurnal_cos": 1.0,
    },
    "moderate_risk": {
        "description": "Moderate cyclone, mixed conditions",
        "latitude": 15.5, "longitude": 92.0, "cyclone_age_hours": 60.0,
        "wind_speed": 70.0, "min_central_pressure": 978.0,
        "prev_wind_speed": 63.0, "prev_pressure": 982.0,
        "wind_speed_change": 7.0, "pressure_change": -4.0,
        "sst": 28.5, "relative_humidity": 75.0, "vertical_wind_shear": 14.0,
        "atmospheric_temp_200hPa": -55.0, "cloud_top_temp": -48.0,
        "water_vapour": 58.0, "precipitation": 12.0,
        "ocean_heat_content": 35.0, "movement_speed": 9.0,
        "movement_direction": 330.0,
        "season_sin": 0.866, "season_cos": 0.5,
        "diurnal_sin": 0.707, "diurnal_cos": 0.707,
    },
    "high_risk": {
        "description": "Intense cyclone, prime RI environment",
        "latitude": 18.0, "longitude": 90.0, "cyclone_age_hours": 96.0,
        "wind_speed": 110.0, "min_central_pressure": 955.0,
        "prev_wind_speed": 95.0, "prev_pressure": 968.0,
        "wind_speed_change": 15.0, "pressure_change": -13.0,
        "sst": 31.0, "relative_humidity": 92.0, "vertical_wind_shear": 5.0,
        "atmospheric_temp_200hPa": -62.0, "cloud_top_temp": -74.0,
        "water_vapour": 72.0, "precipitation": 38.0,
        "ocean_heat_content": 75.0, "movement_speed": 7.0,
        "movement_direction": 340.0,
        "season_sin": 1.0, "season_cos": 0.0,
        "diurnal_sin": 1.0, "diurnal_cos": 0.0,
    },
}

with open(f"{MODEL_DIR}/demo_inputs.json", "w") as f:
    json.dump(demo_inputs, f, indent=2)
print(f"[Saved] {MODEL_DIR}/demo_inputs.json")

# Run demo inputs through the ACTUAL model
def classify_risk(prob: float) -> str:
    if prob <= 0.33:
        return "LOW"
    elif prob <= 0.66:
        return "MODERATE"
    return "HIGH"

print("\nDemo scenario predictions (actual model):")
for scenario_name, scenario_data in demo_inputs.items():
    row = {k: v for k, v in scenario_data.items() if k in FEATURE_COLS}
    df_row = pd.DataFrame([row])[FEATURE_COLS]
    prob = float(best_model.predict_proba(df_row)[0, 1])
    pred = int(prob >= 0.5)
    risk = classify_risk(prob)
    print(f"  {scenario_name:15s}: prob={prob:.4f}  pred={pred}  risk={risk}")

print("\n" + "=" * 60)
print("TRAINING PIPELINE COMPLETE.")
print(f"All outputs saved in cyclone_ai/models/ and cyclone_ai/outputs/")
