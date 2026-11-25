import type { CSSProperties } from "react";
import { cn } from "../../lib/utils";

export function Slider({
  id,
  value,
  min,
  max,
  step,
  onChange,
  className,
  ...aria
}: {
  id?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  className?: string;
  "aria-label"?: string;
  "aria-valuetext"?: string;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn("range", className)}
      style={{ "--fill": `${fill}%` } as CSSProperties}
      {...aria}
    />
  );
}
