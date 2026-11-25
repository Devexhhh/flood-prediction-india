import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Text with a highlight that glides across it. */
export function AnimatedShinyText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("shiny-text animate-shiny-text", className)}>{children}</span>;
}

/** Dotted background; place inside a `relative` parent. */
export function DotPattern({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("dot-pattern pointer-events-none absolute inset-0", className)}
    />
  );
}

/** A status dot with a radiating ping. */
export function PulseDot({
  className,
  ping = true,
}: {
  className?: string;
  ping?: boolean;
}) {
  return (
    <span aria-hidden="true" className={cn("relative inline-flex size-2 shrink-0", className)}>
      {ping && (
        <span className="animate-ping-slow absolute inset-0 rounded-full bg-current opacity-70" />
      )}
      <span className="relative inline-flex size-full rounded-full bg-current" />
    </span>
  );
}
