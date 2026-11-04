import { ArrowUpRight, Download } from "lucide-react";
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
          <div className="panel-kicker">STATION DIRECTORY</div>
          <h2>Monitored station predictions</h2>
          <p>Latest usable feature row per station</p>
        </div>
        <button className="secondary-button" onClick={onDownload}>
          <Download size={15} /> Export CSV
        </button>
      </div>
      <StationFilters
        className="table-tools"
        query={query}
        riskFilter={riskFilter}
        onQueryChange={onQueryChange}
        onRiskFilterChange={onRiskFilterChange}
        searchPlaceholder="Search by station name or code"
        allLabel="All classifications"
      />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Station</th>
              <th>Station code</th>
              <th>Latest data</th>
              <th>Model score</th>
              <th>Classification</th>
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
                <td>{formatDate(s.date)}</td>
                <td>
                  <strong>{pct(s.probability)}</strong>
                  <div className="table-track">
                    <i style={{ width: `${s.probability * 100}%` }} />
                  </div>
                </td>
                <td>
                  <span
                    className={`status-chip ${alert ? "danger-chip" : "safe-chip"}`}
                  >
                    {alert ? "Above threshold" : "Below threshold"}
                  </span>
                </td>
                <td>
                  <button
                    className="icon-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(s.station_code);
                    }}
                  >
                    <ArrowUpRight size={16} />
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="panel-footer">
        <span>
          Showing {Math.min(stations.length, 300)} of {stations.length} filtered
          stations
        </span>
        <span>Click a row to select it</span>
      </div>
    </section>
  );
}
