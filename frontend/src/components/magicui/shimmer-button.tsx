import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Primary call-to-action link with a light sweeping across it. */
export function ShimmerButton({
  children,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a
      {...props}
      className={cn(
        "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-foreground px-6 text-[15px] font-medium text-background",
        "transition-transform duration-150 hover:-translate-y-px active:translate-y-0 active:scale-[0.98]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="animate-shimmer-sweep pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_35%,rgb(255_255_255/0.3)_50%,transparent_65%)]"
      />
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </a>
  );
}
