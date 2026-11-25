// Static figures from the project README (chronological test set).

export const FEATURES = [
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
];

export const MODEL_RESULTS = [
  { name: "Random Forest", f1: 0.8676 },
  { name: "XGBoost", f1: 0.8646 },
  { name: "Logistic Regression", f1: 0.6615 },
];

export const SPLITS = [
  { split: "Training", period: "≤ 2022", rows: 2471787, positives: 45862 },
  { split: "Validation", period: "2023–24", rows: 446049, positives: 4773 },
  { split: "Test", period: "2025–26", rows: 374322, positives: 4279 },
];

export const PIPELINE = [
  { title: "Explore the CWC dataset", body: "Schemas, coverage and suspicious values across 1,747 gauges and dams." },
  { title: "Select reliable stations", body: "Keep stations with a valid danger level, enough history and a consistent scale — 703 pass." },
  { title: "Engineer station-day features", body: "Continuous daily calendars, lags, level changes, rainfall windows and threshold ratios." },
  { title: "Train three models", body: "Logistic Regression, Random Forest and XGBoost on a chronological split." },
  { title: "Evaluate on the future", body: "ROC and PR curves, confusion matrices and feature importance on the 2025–26 test window." },
];
