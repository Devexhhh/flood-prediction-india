from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# backend/app/main.py -> project root is two parents above this file.
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = PROJECT_ROOT / "data" / "processed" / "ml_dataset.parquet"
STATIONS_PATH = PROJECT_ROOT / "data" / "raw" / "stations.parquet"
MODELS_DIR = PROJECT_ROOT / "models"
METRICS_PATH = PROJECT_ROOT / "reports" / "tables" / "final_test_evaluation.csv"

FEATURES = [
    "water_level", "water_level_lag_1", "water_level_lag_2",
    "water_level_lag_3", "level_change_1d", "level_change_3d",
    "rain_1d", "rain_3d", "rain_7d", "level_danger_ratio",
    "level_warning_ratio", "rise_danger_ratio_1d",
    "rise_danger_ratio_3d", "danger_level", "warning_level", "lat", "lon",
]

MODEL_FILES = {
    "Random Forest": "random_forest.joblib",
    "XGBoost": "xgboost.joblib",
    "Logistic Regression": "logistic_regression.joblib",
}
THRESHOLDS = {
    "Random Forest": 0.904376,
    "XGBoost": 0.955972,
    "Logistic Regression": 0.739413,
}

app = FastAPI(
    title="Flood Prediction India API",
    version="0.1.0",
    description="Station-level next-day danger-threshold exceedance research API.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def json_safe(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(k): json_safe(v) for k, v in value.items()}
    if isinstance(value, list):
        return [json_safe(v) for v in value]
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return None if not np.isfinite(value) else float(value)
    if isinstance(value, (pd.Timestamp,)):
        return value.isoformat()
    if pd.isna(value):
        return None
    return value


@lru_cache(maxsize=1)
def load_assets() -> dict[str, Any]:
    missing = [str(p) for p in [DATASET_PATH] if not p.is_file()]
    if not MODELS_DIR.is_dir():
        missing.append(str(MODELS_DIR))
    if missing:
        raise RuntimeError(
            "Required project assets missing: " + ", ".join(missing)
        )

    df = pd.read_parquet(DATASET_PATH)
    required = {"station_code", "date", "flood_next_day", *FEATURES}
    missing_columns = required - set(df.columns)
    if missing_columns:
        raise RuntimeError(
            "Processed dataset is missing columns: "
            + ", ".join(sorted(missing_columns))
        )

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["station_code", "date"])
    df = df.sort_values(["station_code", "date"])

    station_meta = pd.DataFrame()
    if STATIONS_PATH.is_file():
        station_meta = pd.read_parquet(STATIONS_PATH)
        if "station_code" in station_meta:
            station_meta = station_meta.drop_duplicates("station_code")
            # Keep metadata fields separate from model features.
            rename = {
                c: f"{c}_meta"
                for c in ["lat", "lon", "danger_level", "warning_level"]
                if c in station_meta.columns
            }
            station_meta = station_meta.rename(columns=rename)

    models = {}
    for name, filename in MODEL_FILES.items():
        path = MODELS_DIR / filename
        if path.is_file():
            models[name] = joblib.load(path)

    if not models:
        raise RuntimeError(f"No model files found in {MODELS_DIR}")

    latest = df.groupby("station_code", sort=False, as_index=False).tail(1).copy()
    latest = latest.dropna(subset=FEATURES)
    for name, model in models.items():
        latest[f"probability_{name}"] = model.predict_proba(latest[FEATURES])[:, 1]

    if not station_meta.empty:
        latest = latest.merge(station_meta, on="station_code", how="left")

    if "name" in latest.columns:
        latest["station_name"] = latest["name"].fillna(latest["station_code"].astype(str))
    else:
        latest["station_name"] = latest["station_code"].astype(str)

    return {
        "data": df,
        "latest": latest,
        "stations": station_meta,
        "models": models,
    }


def get_assets() -> dict[str, Any]:
    try:
        return load_assets()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


def model_probability(row: pd.Series, model_name: str, assets: dict[str, Any]) -> float:
    if model_name not in assets["models"]:
        raise HTTPException(status_code=404, detail=f"Model unavailable: {model_name}")
    X = pd.DataFrame([{feature: row[feature] for feature in FEATURES}], columns=FEATURES)
    return float(assets["models"][model_name].predict_proba(X)[0, 1])


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "flood-prediction-india-api",
        "assets_loaded": load_assets.cache_info().currsize > 0,
    }


@app.get("/api/overview")
def overview(model: str = Query(default="Random Forest")):
    assets = get_assets()
    latest = assets["latest"].copy()
    probability_col = f"probability_{model}"
    if probability_col not in latest.columns:
        raise HTTPException(status_code=404, detail=f"Model unavailable: {model}")
    threshold = THRESHOLDS.get(model, 0.5)
    highest = latest.loc[latest[probability_col].idxmax()]
    return json_safe({
        "model": model,
        "threshold": threshold,
        "station_count": len(latest),
        "alert_count": int((latest[probability_col] >= threshold).sum()),
        "below_threshold_count": int((latest[probability_col] < threshold).sum()),
        "mean_score": float(latest[probability_col].mean()),
        "highest_probability": float(highest[probability_col]),
        "highest_station_code": highest["station_code"],
        "highest_station_name": highest["station_name"],
        "latest_data_date": latest["date"].max(),
        "dataset_start": assets["data"]["date"].min(),
        "dataset_end": assets["data"]["date"].max(),
        "note": "Latest date in local dataset; not necessarily today's observations.",
    })


@app.get("/api/stations")
def stations(
    model: str = Query(default="Random Forest"),
    search: str = Query(default=""),
    limit: int = Query(default=1000, ge=1, le=5000),
):
    assets = get_assets()
    latest = assets["latest"].copy()
    probability_col = f"probability_{model}"
    if probability_col not in latest.columns:
        raise HTTPException(status_code=404, detail=f"Model unavailable: {model}")

    if search.strip():
        q = search.strip().lower()
        mask = (
            latest["station_code"].astype(str).str.lower().str.contains(q, na=False)
            | latest["station_name"].astype(str).str.lower().str.contains(q, na=False)
        )
        latest = latest.loc[mask]

    fields = [
        "station_code", "station_name", "date", "lat", "lon",
        "lat_meta", "lon_meta", "danger_level", "warning_level",
        "danger_level_meta", "warning_level_meta", probability_col,
    ]
    fields = [c for c in fields if c in latest.columns]
    latest = latest.sort_values(probability_col, ascending=False).head(limit)
    result = latest[fields].rename(columns={probability_col: "probability"})
    result["threshold"] = THRESHOLDS.get(model, 0.5)
    result["predicted_exceedance"] = result["probability"] >= result["threshold"]
    return json_safe(result.to_dict(orient="records"))


@app.get("/api/stations/{station_code}")
def station_detail(station_code: str, model: str = Query(default="Random Forest")):
    assets = get_assets()
    df = assets["data"]
    station = df[df["station_code"].astype(str) == station_code].sort_values("date")
    if station.empty:
        raise HTTPException(status_code=404, detail="Station not found in processed dataset.")

    latest_row = station.dropna(subset=FEATURES).tail(1)
    if latest_row.empty:
        raise HTTPException(status_code=404, detail="Station has no latest row with all required features.")

    row = latest_row.iloc[0]
    probability = model_probability(row, model, assets)
    threshold = THRESHOLDS.get(model, 0.5)

    history_cols = [
        c for c in [
            "date", "water_level", "rain_1d", "rain_3d", "rain_7d",
            "level_danger_ratio", "level_warning_ratio", "flood_next_day",
        ] if c in station.columns
    ]
    history = station.tail(365)[history_cols].replace({np.nan: None})
    return json_safe({
        "station_code": station_code,
        "model": model,
        "probability": probability,
        "threshold": threshold,
        "predicted_exceedance": probability >= threshold,
        "latest_date": row["date"],
        "danger_level": row.get("danger_level"),
        "warning_level": row.get("warning_level"),
        "water_level": row.get("water_level"),
        "level_change_1d": row.get("level_change_1d"),
        "level_change_3d": row.get("level_change_3d"),
        "rain_7d": row.get("rain_7d"),
        "lat": row.get("lat"),
        "lon": row.get("lon"),
        "history": history.to_dict(orient="records"),
    })


@app.get("/api/model-metrics")
def model_metrics():
    if not METRICS_PATH.is_file():
        return {
            "available": False,
            "message": "Evaluation CSV not found. Expected reports/tables/final_test_evaluation.csv.",
            "models": [],
        }
    metrics = pd.read_csv(METRICS_PATH)
    assets = get_assets()
    models = []
    for metric in metrics.to_dict(orient="records"):
        model = assets["models"].get(metric["Model"])
        if model is not None:
            estimator = getattr(model, "named_steps", {}).get("model", model)
            importance = getattr(estimator, "feature_importances_", None)
            if importance is None and hasattr(estimator, "coef_"):
                importance = np.abs(np.asarray(estimator.coef_)).ravel()
            if importance is not None:
                metric["feature_importance"] = [
                    {"feature": feature, "importance": float(score)}
                    for feature, score in sorted(zip(FEATURES, importance), key=lambda item: item[1], reverse=True)
                ][:10]
        tn, fp = metric.get("True_Negatives"), metric.get("False_Positives")
        fn, tp = metric.get("False_Negatives"), metric.get("True_Positives")
        if all(pd.notna(value) for value in [tn, fp, fn, tp]):
            metric["confusion_matrix"] = {"tn": tn, "fp": fp, "fn": fn, "tp": tp}
        models.append(metric)
    return json_safe({"available": True, "models": models})
