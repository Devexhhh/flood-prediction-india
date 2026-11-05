import { TbDatabaseExport, HiArrowUpRight } from "./icons";
import { pct } from "../lib/format";
import { isAlert } from "../lib/threshold";
import type { AppPage, Station } from "../types";

export function PriorityStations({
  stations,
  selectedCode,
  threshold,
  onSelect,
  onDownload,
  onNavigate,
}: {
  stations: Station[];
  selectedCode: string | null;
  threshold: number;
  onSelect: (code: string) => void;
  onDownload: () => void;
  onNavigate: (page: AppPage) => void;
}) {
  return (
    <div className="panel station-panel">
      <div className="panel-header">
        <div>
          <h2>Priority Stations</h2>
          <span className="panel-subtitle">Ranked by exceedance probability</span>
        </div>
        <button
          className="glass-icon-btn"
          onClick={onDownload}
          title="Export CSV"
          aria-label="Export CSV"
        >
          <TbDatabaseExport size={16} color="#60a5fa" />
        </button>
      </div>

      <div className="mini-list">
        {stations.slice(0, 6).map((s, i) => {
          const alert = isAlert(s.probability, threshold);
          return (
            <button
              className={`mini-station ${selectedCode === s.station_code ? "selected" : ""}`}
              key={s.station_code}
              onClick={() => onSelect(s.station_code)}
            >
              <span className={`rank rank-${i + 1}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mini-name">
                <strong>{s.station_name || s.station_code}</strong>
                <small>{s.station_code}</small>
              </span>
              <span className="mini-score">
                <strong>{pct(s.probability)}</strong>
                <span className={`mini-status-chip ${alert ? "chip-danger" : "chip-safe"}`}>
                  <span className={`status-dot ${alert ? "dot-danger" : "dot-safe"}`} />
                  {alert ? "Alert" : "Normal"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button className="panel-footer-btn" onClick={() => onNavigate("stations")}>
        <span>Open Station Directory</span>
        <HiArrowUpRight size={15} color="#38bdf8" />
      </button>
    </div>
  );
}
