import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TbWaterRipple,
  HiCloudRain,
  HiArrowsPointingOut,
  HiXMark,
} from "./icons";
import type { StationDetail } from "../types";

const TOOLTIP_STYLE = {
  background: "rgba(18, 18, 22, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: 8,
  color: "#ffffff",
  fontFamily: "'Google Sans', 'Plus Jakarta Sans', sans-serif",
  fontSize: 12,
  backdropFilter: "blur(12px)",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
};

const TICK = {
  fill: "#a1a1aa",
  fontSize: 11,
  fontFamily: "'Google Sans', 'Plus Jakarta Sans', sans-serif",
};

type ChartKind = "water" | "rain";
type Props = { detail: StationDetail; stationName?: string };

function ChartCard({
  kind,
  detail,
  large,
  onExpand,
}: {
  kind: ChartKind;
  detail: StationDetail;
  large?: boolean;
  onExpand?: () => void;
}) {
  const water = kind === "water";
  const title = water ? "Water Level" : "Daily Precipitation";
  const unit = water ? "metres" : "millimetres";
  const height = large ? 480 : 245;

  const axes = (
    <>
      <CartesianGrid stroke="rgba(255, 255, 255, 0.07)" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="date"
        tick={TICK}
        tickFormatter={(v) => String(v).slice(5, 10)}
        minTickGap={35}
        tickLine={false}
        axisLine={{ stroke: "rgba(255, 255, 255, 0.12)" }}
      />
      <YAxis tick={TICK} tickLine={false} axisLine={false} width={38} />
    </>
  );

  const tooltip = (
    <Tooltip
      contentStyle={TOOLTIP_STYLE}
      labelStyle={{ color: "#ffffff", fontWeight: 600, marginBottom: 4 }}
      formatter={(value: number) => [
        `${value?.toFixed(water ? 2 : 1)} ${water ? "m" : "mm"}`,
        title,
      ]}
    />
  );

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title-left">
          {water ? (
            <TbWaterRipple size={18} color="#38bdf8" />
          ) : (
            <HiCloudRain size={18} color="#06b6d4" />
          )}
          <h3>{title}</h3>
          <span className="unit-label">{unit}</span>
        </div>
        {onExpand && (
          <button
            className="glass-icon-btn small"
            onClick={onExpand}
            aria-label={`Expand ${title} chart`}
          >
            <HiArrowsPointingOut size={13} color="#a1a1aa" />
          </button>
        )}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        {water ? (
          <LineChart
            data={detail.history}
            margin={{ top: 12, right: 14, left: 2, bottom: 4 }}
          >
            {axes}
            {tooltip}
            {detail.warning_level != null && (
              <ReferenceLine
                y={detail.warning_level}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: "Warning",
                  fill: "#f59e0b",
                  fontSize: 11,
                  fontFamily: "'Google Sans', sans-serif",
                }}
              />
            )}
            {detail.danger_level != null && (
              <ReferenceLine
                y={detail.danger_level}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: "Danger",
                  fill: "#ef4444",
                  fontSize: 11,
                  fontFamily: "'Google Sans', sans-serif",
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="water_level"
              name="Water level"
              stroke="#38bdf8"
              strokeWidth={2.4}
              dot={false}
              activeDot={{ r: 4, fill: "#ffffff" }}
              connectNulls={false}
            />
          </LineChart>
        ) : (
          <AreaChart
            data={detail.history}
            margin={{ top: 12, right: 14, left: 2, bottom: 4 }}
          >
            {axes}
            {tooltip}
            <Area
              type="monotone"
              dataKey="rain_1d"
              name="Precipitation"
              stroke="#06b6d4"
              strokeWidth={1.8}
              fill="#06b6d4"
              fillOpacity={0.18}
              activeDot={{ r: 4, fill: "#ffffff" }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function HistoryPanel({ detail, stationName }: Props) {
  const [expanded, setExpanded] = useState<ChartKind | null>(null);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const title = `${stationName || "Station"} (${detail.station_code})`;
  const chartTitle = expanded === "water" ? "Water Level" : "Daily Precipitation";

  return (
    <>
      <section className="panel history-panel">
        <div className="panel-header">
          <div>
            <h2>Historical Telemetry</h2>
            <span className="panel-subtitle">{title}</span>
          </div>
          <div className="glass-badge">
            <span className="badge-dot-blue" />
            <span>Last {detail.history.length} records</span>
          </div>
        </div>

        <div className="chart-grid">
          <ChartCard kind="water" detail={detail} onExpand={() => setExpanded("water")} />
          <ChartCard kind="rain" detail={detail} onExpand={() => setExpanded("rain")} />
        </div>
      </section>

      {expanded && (
        <div className="station-modal-backdrop" onMouseDown={() => setExpanded(null)}>
          <section
            className="history-modal single-chart-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${chartTitle} chart for ${title}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="station-modal-header">
              <div>
                <h2>{chartTitle}</h2>
                <span className="modal-subtitle">
                  {title} · {detail.history.length} chronological records
                </span>
              </div>
              <button
                className="glass-icon-btn close-btn"
                onClick={() => setExpanded(null)}
                aria-label="Close chart"
              >
                <HiXMark size={18} color="#e4e4e7" />
              </button>
            </div>
            <div className="single-chart-wrap">
              <ChartCard kind={expanded} detail={detail} large />
            </div>
          </section>
        </div>
      )}
    </>
  );
}
