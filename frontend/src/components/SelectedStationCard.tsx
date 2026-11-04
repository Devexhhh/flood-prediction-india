import { ArrowUpRight, Waves } from "lucide-react";
import { pct } from "../lib/format";
import { isAlert } from "../lib/threshold";
import type { AppPage, Station, StationDetail } from "../types";

export function SelectedStationCard({
  detail,
  selectedStation,
  threshold,
  onNavigate,
}: {
  detail: StationDetail | null;
  selectedStation: Station | null;
  threshold: number;
  onNavigate: (page: AppPage) => void;
}) {
  const latest = detail?.history[detail.history.length - 1];
  const alert = detail ? isAlert(detail.probability, threshold) : false;

  return (
    <div className="panel selected-panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">SELECTED STATION</div>
          <h2>{detail?.station_code ?? "Choose a station"}</h2>
          <p>
            {selectedStation?.station_name ??
              "Select a marker or station from the list"}
          </p>
        </div>
        <div className="selected-mark">
          <Waves size={18} />
        </div>
      </div>
      {detail ? (
        <>
          <div className="probability-row">
            <div>
              <span>Next-day exceedance score</span>
              <strong>{pct(detail.probability)}</strong>
            </div>
            <span
              className={
                alert ? "status-chip danger-chip" : "status-chip safe-chip"
              }
            >
              {alert ? "Above threshold" : "Below threshold"}
            </span>
          </div>
          <div className="probability-track">
            <span
              style={{
                width: `${Math.max(0, Math.min(100, detail.probability * 100))}%`,
                background: alert ? "#ff667e" : "#43d6ad",
              }}
            />
          </div>
          <div className="station-stats">
            <div>
              <small>Water level</small>
              <strong>{latest?.water_level?.toFixed(2) ?? "—"}</strong>
            </div>
            <div>
              <small>1-day rainfall</small>
              <strong>{latest?.rain_1d?.toFixed(1) ?? "—"}</strong>
            </div>
            <div>
              <small>Danger level</small>
              <strong>{detail.danger_level?.toFixed(2) ?? "—"}</strong>
            </div>
          </div>
          <button className="panel-link" onClick={() => onNavigate("stations")}>
            Open station details <ArrowUpRight size={15} />
          </button>
        </>
      ) : (
        <div className="empty-state">
          Choose a station to view its latest model score.
        </div>
      )}
    </div>
  );
}
