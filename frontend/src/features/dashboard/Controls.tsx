import { Card } from "../../components/ui/card";
import { Slider } from "../../components/ui/slider";
import {
  DEFAULT_THRESHOLDS,
  formatThresholdPct,
  THRESHOLD_MAX,
  THRESHOLD_MIN,
  THRESHOLD_STEP,
} from "../../lib/threshold";
import type { ModelName } from "../../types";

export function Controls({
  model,
  threshold,
  onThresholdChange,
}: {
  model: ModelName;
  threshold: number;
  onThresholdChange: (v: number) => void;
}) {
  const validated = DEFAULT_THRESHOLDS[model];
  const isDefault = Math.abs(threshold - validated) < THRESHOLD_STEP;
  return (
    <Card className="flex w-full flex-col gap-2.5 rounded-[14px] px-4 py-3.5 sm:w-[380px]">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor="cutoff" className="text-[13px] text-muted-foreground">
          Alert cutoff · {model}
        </label>
        <span className="font-mono text-xl tracking-tight tabular-nums">{formatThresholdPct(threshold)}</span>
      </div>
      <Slider
        id="cutoff"
        min={THRESHOLD_MIN}
        max={THRESHOLD_MAX}
        step={THRESHOLD_STEP}
        value={threshold}
        onChange={onThresholdChange}
        aria-valuetext={formatThresholdPct(threshold)}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>More alerts</span>
        <button
          type="button"
          disabled={isDefault}
          onClick={() => onThresholdChange(validated)}
          className="cursor-pointer rounded-md px-1.5 py-0.5 text-accent transition-colors hover:bg-muted disabled:cursor-default disabled:text-muted-foreground disabled:hover:bg-transparent"
        >
          {isDefault ? "Validated cutoff" : `Reset to ${formatThresholdPct(validated)}`}
        </button>
        <span>Fewer alerts</span>
      </div>
    </Card>
  );
}
