import type { ModelName } from "../types";

export const DEFAULT_THRESHOLDS: Record<ModelName, number> = {
  "Random Forest": 0.904376,
  XGBoost: 0.955972,
  "Logistic Regression": 0.739413,
};

export const THRESHOLD_MIN = 0.01;
export const THRESHOLD_MAX = 0.99;
export const THRESHOLD_STEP = 0.0001;

export function isAlert(probability: number, threshold: number) {
  return probability >= threshold;
}

export function formatThresholdPct(value: number) {
  const percent = value * 100;
  const rounded = Math.round(percent);
  return Math.abs(percent - rounded) < 0.05
    ? `${rounded}%`
    : `${percent.toFixed(1)}%`;
}
