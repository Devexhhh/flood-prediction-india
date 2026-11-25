"""Precomputed serving bundle for the API.

The full pipeline needs ~300 MB of parquet data and model files that are
not in git and do not fit a small hosting instance. `build_bundle()` runs
the models once over the full data and keeps only what the API serves:

- latest.parquet   one row per station, with every model's probability
- details.parquet  each station's latest complete feature row + probabilities
- history.parquet  the last HISTORY_DAYS rows of history per station
- meta.json        dataset date range, thresholds, model metrics

Build it locally with:  python -m backend.build_bundle
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BUNDLE_DIR = PROJECT_ROOT / "backend" / "bundle"
DATASET_PATH = PROJECT_ROOT / "data" / "processed" / "ml_dataset.parquet"
STATIONS_PATH = PROJECT_ROOT / "data" / "raw" / "stations.parquet"
MODELS_DIR = PROJECT_ROOT / "models"
METRICS_PATH = PROJECT_ROOT / "reports" / "tables" / "final_test_evaluation.csv"

HISTORY_DAYS = 365

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

HISTORY_COLUMNS = [
    "date", "water_level", "rain_1d", "rain_3d", "rain_7d",
    "level_danger_ratio", "level_warning_ratio", "flood_next_day",
]

DETAIL_COLUMNS = [
    "station_code", "date", "danger_level", "warning_level", "water_level",
    "level_change_1d", "level_change_3d", "rain_7d", "lat", "lon",
]


def probability_column(model: str) -> str:
    return f"probability_{model}"


def _feature_importance(model: Any) -> list[dict[str, float]] | None:
    estimator = getattr(model, "named_steps", {}).get("model", model)
    importance = getattr(estimator, "feature_importances_", None)
    if importance is None and hasattr(estimator, "coef_"):
        importance = np.abs(np.asarray(estimator.coef_)).ravel()
    if importance is None:
        return None
    ranked = sorted(zip(FEATURES, importance), key=lambda item: item[1], reverse=True)
    return [{"feature": f, "importance": float(s)} for f, s in ranked][:10]


def _metrics(models: dict[str, Any]) -> list[dict[str, Any]]:
    if not METRICS_PATH.is_file():
        return []
    rows = []
    for metric in pd.read_csv(METRICS_PATH).to_dict(orient="records"):
        model = models.get(metric["Model"])
        if model is not None:
            importance = _feature_importance(model)
            if importance:
                metric["feature_importance"] = importance
        tn, fp = metric.get("True_Negatives"), metric.get("False_Positives")
        fn, tp = metric.get("False_Negatives"), metric.get("True_Positives")
        if all(pd.notna(v) for v in [tn, fp, fn, tp]):
            metric["confusion_matrix"] = {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)}
        rows.append({k: (None if isinstance(v, float) and not np.isfinite(v) else v) for k, v in metric.items()})
    return rows


def build_bundle() -> dict[str, Any]:
    """Compute the serving bundle from the full dataset and trained models."""
    import joblib  # only needed when building

    missing = [str(p) for p in [DATASET_PATH, MODELS_DIR] if not p.exists()]
    if missing:
        raise RuntimeError("Required project assets missing: " + ", ".join(missing))

    df = pd.read_parquet(DATASET_PATH)
    required = {"station_code", "date", "flood_next_day", *FEATURES}
    missing_columns = required - set(df.columns)
    if missing_columns:
        raise RuntimeError("Processed dataset is missing columns: " + ", ".join(sorted(missing_columns)))

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["station_code", "date"]).sort_values(["station_code", "date"])
    df["station_code"] = df["station_code"].astype(str)

    models = {
        name: joblib.load(MODELS_DIR / filename)
        for name, filename in MODEL_FILES.items()
        if (MODELS_DIR / filename).is_file()
    }
    if not models:
        raise RuntimeError(f"No model files found in {MODELS_DIR}")

    station_meta = pd.DataFrame()
    if STATIONS_PATH.is_file():
        station_meta = pd.read_parquet(STATIONS_PATH)
        if "station_code" in station_meta:
            station_meta["station_code"] = station_meta["station_code"].astype(str)
            station_meta = station_meta.drop_duplicates("station_code").rename(
                columns={c: f"{c}_meta" for c in ["lat", "lon", "danger_level", "warning_level"] if c in station_meta.columns}
            )

    # Latest row per station (as the original API did), scored by every model.
    latest = df.groupby("station_code", sort=False, as_index=False).tail(1).copy()
    latest = latest.dropna(subset=FEATURES)
    for name, model in models.items():
        latest[probability_column(name)] = model.predict_proba(latest[FEATURES])[:, 1]
    if not station_meta.empty:
        keep = ["station_code", "name", "lat_meta", "lon_meta", "danger_level_meta", "warning_level_meta"]
        latest = latest.merge(station_meta[[c for c in keep if c in station_meta.columns]], on="station_code", how="left")
    latest["station_name"] = (
        latest["name"].fillna(latest["station_code"]) if "name" in latest.columns else latest["station_code"]
    )
    latest_cols = [
        "station_code", "station_name", "date", "lat", "lon", "lat_meta", "lon_meta",
        "danger_level", "warning_level", "danger_level_meta", "warning_level_meta",
        *[probability_column(n) for n in models],
    ]
    latest = latest[[c for c in latest_cols if c in latest.columns]].reset_index(drop=True)

    # Latest complete row per station for the detail endpoint.
    complete = df.dropna(subset=FEATURES)
    details = complete.groupby("station_code", sort=False, as_index=False).tail(1).copy()
    for name, model in models.items():
        details[probability_column(name)] = model.predict_proba(details[FEATURES])[:, 1]
    details = details[DETAIL_COLUMNS + [probability_column(n) for n in models]].reset_index(drop=True)

    history = (
        df.groupby("station_code", sort=False)
        .tail(HISTORY_DAYS)[["station_code", *[c for c in HISTORY_COLUMNS if c in df.columns]]]
        .reset_index(drop=True)
    )
    for col in history.columns:
        if col not in ("station_code", "date") and history[col].dtype == "float64":
            history[col] = history[col].astype("float32")

    meta = {
        "dataset_start": df["date"].min().isoformat(),
        "dataset_end": df["date"].max().isoformat(),
        "models": list(models),
        "thresholds": THRESHOLDS,
        "metrics": _metrics(models),
    }
    return {"latest": latest, "details": details, "history": history, "meta": meta}


def save_bundle(bundle: dict[str, Any], directory: Path = BUNDLE_DIR) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    for name in ("latest", "details", "history"):
        bundle[name].to_parquet(directory / f"{name}.parquet", index=False, compression="zstd")
    (directory / "meta.json").write_text(json.dumps(bundle["meta"], indent=2), encoding="utf-8")


def bundle_exists(directory: Path = BUNDLE_DIR) -> bool:
    return all((directory / f).is_file() for f in ("latest.parquet", "details.parquet", "history.parquet", "meta.json"))


def load_bundle(directory: Path = BUNDLE_DIR) -> dict[str, Any]:
    bundle: dict[str, Any] = {
        name: pd.read_parquet(directory / f"{name}.parquet") for name in ("latest", "details", "history")
    }
    bundle["meta"] = json.loads((directory / "meta.json").read_text(encoding="utf-8"))
    return bundle
