import { CloudRain, Waves } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StationDetail } from "../types";

const TOOLTIP_STYLE = {
  background: "#101827",
  border: "1px solid #283449",
  borderRadius: 10,
};

export function HistoryPanel({ detail }: { detail: StationDetail }) {
  return (
    <section className="panel history-panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">HISTORICAL CONTEXT</div>
          <h2>Water level & rainfall trend</h2>
          <p>
            {detail.station_code} · Recent available station-day observations
          </p>
        </div>
        <span className="history-range">
          Last {detail.history.length} records
        </span>
      </div>
      <div className="chart-grid">
        <div className="chart-card">
          <h3>
            <Waves size={16} /> Water level
          </h3>
          <ResponsiveContainer width="100%" height={245}>
            <LineChart data={detail.history}>
              <CartesianGrid stroke="#263247" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#95a3b8", fontSize: 10 }}
                tickFormatter={(v) => String(v).slice(5, 10)}
                minTickGap={30}
              />
              <YAxis tick={{ fill: "#95a3b8", fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line
                type="monotone"
                dataKey="water_level"
                stroke="#8b9cff"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>
            <CloudRain size={16} /> Recent rainfall
          </h3>
          <ResponsiveContainer width="100%" height={245}>
            <AreaChart data={detail.history}>
              <CartesianGrid stroke="#263247" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#95a3b8", fontSize: 10 }}
                tickFormatter={(v) => String(v).slice(5, 10)}
                minTickGap={30}
              />
              <YAxis tick={{ fill: "#95a3b8", fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="rain_1d"
                stroke="#43d6ad"
                fill="#43d6ad"
                fillOpacity={0.16}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
