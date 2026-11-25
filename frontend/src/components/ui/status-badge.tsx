import { cn } from "../../lib/utils";

export function StatusBadge({ alert, className }: { alert: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium",
        alert
          ? "bg-risk-soft text-risk"
          : "border border-border text-muted-foreground",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", alert ? "bg-risk" : "bg-muted-foreground")}
      />
      {alert ? "Alert" : "Watch"}
    </span>
  );
}
