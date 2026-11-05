import type { ReactNode } from "react";

export function MetricCard({
  icon,
  label,
  value,
  foot,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  foot: string;
  tone: "blue" | "red" | "green" | "violet" | "amber";
}) {
  return (
    <div className={`metric-card tone-${tone}`}>
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <span className={`metric-icon-badge ${tone}`}>{icon}</span>
      </div>
      <div className="metric-value-wrap">
        <strong className="metric-value">{value}</strong>
      </div>
      <div className="metric-foot">
        <span className={`metric-indicator-dot ${tone}`} />
        <span className="metric-foot-text">{foot}</span>
      </div>
    </div>
  );
}
