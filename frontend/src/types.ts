export type ModelName = "Random Forest" | "XGBoost" | "Logistic Regression";

export const MODELS: ModelName[] = [
  "Random Forest",
  "XGBoost",
  "Logistic Regression",
];

export type AppPage = "overview" | "stations" | "models";

export type RiskFilter = "all" | "alert" | "watch";

export interface Station {
  station_code: string
  station_name: string
  date?: string
  lat?: number | null
  lon?: number | null
  lat_meta?: number | null
  lon_meta?: number | null
  danger_level?: number | null
  warning_level?: number | null
  danger_level_meta?: number | null
  warning_level_meta?: number | null
  probability: number
  threshold: number
  predicted_exceedance: boolean
}

export interface Overview {
  model: string
  threshold: number
  station_count: number
  alert_count: number
  below_threshold_count: number
  mean_score: number
  highest_probability: number
  highest_station_code: string
  highest_station_name: string
  latest_data_date: string
  dataset_start: string
  dataset_end: string
  note: string
}

export interface HistoryPoint {
  date: string
  water_level?: number | null
  rain_1d?: number | null
  rain_3d?: number | null
  rain_7d?: number | null
  level_danger_ratio?: number | null
  level_warning_ratio?: number | null
  flood_next_day?: number | null
}

export interface StationDetail {
  station_code: string
  model: string
  probability: number
  threshold: number
  predicted_exceedance: boolean
  latest_date: string
  danger_level?: number | null
  warning_level?: number | null
  water_level?: number | null
  level_change_1d?: number | null
  level_change_3d?: number | null
  rain_7d?: number | null
  lat?: number | null
  lon?: number | null
  history: HistoryPoint[]
}

export interface ModelMetric {
  Model: string
  Threshold?: number
  ROC_AUC?: number
  PR_AUC?: number
  Precision?: number
  Recall?: number
  F1?: number
  False_Positives?: number
  False_Negatives?: number
  True_Negatives?: number
  True_Positives?: number
  confusion_matrix?: { tn: number; fp: number; fn: number; tp: number }
  feature_importance?: { feature: string; importance: number }[]
}
