import type { CSSProperties } from "react";
import { cn } from "../../lib/utils";

/** A light that travels around the parent's border. Parent must be `relative`. */
export function BorderBeam({
  duration = 6,
  colorFrom,
  colorTo,
  className,
}: {
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "border-beam animate-beam pointer-events-none absolute -inset-px rounded-[inherit]",
        className,
      )}
      style={
        {
          "--beam-duration": `${duration}s`,
          ...(colorFrom ? { "--beam-from": colorFrom } : {}),
          ...(colorTo ? { "--beam-to": colorTo } : {}),
        } as CSSProperties
      }
    />
  );
}
