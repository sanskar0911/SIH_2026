"""
SHAP-based interpretability + evaluation report generator
"""
import json
import os
import sys
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import joblib

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

MODEL_DIR  = ROOT / "models"
OUTPUT_DIR = ROOT / "outputs"
PLOT_DIR   = ROOT / "outputs" / "plots"


def run_shap_analysis():
    try:
        import shap
    except ImportError:
        print("[SKIP] SHAP not available; using built-in feature importance only.")
        return

    print("Running SHAP analysis ...")
    model = joblib.load(MODEL_DIR / "cyclone_xgboost_model.joblib")

    with open(MODEL_DIR / "feature_schema.json") as f:
        schema = json.load(f)
    feature_names = schema["feature_names"]

    # Use a sample of training data for SHAP background
    df = pd.read_csv(ROOT / "data" / "synthetic_cyclone_dataset.csv")
    X = df[feature_names].sample(500, random_state=42)

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)

    # Summary plot
    fig, ax = plt.subplots(figsize=(10, 7))
    shap.summary_plot(shap_values, X, feature_names=feature_names,
                      show=False, plot_size=None)
    plt.tight_layout()
    plt.savefig(str(PLOT_DIR / "shap_summary.png"), dpi=120, bbox_inches="tight")
    plt.close()
    print("[Plot saved] shap_summary.png")

    # Mean absolute SHAP as CSV
    mean_shap = np.abs(shap_values).mean(axis=0)
    shap_df = pd.DataFrame({"feature": feature_names, "mean_abs_shap": mean_shap})
    shap_df = shap_df.sort_values("mean_abs_shap", ascending=False)
    shap_df.to_csv(OUTPUT_DIR / "shap_importance.csv", index=False)
    print("[CSV saved] shap_importance.csv")
    print("\nTop 10 SHAP features:")
    print(shap_df.head(10).to_string(index=False))


if __name__ == "__main__":
    run_shap_analysis()
