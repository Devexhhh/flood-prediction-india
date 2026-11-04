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
  tone: string;
}) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <span className={`metric-icon ${tone}`}>{icon}</span>
      </div>
      <strong className="metric-value">{value}</strong>
      <div className="metric-foot">
        <span className={`metric-dot ${tone}`} />
        {foot}
      </div>
    </div>
  );
}
