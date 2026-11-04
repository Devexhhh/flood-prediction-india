import { AlertTriangle, Droplets, Gauge, MapPinned } from "lucide-react";
import { pct } from "../lib/format";
import { formatThresholdPct } from "../lib/threshold";
import type { Overview } from "../types";
import { MetricCard } from "./MetricCard";

export function MetricsGrid({
  overview,
  threshold,
  alertCount,
}: {
  overview: Overview;
  threshold: number;
  alertCount: number;
}) {
  return (
    <section className="metrics-grid">
      <MetricCard
        icon={<MapPinned size={18} />}
        label="Usable stations"
        value={overview.station_count.toLocaleString("en-IN")}
        foot="With latest usable features"
        tone="blue"
      />
      <MetricCard
        icon={<AlertTriangle size={18} />}
        label="Above alert threshold"
        value={alertCount.toLocaleString("en-IN")}
        foot={`${overview.station_count ? ((alertCount / overview.station_count) * 100).toFixed(1) : "0.0"}% of scored stations`}
        tone="red"
      />
      <MetricCard
        icon={<Gauge size={18} />}
        label="Mean model score"
        value={pct(overview.mean_score)}
        foot="Across latest station rows"
        tone="violet"
      />
      <MetricCard
        icon={<Droplets size={18} />}
        label="Alert threshold"
        value={formatThresholdPct(threshold)}
        foot="Dashboard classification cutoff"
        tone="green"
      />
    </section>
  );
}
