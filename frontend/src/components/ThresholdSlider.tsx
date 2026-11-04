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
  const label = formatThresholdPct(value);
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
      </div>
    </div>
  );
}
