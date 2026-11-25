from __future__ import annotations

import os
from contextlib import asynccontextmanager
from functools import lru_cache
from typing import Any

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from .bundle import bundle_exists, build_bundle, load_bundle, probability_column


@lru_cache(maxsize=1)
def load_assets() -> dict[str, Any]:
    """Serve from the committed bundle; fall back to the full local data."""
    return load_bundle() if bundle_exists() else build_bundle()


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        load_assets()
    except Exception as exc:  # keep serving /api/health so the error is visible
        print(f"Asset load failed at startup: {exc}")
    yield


app = FastAPI(
    title="Flood Prediction India API",
    version="0.2.0",
    description="Station-level next-day danger-threshold exceedance research API.",
    lifespan=lifespan,
)

# Public, read-only API: allow any origin unless CORS_ORIGINS narrows it.
_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)


def json_safe(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(k): json_safe(v) for k, v in value.items()}
    if isinstance(value, list):
        return [json_safe(v) for v in value]
    if isinstance(value, (np.bool_,)):
        return bool(value)
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating, float)):
        return None if not np.isfinite(value) else float(value)
    if isinstance(value, pd.Timestamp):
        return value.isoformat()
    if value is None or (not isinstance(value, (str, bytes)) and pd.isna(value)):
        return None
    return value


def get_assets() -> dict[str, Any]:
    try:
        return load_assets()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


def require_model(model: str, frame: pd.DataFrame) -> str:
    col = probability_column(model)
    if col not in frame.columns:
        raise HTTPException(status_code=404, detail=f"Model unavailable: {model}")
    return col


def threshold_for(model: str, assets: dict[str, Any]) -> float:
    return float(assets["meta"]["thresholds"].get(model, 0.5))


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
    latest = assets["latest"]
    col = require_model(model, latest)
    threshold = threshold_for(model, assets)
    highest = latest.loc[latest[col].idxmax()]
    return json_safe({
        "model": model,
        "threshold": threshold,
        "station_count": len(latest),
        "alert_count": int((latest[col] >= threshold).sum()),
        "below_threshold_count": int((latest[col] < threshold).sum()),
        "mean_score": float(latest[col].mean()),
        "highest_probability": float(highest[col]),
        "highest_station_code": highest["station_code"],
        "highest_station_name": highest["station_name"],
        "latest_data_date": latest["date"].max(),
        "dataset_start": assets["meta"]["dataset_start"],
        "dataset_end": assets["meta"]["dataset_end"],
        "note": "Latest date in the dataset; not necessarily today's observations.",
    })


@app.get("/api/stations")
def stations(
    model: str = Query(default="Random Forest"),
    search: str = Query(default=""),
    limit: int = Query(default=1000, ge=1, le=5000),
):
    assets = get_assets()
    latest = assets["latest"]
    col = require_model(model, latest)

    if search.strip():
        q = search.strip().lower()
        mask = (
            latest["station_code"].astype(str).str.lower().str.contains(q, na=False, regex=False)
            | latest["station_name"].astype(str).str.lower().str.contains(q, na=False, regex=False)
        )
        latest = latest.loc[mask]

    fields = [
        "station_code", "station_name", "date", "lat", "lon",
        "lat_meta", "lon_meta", "danger_level", "warning_level",
        "danger_level_meta", "warning_level_meta", col,
    ]
    result = (
        latest.sort_values(col, ascending=False)
        .head(limit)[[c for c in fields if c in latest.columns]]
        .rename(columns={col: "probability"})
    )
    threshold = threshold_for(model, assets)
    result["threshold"] = threshold
    result["predicted_exceedance"] = result["probability"] >= threshold
    return json_safe(result.to_dict(orient="records"))


@app.get("/api/stations/{station_code}")
def station_detail(station_code: str, model: str = Query(default="Random Forest")):
    assets = get_assets()
    details = assets["details"]
    col = require_model(model, details)

    match = details[details["station_code"] == station_code]
    if match.empty:
        raise HTTPException(status_code=404, detail="Station not found or has no complete feature row.")
    row = match.iloc[0]
    probability = float(row[col])
    threshold = threshold_for(model, assets)

    history = assets["history"]
    history = history[history["station_code"] == station_code].drop(columns="station_code")
    history = history.astype(object).where(history.notna(), None)

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
    metrics = get_assets()["meta"].get("metrics") or []
    if not metrics:
        return {
            "available": False,
            "message": "Evaluation metrics not found. Expected reports/tables/final_test_evaluation.csv when building the bundle.",
            "models": [],
        }
    return json_safe({"available": True, "models": metrics})
