import { useId, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartColors } from "../../app/providers/ThemeProvider";
import { Card, CardHeader } from "../../components/ui/card";
import { Segmented } from "../../components/ui/segmented";
import type { StationDetail } from "../../types";

type Kind = "water" | "rain";
type Range = "30" | "90" | "all";

export function HistoryChart({
  detail,
  stationName,
}: {
  detail: StationDetail | null;
  stationName?: string;
}) {
  const [kind, setKind] = useState<Kind>("water");
  const [range, setRange] = useState<Range>("90");
  const c = useChartColors();
  const gradientId = useId();

  const data = useMemo(() => {
    const h = detail?.history ?? [];
    return range === "all" ? h : h.slice(-Number(range));
  }, [detail, range]);

  const tick = { fill: c.muted, fontSize: 11, fontFamily: "Geist, sans-serif" };
  const tooltip = {
    contentStyle: {
      background: c.card,
      border: `1px solid ${c.border}`,
      borderRadius: 10,
      color: c.foreground,
      fontFamily: "Geist, sans-serif",
      fontSize: 12,
      boxShadow: "0 8px 24px rgb(0 0 0 / 0.15)",
    },
    labelStyle: { color: c.foreground, fontWeight: 500, marginBottom: 4 },
    cursor: { stroke: c.border },
  };

  const title = stationName ? `${stationName} · history` : "Station history";

  return (
    <Card className="flex flex-col">
      <CardHeader
        title={title}
        subtitle={kind === "water" ? "Daily mean water level against warning and danger levels (m)" : "Daily rainfall (mm)"}
        action={
          <div className="flex flex-wrap gap-2">
            <Segmented
              size="sm"
              label="Series"
              value={kind}
              onChange={setKind}
              options={[
                { value: "water", label: "Water level" },
                { value: "rain", label: "Rainfall" },
              ]}
            />
            <Segmented
              size="sm"
              label="Range"
              value={range}
              onChange={setRange}
              options={[
                { value: "30", label: "30d" },
                { value: "90", label: "90d" },
                { value: "all", label: "All" },
              ]}
            />
          </div>
        }
      />
      <div className="px-2 pt-4 pb-3">
        {!detail || data.length === 0 ? (
          <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">
            {detail ? "No history recorded for this station." : "Loading history…"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            {kind === "water" ? (
              <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.foreground} stopOpacity={0.14} />
                    <stop offset="100%" stopColor={c.foreground} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={c.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={tick} tickFormatter={(v) => String(v).slice(5, 10)} minTickGap={36} tickLine={false} axisLine={{ stroke: c.border }} />
                <YAxis tick={tick} tickLine={false} axisLine={false} width={44} domain={["auto", "auto"]} />
                <Tooltip {...tooltip} formatter={(v: number) => [`${v?.toFixed(2)} m`, "Water level"]} />
                {detail.warning_level != null && (
                  <ReferenceLine y={detail.warning_level} stroke={c.muted} strokeDasharray="4 4" label={{ value: "Warning", fill: c.muted, fontSize: 11, position: "insideTopRight" }} />
                )}
                {detail.danger_level != null && (
                  <ReferenceLine y={detail.danger_level} stroke={c.risk} strokeDasharray="5 5" label={{ value: "Danger", fill: c.risk, fontSize: 11, position: "insideTopRight" }} />
                )}
                <Area
                  type="monotone"
                  dataKey="water_level"
                  stroke={c.foreground}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  activeDot={{ r: 4, fill: c.foreground, stroke: c.card }}
                  connectNulls={false}
                  animationDuration={900}
                />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={c.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={tick} tickFormatter={(v) => String(v).slice(5, 10)} minTickGap={36} tickLine={false} axisLine={{ stroke: c.border }} />
                <YAxis tick={tick} tickLine={false} axisLine={false} width={44} />
                <Tooltip {...tooltip} cursor={{ fill: c.border, opacity: 0.4 }} formatter={(v: number) => [`${v?.toFixed(1)} mm`, "Rainfall"]} />
                <Bar dataKey="rain_1d" fill={c.accent} radius={[3, 3, 0, 0]} animationDuration={900} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
