import type { CSSProperties, ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Infinite horizontal scroller; pauses on hover. */
export function Marquee({
  children,
  duration = 40,
  gap = 12,
  className,
}: {
  children: ReactNode;
  duration?: number;
  gap?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("mask-fade-x group flex overflow-hidden", className)}
      style={
        { "--marquee-duration": `${duration}s`, "--marquee-gap": `${gap}px` } as CSSProperties
      }
    >
      <div
        className="animate-marquee flex w-max shrink-0 group-hover:[animation-play-state:paused]"
        style={{ gap }}
      >
        <div className="flex shrink-0" style={{ gap }}>
          {children}
        </div>
        <div className="flex shrink-0" style={{ gap }} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
