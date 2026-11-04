# Machine Learning-Based Flood Risk Prediction in India

A machine learning project for predicting **next-day river water-level danger-threshold exceedance** using historical water-level, rainfall, and station metadata from India's Central Water Commission (CWC) monitoring network.

The project combines hydrological data processing, station-level quality control, time-series feature engineering, chronological model evaluation, and comparative analysis of three machine learning algorithms.

## Overview

Floods pose a recurring threat to communities, infrastructure, and agriculture across India. Historical river observations can help identify conditions associated with rising water levels and potential danger-level exceedances.

This project develops and evaluates machine learning models that estimate whether a monitored river station's **next-day mean water level will reach or exceed its published danger level**.

The objective is to build a reproducible, data-driven risk prediction pipeline and assess how effectively different models identify potential exceedances while balancing missed events against false alarms.

> **Scope:** This is a station-level danger-threshold exceedance prediction project. It does not directly predict flood inundation boundaries, affected populations, or flood risk at arbitrary geographic locations.

## Dataset and Sources

The project uses historical hydrological observations derived from India's Central Water Commission monitoring network.

- **Official portal:** [CWC Flood Forecast System](https://ffs.india-water.gov.in/)
- **Dataset browser:** [CWC Flood Forecast Data](https://diagram-chasing.github.io/cwc-flood-forecasts/)
- **Data dictionary:** [`DATA.md`](DATA.md)

The source dataset contains readings associated with 1,747 river gauges and dams, including water level, rainfall, discharge, temperature, and reservoir-related observations.

### Source files

| File | Description |
|---|---|
| `stations.parquet` | Station metadata, coordinates, and published thresholds |
| `daily.parquet` | Daily observations and aggregated statistics |
| `hourly.parquet` | Hourly readings covering approximately the most recent three years |

The daily dataset extends back to 1900 but is sparse before 1975. The hourly dataset provides finer temporal resolution for a more limited period.

Parquet was used for efficient storage and analytical processing of the large datasets.

## Project Workflow

The project is organized into sequential stages.

### 1. Dataset exploration

`notebooks/01_dataset_exploration.ipynb`

- Inspect the dataset schemas, data types, and temporal coverage.
- Analyze station coverage and parameter availability.
- Investigate missing observations, suspicious values, and inconsistencies.
- Identify suitable water-level and rainfall variables.

### 2. Station selection and quality control

`notebooks/02_station_selection.ipynb`

The source contains 1,747 stations, but not all have sufficient historical observations or reliable measurements for modeling.

Station selection considers:

- Availability of a valid published danger level.
- At least three years of water-level history.
- At least three years of rainfall history.
- Sufficient overlap between water-level and rainfall observations.
- Water-level scale consistency relative to the station's danger level.
- Sentinel values and suspicious measurement patterns.

The final selection contains **703 stations** after applying the project's quality criteria.

### 3. Machine learning dataset construction

`notebooks/03_build_ml_dataset.ipynb`

The selected observations are cleaned and transformed into a station-day dataset.

The pipeline includes:

- Cleaning invalid and suspicious measurements.
- Constructing a continuous daily calendar for each station.
- Creating lagged water-level features.
- Calculating recent water-level changes and rainfall accumulations.
- Incorporating station-specific warning and danger thresholds.
- Generating the next-day classification target.

The resulting processed dataset contains **3,292,158 rows**, with usable modeling rows from 689 stations.

### 4. Model training

`notebooks/04_model_training.ipynb`

Three classifiers are trained and compared:

1. Logistic Regression
2. Random Forest
3. XGBoost

The dataset is divided chronologically rather than randomly to better approximate prediction on future observations.

| Split | Period | Rows | Positive observations |
|---|---|---:|---:|
| Training | Through 2022 | 2,471,787 | 45,862 |
| Validation | 2023–2024 | 446,049 | 4,773 |
| Test | 2025–2026-09-10 | 374,322 | 4,279 |

The validation period is used for threshold selection. The final test period is reserved for evaluating the selected configurations.

### 5. Model evaluation and error analysis

`notebooks/05_model_evaluation.ipynb`

Evaluation includes:

- ROC-AUC and precision–recall AUC.
- Precision, recall, and F1 score.
- Confusion matrices.
- ROC and precision–recall curves.
- Feature importance for tree-based models.
- False-positive and false-negative analysis.
- Validation threshold comparisons.

## Prediction Target

The target variable is `flood_next_day`.

It is defined as:

\[
y_{s,t} =
\begin{cases}
1, & \text{if } H_{s,t+1} \geq D_s \\
0, & \text{otherwise}
\end{cases}
\]

Where:

- \(H_{s,t+1}\) is the next day's cleaned mean water level for station \(s\).
- \(D_s\) is that station's published danger level.
- \(y_{s,t}\) indicates whether the next-day danger threshold is reached.

This is a binary classification problem with a relatively rare positive class.

The model estimates the probability of a next-day threshold exceedance using information available on the prediction date.

## Features

The model uses 17 predictive features.

| Category | Features |
|---|---|
| Current water level | `water_level` |
| Historical water levels | `water_level_lag_1`, `water_level_lag_2`, `water_level_lag_3` |
| Water-level changes | `level_change_1d`, `level_change_3d` |
| Recent rainfall | `rain_1d`, `rain_3d`, `rain_7d` |
| Threshold ratios | `level_danger_ratio`, `level_warning_ratio`, `rise_danger_ratio_1d`, `rise_danger_ratio_3d` |
| Station thresholds | `danger_level`, `warning_level` |
| Geographic information | `lat`, `lon` |

The next-day observed water level is used to construct the target, not as an input feature.

## Results

The following results were obtained on the chronological test set using thresholds selected on the validation set.

| Metric | Logistic Regression | Random Forest | XGBoost |
|---|---:|---:|---:|
| ROC-AUC | 0.9903 | 0.9962 | **0.9965** |
| PR-AUC | 0.7514 | 0.9324 | **0.9328** |
| Precision | 53.29% | **90.36%** | 87.52% |
| Recall | **87.19%** | 83.43% | 85.42% |
| F1 score | 0.6615 | **0.8676** | 0.8646 |
| False positives | 3,270 | **381** | 521 |
| False negatives | **548** | 709 | 624 |

The test set contains 374,322 station-day observations, including 4,279 positive observations.

### Key findings

- **Random Forest achieves the highest F1 score** and precision at the selected thresholds.
- XGBoost achieves the highest ROC-AUC and PR-AUC and has higher recall than Random Forest.
- Logistic Regression has the highest recall but produces substantially more false alarms.
- Precision–recall AUC is particularly relevant because danger-level exceedances are uncommon relative to non-exceedances.

Random Forest is the leading candidate under an F1-oriented selection criterion. The preferred operational model would depend on the relative costs of missed exceedances and false alarms.

These results evaluate later dates for stations represented in the broader modeling dataset; they do not establish performance on entirely unseen stations.

## Feature Importance

Feature-importance analysis for Random Forest and XGBoost identifies the following prominent predictors:

- `level_warning_ratio`
- `level_danger_ratio`
- `rain_7d`
- `rise_danger_ratio_3d`
- `rise_danger_ratio_1d`
- Recent water-level changes and historical levels

The two threshold-ratio features account for approximately 80% of Random Forest's reported feature importance and 77% of XGBoost's.

This indicates that the models rely heavily on the current water level relative to station-specific thresholds. Feature importance describes model behavior; it does not establish causal relationships.

## Repository Structure

```text
flood-prediction-india/
├── data/
│   ├── raw/
│   ├── interim/
│   └── processed/
├── models/
│   ├── logistic_regression.joblib
│   ├── random_forest.joblib
│   └── xgboost.joblib
├── notebooks/
│   ├── 01_dataset_exploration.ipynb
│   ├── 02_station_selection.ipynb
│   ├── 03_build_ml_dataset.ipynb
│   ├── 04_model_training.ipynb
│   └── 05_model_evaluation.ipynb
├── output/
│   └── # Extracted notebook code references
├── reports/
│   ├── figures/
│   └── tables/
├── src/
|   └── extract_notebook_code.py
├── requirements.txt
└── README.md
```

Additional generated figures and tables are saved in the corresponding report directories.

## Getting Started

### Prerequisites

- Python with support for the project's installed dependencies.
- Jupyter Notebook or JupyterLab.
- Access to the source Parquet files.
- Sufficient disk space and memory for large tabular datasets.

### Install dependencies

Create and activate a virtual environment, then install the libraries used by the notebooks. A typical starting point is:

```bash
python -m venv .venv
```

Activate the environment and install the required packages:

```bash
pip install pandas numpy pyarrow jupyter \
    scikit-learn matplotlib seaborn joblib xgboost
```

The exact dependency versions should be pinned in a project requirements file for reproducibility.

### Run the notebooks

Execute the notebooks in order:

1. `01_dataset_exploration.ipynb`
2. `02_station_selection.ipynb`
3. `03_build_ml_dataset.ipynb`
4. `04_model_training.ipynb`
5. `05_model_evaluation.ipynb`

The preprocessing and training notebooks generate intermediate datasets, the processed modeling dataset, trained models, and evaluation artifacts required by subsequent stages.

If the processed datasets and model files are already available, begin with the evaluation notebook.

## Limitations

1. **Station-level scope:** Predictions apply to monitored stations with suitable historical data. The current model does not directly predict flooding at arbitrary locations.
2. **Proxy target:** A danger-level exceedance is not equivalent to confirmed flood inundation or observed damage.
3. **Temporal aggregation:** The target uses next-day mean water level and may not capture short-duration peaks that occur within a day.
4. **Class imbalance:** Positive observations are rare, so accuracy alone would be an inadequate evaluation metric.
5. **Station generalization:** The chronological split evaluates future dates but does not independently establish generalization to stations excluded from training.
6. **Data quality:** Historical records can contain missing observations, measurement inconsistencies, sentinel values, and changes in gauge reference levels.
7. **Probability calibration:** High ranking metrics do not guarantee that predicted probabilities correspond to calibrated real-world event probabilities.
8. **Operational readiness:** The models have not, through these results alone, been established as a validated public flood-warning service.

The project should be treated as a research and decision-support prototype, not as a replacement for official flood forecasts or emergency guidance.

## Future Improvements

- Evaluate generalization to entirely unseen stations.
- Investigate probability calibration and event-specific evaluation.
- Compare alert thresholds according to the costs of missed events and false alarms.
- Incorporate upstream station observations, additional rainfall sources, and river-network relationships.
- Explore spatial and spatio-temporal modeling for geographic flood-risk estimation.
- Build an interactive dashboard for station selection, historical observations, and model predictions.
- Establish monitoring and retraining procedures before considering operational deployment.

## Data Attribution and Licence

The underlying observations are associated with the Central Water Commission's monitoring network. Consult the official portal and dataset documentation when using or redistributing the data.

The source dataset is described as being released under the [Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/1-0/). Review the applicable licence and attribution requirements before redistribution.

- [CWC Flood Forecast System](https://ffs.india-water.gov.in/)
- [Dataset browser](https://diagram-chasing.github.io/cwc-flood-forecasts/)
- [Data dictionary](DATA.md)

## Acknowledgements

This project uses historical hydrological observations derived from the CWC monitoring network. Code and documentation were developed with AI assistance.
