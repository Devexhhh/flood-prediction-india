from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import streamlit as st
import matplotlib.pyplot as plt

# ============================================================
# Flood Prediction India — Streamlit dashboard
# Place this file at: flood-prediction-india/src/app.py
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = PROJECT_ROOT / "data" / "processed" / "ml_dataset.parquet"
STATIONS_PATH = PROJECT_ROOT / "data" / "raw" / "stations.parquet"
MODELS_DIR = PROJECT_ROOT / "models"

MODEL_FEATURES = [
    "water_level",
    "water_level_lag_1",
    "water_level_lag_2",
    "water_level_lag_3",
    "level_change_1d",
    "level_change_3d",
    "rain_1d",
    "rain_3d",
    "rain_7d",
    "level_danger_ratio",
    "level_warning_ratio",
    "rise_danger_ratio_1d",
    "rise_danger_ratio_3d",
    "danger_level",
    "warning_level",
    "lat",
    "lon",
]

MODEL_FILES = {
    "Random Forest": "random_forest.joblib",
    "XGBoost": "xgboost.joblib",
    "Logistic Regression": "logistic_regression.joblib",
}

# Thresholds selected during the project's validation analysis.
LOCKED_THRESHOLDS = {
    "Random Forest": 0.904376,
    "XGBoost": 0.955972,
    "Logistic Regression": 0.739413,
}


st.set_page_config(
    page_title="Flood Prediction India",
    page_icon="🌊",
    layout="wide",
)

st.title("🌊 Flood Prediction India")
st.caption(
    "Station-level prediction of next-day mean water-level danger-threshold "
    "exceedance using historical CWC-derived observations."
)

st.info(
    "Research prototype: predictions apply to monitored stations in the "
    "processed dataset. They are not official flood warnings and do not "
    "predict inundation at arbitrary locations. The prediction date is based "
    "on the latest available row in the processed dataset, which may not be today."
)


@st.cache_data(show_spinner="Loading processed hydrological data...")
def load_dataset(path_string: str) -> pd.DataFrame:
    df = pd.read_parquet(path_string)

    required = {"station_code", "date", "flood_next_day", *MODEL_FEATURES}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(
            "The processed dataset is missing required columns: "
            + ", ".join(sorted(missing))
        )

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["station_code", "date"])
    return df


@st.cache_data(show_spinner="Loading station metadata...")
def load_stations(path_string: str) -> pd.DataFrame:
    path = Path(path_string)
    if not path.exists():
        return pd.DataFrame()

    stations = pd.read_parquet(path)
    return stations


@st.cache_resource(show_spinner="Loading trained models...")
def load_models(models_dir_string: str) -> dict:
    models_dir = Path(models_dir_string)
    loaded = {}
    for model_name, filename in MODEL_FILES.items():
        model_path = models_dir / filename
        if model_path.exists():
            loaded[model_name] = joblib.load(model_path)
    return loaded


def first_existing_column(df: pd.DataFrame, options: list[str]):
    for column in options:
        if column in df.columns:
            return column
    return None


def make_station_lookup(stations: pd.DataFrame) -> pd.DataFrame:
    if stations.empty or "station_code" not in stations.columns:
        return pd.DataFrame(columns=["station_code", "station_name"])

    lookup = stations.copy()
    name_col = first_existing_column(
        lookup, ["name", "station_name", "station", "nearest_town"]
    )
    if name_col is None:
        lookup["station_name"] = lookup["station_code"].astype(str)
    else:
        lookup["station_name"] = (
            lookup[name_col].fillna("").astype(str).str.strip()
        )
        lookup.loc[lookup["station_name"] == "", "station_name"] = (
            lookup.loc[lookup["station_name"] == "", "station_code"].astype(str)
        )

    keep = ["station_code", "station_name"]
    for column in ["lat", "lon", "danger_level", "warning_level", "nearest_town", "type"]:
        if column in lookup.columns and column not in keep:
            keep.append(column)

    lookup = lookup[keep].drop_duplicates("station_code")

    # Avoid overwriting model feature columns when station metadata is merged.
    rename_columns = {
        column: f"{column}_metadata"
        for column in ["lat", "lon", "danger_level", "warning_level"]
        if column in lookup.columns
    }
    return lookup.rename(columns=rename_columns)


# Validate project assets before loading.
missing_assets = []
if not DATASET_PATH.exists():
    missing_assets.append(str(DATASET_PATH))
if not MODELS_DIR.exists():
    missing_assets.append(str(MODELS_DIR))

if missing_assets:
    st.error("Required project assets were not found:")
    for asset in missing_assets:
        st.code(asset)
    st.stop()

try:
    data = load_dataset(str(DATASET_PATH))
    station_metadata = load_stations(str(STATIONS_PATH))
    models = load_models(str(MODELS_DIR))
except Exception as exc:
    st.exception(exc)
    st.stop()

if not models:
    st.error(f"No trained model files were found in {MODELS_DIR}")
    st.stop()

if data.empty:
    st.warning("The processed modeling dataset is empty.")
    st.stop()

lookup = make_station_lookup(station_metadata)

# Use the latest row available for each station; do not imply it is today's data.
data = data.sort_values(["station_code", "date"])
latest_rows = data.groupby("station_code", as_index=False).tail(1).copy()

if not lookup.empty:
    latest_rows = latest_rows.merge(lookup, on="station_code", how="left")
else:
    latest_rows["station_name"] = latest_rows["station_code"].astype(str)

latest_rows["station_name"] = (
    latest_rows["station_name"]
    .fillna(latest_rows["station_code"].astype(str))
    .astype(str)
)

# Keep only rows with all features needed by the trained model.
valid_feature_rows = latest_rows[MODEL_FEATURES].notna().all(axis=1)
latest_rows = latest_rows.loc[valid_feature_rows].copy()

if latest_rows.empty:
    st.error("No latest station rows have all required model features.")
    st.stop()

# Predict once per station for responsive filtering.
for model_name, model in models.items():
    try:
        latest_rows[f"prob_{model_name}"] = model.predict_proba(
            latest_rows[MODEL_FEATURES]
        )[:, 1]
    except Exception as exc:
        st.error(f"Prediction failed for {model_name}: {exc}")
        st.stop()

# Sidebar controls.
st.sidebar.header("Dashboard controls")
selected_model = st.sidebar.selectbox(
    "Prediction model",
    options=list(models.keys()),
    index=list(models.keys()).index("Random Forest")
    if "Random Forest" in models else 0,
)
threshold_default = LOCKED_THRESHOLDS.get(selected_model, 0.5)
decision_threshold = st.sidebar.slider(
    "Alert threshold",
    min_value=0.01,
    max_value=0.99,
    value=float(threshold_default),
    step=0.01,
    help=(
        "The default is the threshold selected during validation. Changing it "
        "changes the dashboard's displayed classification, not the model."
    ),
)

probability_col = f"prob_{selected_model}"
latest_rows["predicted_exceedance"] = (
    latest_rows[probability_col] >= decision_threshold
)

latest_date = data["date"].max()
station_codes = sorted(latest_rows["station_code"].astype(str).unique())
search_text = st.sidebar.text_input("Search station code or name", "")

filtered_stations = latest_rows.copy()
if search_text.strip():
    query = search_text.strip().lower()
    mask = (
        filtered_stations["station_code"].astype(str).str.lower().str.contains(query, na=False)
        | filtered_stations["station_name"].astype(str).str.lower().str.contains(query, na=False)
    )
    filtered_stations = filtered_stations.loc[mask]

if filtered_stations.empty:
    st.warning("No stations match that search.")
    st.stop()

# Summary metrics are based on latest available station rows.
total_stations = len(latest_rows)
predicted_count = int(latest_rows["predicted_exceedance"].sum())
mean_probability = float(latest_rows[probability_col].mean())

col1, col2, col3, col4 = st.columns(4)
col1.metric("Stations with usable latest data", f"{total_stations:,}")
col2.metric("Stations above selected threshold", f"{predicted_count:,}")
col3.metric("Mean predicted probability", f"{mean_probability:.2%}")
col4.metric("Latest data date", latest_date.strftime("%d %b %Y"))

st.caption(
    f"Selected model: {selected_model} · Threshold: {decision_threshold:.2f} · "
    f"Latest dataset date: {latest_date:%Y-%m-%d}"
)

# Station selection.
station_options = filtered_stations.sort_values(
    ["station_name", "station_code"]
).copy()
station_options["display_label"] = (
    station_options["station_name"].astype(str)
    + " ("
    + station_options["station_code"].astype(str)
    + ")"
)

selected_label = st.selectbox(
    "Select a monitoring station",
    options=station_options["display_label"].tolist(),
)
station_row = station_options.loc[
    station_options["display_label"] == selected_label
].iloc[0]
selected_code = station_row["station_code"]

probability = float(station_row[probability_col])
is_exceedance = probability >= decision_threshold

st.subheader("Selected station assessment")
left, right = st.columns([1, 2])

with left:
    st.metric("Predicted probability", f"{probability:.2%}")
    st.metric(
        "Dashboard classification",
        "Threshold exceedance predicted" if is_exceedance else "Threshold exceedance not predicted",
    )
    st.write(f"**Station code:** {selected_code}")
    st.write(f"**Latest available observation:** {station_row['date']:%Y-%m-%d}")

    if "nearest_town" in station_row.index and pd.notna(station_row.get("nearest_town")):
        st.write(f"**Nearest town:** {station_row['nearest_town']}")
    if "lat" in station_row.index and "lon" in station_row.index:
        if pd.notna(station_row.get("lat")) and pd.notna(station_row.get("lon")):
            st.write(f"**Coordinates:** {station_row['lat']}, {station_row['lon']}")

    danger_value = station_row.get("danger_level_metadata", station_row.get("danger_level"))
    warning_value = station_row.get("warning_level_metadata", station_row.get("warning_level"))
    if pd.notna(danger_value):
        st.write(f"**Danger level:** {danger_value}")
    if pd.notna(warning_value):
        st.write(f"**Warning level:** {warning_value}")

with right:
    station_history = data[data["station_code"].astype(str) == str(selected_code)].sort_values("date")
    history = station_history.tail(365)

    st.markdown("**Water-level history (up to the latest 365 available station-days)**")
    fig, ax = plt.subplots(figsize=(11, 4.5))
    ax.plot(history["date"], history["water_level"], label="Mean water level", linewidth=1.4)

    if "warning_level" in history.columns:
        warning_values = history["warning_level"].dropna()
        if not warning_values.empty:
            ax.axhline(float(warning_values.iloc[-1]), linestyle="--", label="Warning level")

    if "danger_level" in history.columns:
        danger_values = history["danger_level"].dropna()
        if not danger_values.empty:
            ax.axhline(float(danger_values.iloc[-1]), linestyle="--", label="Danger level")

    ax.set_xlabel("Date")
    ax.set_ylabel("Water level (dataset units)")
    ax.grid(alpha=0.25)
    ax.legend()
    fig.tight_layout()
    st.pyplot(fig)
    plt.close(fig)

st.markdown("### Recent station observations")
display_columns = [
    column for column in [
        "date", "water_level", "rain_1d", "rain_3d", "rain_7d",
        "level_danger_ratio", "level_warning_ratio", "flood_next_day"
    ]
    if column in station_history.columns
]
st.dataframe(
    station_history.tail(20)[display_columns].sort_values("date", ascending=False),
    use_container_width=True,
    hide_index=True,
)

st.markdown("### Stations ranked by predicted probability")
ranked = filtered_stations.copy()
ranked["Predicted probability"] = ranked[probability_col]
ranked["Classification"] = np.where(
    ranked["Predicted probability"] >= decision_threshold,
    "Threshold exceedance predicted",
    "Not predicted",
)
rank_columns = [
    column for column in [
        "station_code", "station_name", "date", "Predicted probability",
        "Classification", "lat", "lon"
    ]
    if column in ranked.columns
]
st.dataframe(
    ranked[rank_columns]
    .sort_values("Predicted probability", ascending=False)
    .head(100)
    .style.format({"Predicted probability": "{:.2%}"}),
    use_container_width=True,
    hide_index=True,
)

csv_data = ranked[rank_columns].to_csv(index=False).encode("utf-8")
st.download_button(
    "Download filtered station predictions (CSV)",
    data=csv_data,
    file_name="station_flood_risk_predictions.csv",
    mime="text/csv",
)

with st.expander("About the model and interpretation"):
    st.markdown(
        """
        - The target is whether the **next day's mean water level** reaches or
          exceeds the station's published danger level.
        - The probability is a model score; it should not be interpreted as a
          calibrated real-world flood probability without calibration testing.
        - The dashboard uses the latest date present in the processed dataset.
          It does not automatically fetch current CWC observations.
        - The model was evaluated on later dates for stations represented in
          the dataset. Performance on entirely unseen stations has not yet been
          established.
        - This dashboard is a research prototype, not an official warning service.
        """
    )
