import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "../../lib/utils";

/** Pill-style segmented control with a sliding indicator. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const layoutId = useId();
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex rounded-[10px] border border-border bg-card p-[3px]", className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex-1 cursor-pointer rounded-[7px] px-3 font-medium whitespace-nowrap transition-colors",
              size === "sm" ? "h-7 text-xs" : "h-8 text-[13px]",
              active ? "text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-[7px] bg-foreground"
                transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
