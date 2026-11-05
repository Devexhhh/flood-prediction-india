import { TbDatabaseExport, HiArrowUpRight } from "./icons";
import { formatDate, pct } from "../lib/format";
import { isAlert } from "../lib/threshold";
import type { RiskFilter, Station } from "../types";
import { StationFilters } from "./StationFilters";

export function StationDirectory({
  stations,
  selectedCode,
  query,
  riskFilter,
  onQueryChange,
  onRiskFilterChange,
  threshold,
  onSelect,
  onDownload,
}: {
  stations: Station[];
  selectedCode: string | null;
  query: string;
  riskFilter: RiskFilter;
  threshold: number;
  onQueryChange: (value: string) => void;
  onRiskFilterChange: (value: RiskFilter) => void;
  onSelect: (code: string) => void;
  onDownload: () => void;
}) {
  return (
    <section className="panel full-panel">
      <div className="panel-header">
        <div>
          <h2>Station Directory</h2>
          <span className="panel-subtitle">Monitored hydrometric telemetry</span>
        </div>
        <button className="glass-action-btn" onClick={onDownload}>
          <TbDatabaseExport size={16} color="#34d399" />
          <span>Export CSV</span>
        </button>
      </div>

      <StationFilters
        className="table-tools"
        query={query}
        riskFilter={riskFilter}
        onQueryChange={onQueryChange}
        onRiskFilterChange={onRiskFilterChange}
        searchPlaceholder="Search by station name or code…"
        allLabel="All Classifications"
      />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Station</th>
              <th>Code</th>
              <th>Observation Date</th>
              <th>Risk Score</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stations.slice(0, 300).map((s) => {
              const alert = isAlert(s.probability, threshold);
              return (
                <tr
                  key={s.station_code}
                  onClick={() => onSelect(s.station_code)}
                  className={selectedCode === s.station_code ? "row-selected" : ""}
                >
                  <td>
                    <strong>{s.station_name || s.station_code}</strong>
                  </td>
                  <td className="code-cell">{s.station_code}</td>
                  <td className="date-cell">{formatDate(s.date)}</td>
                  <td>
                    <div className="score-cell">
                      <strong>{pct(s.probability)}</strong>
                      <div className="table-track">
                        <i
                          style={{
                            width: `${s.probability * 100}%`,
                            background: alert ? "#ef4444" : "#10b981",
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-chip ${alert ? "danger-chip" : "safe-chip"}`}
                    >
                      <span className={`status-dot ${alert ? "dot-danger" : "dot-safe"}`} />
                      {alert ? "Exceedance Alert" : "Normal Margin"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="glass-icon-btn small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(s.station_code);
                      }}
                      aria-label="Inspect Station"
                    >
                      <HiArrowUpRight size={14} color="#38bdf8" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="panel-footer">
        <span className="footer-meta">
          Showing {Math.min(stations.length, 300)} of {stations.length} stations
        </span>
        <span className="footer-submeta">Hydrometric Telemetry</span>
      </div>
    </section>
  );
}
