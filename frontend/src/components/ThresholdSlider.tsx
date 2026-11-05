import { useEffect, useState } from "react";
import {
  THRESHOLD_MAX,
  THRESHOLD_MIN,
  THRESHOLD_STEP,
  formatThresholdPct,
} from "../lib/threshold";

export function ThresholdSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [percentage, setPercentage] = useState((value * 100).toFixed(2));

  useEffect(() => setPercentage((value * 100).toFixed(2)), [value]);

  const label = formatThresholdPct(value);

  function commitPercentage() {
    const next = Number(percentage);
    if (!Number.isFinite(next)) {
      setPercentage((value * 100).toFixed(2));
      return;
    }
    const normalized = Math.min(
      THRESHOLD_MAX,
      Math.max(THRESHOLD_MIN, next / 100),
    );
    onChange(normalized);
  }

  return (
    <div className="heading-control threshold-control">
      <label className="control-label" htmlFor="alert-threshold">
        ALERT THRESHOLD
      </label>
      <div className="threshold-slider-row">
        <input
          id="alert-threshold"
          type="range"
          min={THRESHOLD_MIN}
          max={THRESHOLD_MAX}
          step={THRESHOLD_STEP}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuemin={THRESHOLD_MIN}
          aria-valuemax={THRESHOLD_MAX}
          aria-valuenow={value}
          aria-valuetext={label}
          aria-label="Alert classification threshold"
        />
        <output className="threshold-value" htmlFor="alert-threshold">
          {label}
        </output>
        <input
          className="threshold-number"
          type="number"
          min={THRESHOLD_MIN * 100}
          max={THRESHOLD_MAX * 100}
          step="0.01"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
          onBlur={commitPercentage}
          onKeyDown={(e) => e.key === "Enter" && commitPercentage()}
          aria-label="Enter threshold percentage"
        />
      </div>
    </div>
  );
}
