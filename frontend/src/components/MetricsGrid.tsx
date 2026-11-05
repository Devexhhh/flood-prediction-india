import {
  RiEarthLine,
  TbAlertOctagon,
  PhCheckCircle,
  PhTrendUp,
  PhGauge,
} from "./icons";
import { pct } from "../lib/format";
import { formatThresholdPct } from "../lib/threshold";
import type { Overview, Station } from "../types";
import { MetricCard } from "./MetricCard";

export function MetricsGrid({
  overview,
  threshold,
  alertCount,
  stations,
}: {
  overview: Overview;
  threshold: number;
  alertCount: number;
  stations: Station[];
}) {
  const highest = stations.reduce<Station | null>(
    (current, station) =>
      !current || station.probability > current.probability ? station : current,
    null,
  );
  const belowThresholdCount = stations.length - alertCount;
  const alertShare = overview.station_count
    ? ((alertCount / overview.station_count) * 100).toFixed(1)
    : "0.0";

  return (
    <section className="metrics-grid">
      <MetricCard
        icon={<RiEarthLine size={17} color="#3b82f6" />}
        label="Active Stations"
        value={overview.station_count.toLocaleString("en-IN")}
        foot="CWC monitoring network"
        tone="blue"
      />
      <MetricCard
        icon={<TbAlertOctagon size={18} color="#ef4444" />}
        label="Exceedance Alerts"
        value={alertCount.toLocaleString("en-IN")}
        foot={`${alertShare}% of active network`}
        tone="red"
      />
      <MetricCard
        icon={<PhCheckCircle size={18} color="#10b981" />}
        label="Normal Status"
        value={belowThresholdCount.toLocaleString("en-IN")}
        foot="Below danger threshold"
        tone="green"
      />
      <MetricCard
        icon={<PhTrendUp size={18} color="#a855f7" />}
        label="Peak Risk Score"
        value={pct(highest?.probability)}
        foot={highest?.station_name || highest?.station_code || "None"}
        tone="violet"
      />
      <MetricCard
        icon={<PhGauge size={18} color="#f59e0b" />}
        label="Alert Cutoff"
        value={formatThresholdPct(threshold)}
        foot="Model decision boundary"
        tone="amber"
      />
    </section>
  );
}
