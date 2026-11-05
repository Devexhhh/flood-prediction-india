import { useEffect, useState } from "react";
import {
  TbWaterRipple,
  HiArrowsPointingOut,
  HiArrowUpRight,
  HiXMark,
} from "./icons";
import { pct } from "../lib/format";
import { formatThresholdPct, isAlert } from "../lib/threshold";
import type { AppPage, Station, StationDetail } from "../types";

type Props = {
  detail: StationDetail | null;
  selectedStation: Station | null;
  threshold: number;
  onNavigate: (page: AppPage) => void;
};

function DiagnosticTable({
  detail,
  threshold,
}: {
  detail: StationDetail;
  threshold: number;
}) {
  const rows = [
    [
      "Current water level",
      detail.water_level == null ? "—" : `${detail.water_level.toFixed(2)} m`,
    ],
    [
      "Warning level",
      detail.warning_level == null
        ? "—"
        : `${detail.warning_level.toFixed(2)} m`,
    ],
    [
      "Danger level",
      detail.danger_level == null
        ? "—"
        : `${detail.danger_level.toFixed(2)} m`,
    ],
    [
      "1-day delta",
      detail.level_change_1d == null
        ? "—"
        : `${detail.level_change_1d >= 0 ? "+" : ""}${detail.level_change_1d.toFixed(2)} m`,
    ],
    [
      "3-day delta",
      detail.level_change_3d == null
        ? "—"
        : `${detail.level_change_3d >= 0 ? "+" : ""}${detail.level_change_3d.toFixed(2)} m`,
    ],
    [
      "7-day rainfall",
      detail.rain_7d == null ? "—" : `${detail.rain_7d.toFixed(1)} mm`,
    ],
    ["Model", detail.model],
    ["Threshold cutoff", formatThresholdPct(threshold)],
  ];

  return (
    <div className="diagnostic-table" role="table">
      <div className="diagnostic-head" role="row">
        <span>Parameter</span>
        <span>Value</span>
      </div>
      {rows.map(([parameter, value]) => (
        <div className="diagnostic-row" role="row" key={parameter}>
          <span>{parameter}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function StationDiagnostic({
  detail,
  threshold,
  onNavigate,
  expanded,
}: Props & { detail: StationDetail; expanded?: boolean }) {
  const alert = isAlert(detail.probability, threshold);
  return (
    <>
      <div className="probability-row">
        <div>
          <span className="prob-label">Exceedance Probability</span>
          <strong className="prob-value">{pct(detail.probability)}</strong>
        </div>
        <span
          className={`status-chip ${alert ? "danger-chip" : "safe-chip"}`}
        >
          <span className={`status-dot ${alert ? "dot-danger" : "dot-safe"}`} />
          {alert ? "Alert Active" : "Normal Margin"}
        </span>
      </div>

      <div className="probability-track">
        <span
          style={{
            width: `${Math.max(0, Math.min(100, detail.probability * 100))}%`,
            background: alert ? "#ef4444" : "#10b981",
            boxShadow: alert
              ? "0 0 12px rgba(239, 68, 68, 0.5)"
              : "0 0 12px rgba(16, 185, 129, 0.4)",
          }}
        />
      </div>

      <DiagnosticTable detail={detail} threshold={threshold} />

      {!expanded && (
        <button
          className="panel-footer-btn"
          onClick={() => onNavigate("stations")}
        >
          <span>Open Station Explorer</span>
          <HiArrowUpRight size={15} color="#38bdf8" />
        </button>
      )}
    </>
  );
}

export function SelectedStationCard(props: Props) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const close = (event: KeyboardEvent) =>
      event.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const { detail, selectedStation } = props;
  const title =
    selectedStation?.station_name || detail?.station_code || "Select Station";

  return (
    <>
      <div className="panel selected-panel">
        <div className="panel-header">
          <div className="station-title-col">
            <h2>{title}</h2>
            <span className="panel-subtitle">
              {detail?.station_code ?? "Select a station from map or directory"}
            </span>
          </div>
          <div className="panel-header-actions">
            <span className="glass-indicator-icon">
              <TbWaterRipple size={18} color="#38bdf8" />
            </span>
            <button
              className="glass-icon-btn"
              onClick={() => setExpanded(true)}
              disabled={!detail}
              aria-label="Expand station diagnostics"
              title="Expand diagnostics"
            >
              <HiArrowsPointingOut size={15} color="#a1a1aa" />
            </button>
          </div>
        </div>

        {detail ? (
          <StationDiagnostic {...props} detail={detail} />
        ) : (
          <div className="empty-state">Select a station to inspect diagnostics.</div>
        )}
      </div>

      {expanded && detail && (
        <div
          className="station-modal-backdrop"
          onMouseDown={() => setExpanded(false)}
        >
          <section
            className="station-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Diagnostics for ${title}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="station-modal-header">
              <div>
                <h2>{title}</h2>
                <span className="modal-subtitle">
                  {detail.station_code} · Telemetry Date:{" "}
                  {new Date(detail.latest_date).toLocaleDateString("en-IN")}
                </span>
              </div>
              <button
                className="glass-icon-btn close-btn"
                onClick={() => setExpanded(false)}
                aria-label="Close"
              >
                <HiXMark size={18} color="#e4e4e7" />
              </button>
            </div>
            <StationDiagnostic {...props} detail={detail} expanded />
          </section>
        </div>
      )}
    </>
  );
}
