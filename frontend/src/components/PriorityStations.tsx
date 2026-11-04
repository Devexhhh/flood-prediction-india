import { ArrowUpRight, Download } from "lucide-react";
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
          <div className="panel-kicker">PRIORITY REVIEW</div>
          <h2>Highest model scores</h2>
          <p>Stations ranked by selected model</p>
        </div>
        <button
          className="icon-button"
          onClick={onDownload}
          title="Download CSV"
        >
          <Download size={17} />
        </button>
      </div>
      <div className="mini-list">
        {stations.slice(0, 6).map((s, i) => (
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
              <small
                className={
                  isAlert(s.probability, threshold)
                    ? "text-danger"
                    : "text-safe"
                }
              >
                {isAlert(s.probability, threshold)
                  ? "Above threshold"
                  : "Below threshold"}
              </small>
            </span>
          </button>
        ))}
      </div>
      <button className="panel-link" onClick={() => onNavigate("stations")}>
        View all stations <ArrowUpRight size={15} />
      </button>
    </div>
  );
}
