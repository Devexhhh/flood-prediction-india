import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative rounded-2xl border border-border bg-card", className)}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="m-0 text-[15px] font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="m-0 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
