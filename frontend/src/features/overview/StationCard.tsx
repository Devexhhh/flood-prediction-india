import { BorderBeam, NumberTicker } from "../../components/magicui";
import { Card } from "../../components/ui/card";
import { StatusBadge } from "../../components/ui/status-badge";
import { formatDate } from "../../lib/format";
import { isAlert } from "../../lib/threshold";
import type { Station, StationDetail } from "../../types";

function metres(v?: number | null, signed = false) {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";
  return `${signed && v > 0 ? "+" : ""}${v.toFixed(2)} m`;
}

export function StationCard({
  station,
  detail,
  threshold,
  loading,
}: {
  station: Station | null;
  detail: StationDetail | null;
  threshold: number;
  loading?: boolean;
}) {
  if (!station) {
    return (
      <Card className="grid min-h-[300px] place-items-center p-6 text-sm text-muted-foreground">
        Select a station to see its details.
      </Card>
    );
  }

  const probability = detail?.probability ?? station.probability;
  const alert = isAlert(probability, threshold);
  const level = detail?.water_level;
  const danger = detail?.danger_level ?? station.danger_level ?? station.danger_level_meta;
  const gap = typeof level === "number" && typeof danger === "number" ? danger - level : null;

  const stats = [
    { label: "Water level", value: metres(level) },
    { label: "Danger level", value: metres(danger) },
    { label: "To danger", value: metres(gap) },
    { label: "Rain, 7 days", value: typeof detail?.rain_7d === "number" ? `${detail.rain_7d.toFixed(1)} mm` : "—" },
    { label: "Change, 1 day", value: metres(detail?.level_change_1d, true) },
    { label: "Change, 3 days", value: metres(detail?.level_change_3d, true) },
  ];

  return (
    <Card className="flex flex-col gap-4 p-5" aria-busy={loading}>
      {alert && <BorderBeam />}
      <div className="flex items-center justify-between gap-2">
        <h2 className="m-0 text-[15px] font-semibold">Selected station</h2>
        <StatusBadge alert={alert} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-lg font-semibold tracking-tight">{station.station_name || station.station_code}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {station.station_code} · {formatDate(detail?.latest_date ?? station.date)}
        </span>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <NumberTicker
          value={probability * 100}
          decimals={1}
          suffix="%"
          duration={0.8}
          className="text-[44px] leading-none tracking-[-0.04em]"
        />
        <span className="text-[13px] text-muted-foreground">next-day exceedance</span>
      </div>
      <dl className="m-0 grid grid-cols-2 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[10px] border border-border px-3 py-2.5">
            <dt className="truncate text-xs text-muted-foreground">{s.label}</dt>
            <dd className="m-0 mt-1 font-mono text-[15px] whitespace-nowrap">{loading ? "…" : s.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
