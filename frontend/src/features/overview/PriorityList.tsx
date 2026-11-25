import { motion } from "motion/react";
import { Card, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { pct } from "../../lib/format";
import { isAlert } from "../../lib/threshold";
import { cn } from "../../lib/utils";
import type { Station } from "../../types";

export function PriorityList({
  stations,
  threshold,
  selectedCode,
  onSelect,
  onViewAll,
}: {
  /** Sorted by probability, highest first. */
  stations: Station[];
  threshold: number;
  selectedCode: string | null;
  onSelect: (code: string) => void;
  onViewAll: () => void;
}) {
  const top = stations.slice(0, 8);
  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Priority stations"
        subtitle="Highest next-day exceedance probability"
        action={
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all
          </Button>
        }
      />
      {top.length === 0 ? (
        <p className="m-0 p-8 text-center text-sm text-muted-foreground">No stations match the current filter.</p>
      ) : (
        <ul className="m-0 list-none p-1.5">
          {top.map((s, i) => {
            const alert = isAlert(s.probability, threshold);
            const selected = s.station_code === selectedCode;
            return (
              <li key={s.station_code}>
                <button
                  type="button"
                  onClick={() => onSelect(s.station_code)}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors",
                    selected ? "bg-muted" : "hover:bg-muted",
                  )}
                >
                  <span className="w-5 font-mono text-xs text-muted-foreground">{i + 1}</span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="truncate text-sm">{s.station_name || s.station_code}</span>
                    <span className="h-1 overflow-hidden rounded-full bg-muted">
                      <motion.span
                        className={cn("block h-full rounded-full", alert ? "bg-risk" : "bg-muted-foreground")}
                        initial={{ width: 0 }}
                        animate={{ width: `${s.probability * 100}%` }}
                        transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
                      />
                    </span>
                  </span>
                  <span className={cn("w-14 text-right font-mono text-[13px]", alert ? "text-risk" : "text-muted-foreground")}>
                    {pct(s.probability)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
