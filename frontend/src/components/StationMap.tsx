import { useEffect } from "react";
import {
  Circle,
  MapContainer,
  TileLayer,
  Tooltip as MapTooltip,
  useMap,
} from "react-leaflet";
import { HiArrowUpRight, TbRadar } from "./icons";
import { pct } from "../lib/format";
import { isAlert } from "../lib/threshold";
import type { AppPage, RiskFilter, Station } from "../types";
import { StationFilters } from "./StationFilters";

function MapFocus({ station }: { station?: Station | null }) {
  const map = useMap();
  useEffect(() => {
    const lat = station?.lat ?? station?.lat_meta;
    const lon = station?.lon ?? station?.lon_meta;
    if (typeof lat === "number" && typeof lon === "number")
      map.flyTo([lat, lon], 7, { duration: 0.7 });
  }, [map, station]);
  return null;
}

export function StationMap({
  stations,
  selectedStation,
  selectedCode,
  query,
  riskFilter,
  onQueryChange,
  onRiskFilterChange,
  threshold,
  onSelect,
  onNavigate,
}: {
  stations: Station[];
  selectedStation: Station | null;
  selectedCode: string | null;
  query: string;
  riskFilter: RiskFilter;
  threshold: number;
  onQueryChange: (value: string) => void;
  onRiskFilterChange: (value: RiskFilter) => void;
  onSelect: (code: string) => void;
  onNavigate: (page: AppPage) => void;
}) {
  return (
    <div className="panel map-panel">
      <div className="panel-header">
        <div className="map-title-row">
          <span className="glass-indicator-icon">
            <TbRadar size={18} color="#38bdf8" />
          </span>
          <div>
            <h2>Station Network</h2>
            <span className="panel-subtitle">Geospatial risk distribution</span>
          </div>
        </div>
        <div className="glass-badge">
          <span className="badge-dot-green" />
          <span>{stations.length} Mapped</span>
        </div>
      </div>

      <StationFilters
        className="map-filters"
        query={query}
        riskFilter={riskFilter}
        onQueryChange={onQueryChange}
        onRiskFilterChange={onRiskFilterChange}
        searchPlaceholder="Filter by station name or code…"
        allLabel="All Classifications"
      />

      <div className="map-frame">
        <MapContainer
          center={[22.5, 79]}
          zoom={4}
          minZoom={3}
          maxZoom={12}
          scrollWheelZoom
          className="india-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFocus station={selectedStation} />
          {stations.map((s) => {
            const lat = (s.lat ?? s.lat_meta) as number;
            const lon = (s.lon ?? s.lon_meta) as number;
            const alert = isAlert(s.probability, threshold);
            return (
              <Circle
                key={s.station_code}
                center={[lat, lon]}
                radius={selectedCode === s.station_code ? 9500 : 4800}
                pathOptions={{
                  color:
                    selectedCode === s.station_code
                      ? "#ffffff"
                      : alert
                        ? "#ef4444"
                        : "#10b981",
                  fillColor: alert ? "#ef4444" : "#10b981",
                  fillOpacity: selectedCode === s.station_code ? 0.95 : 0.75,
                  weight: selectedCode === s.station_code ? 2.5 : 1,
                }}
                eventHandlers={{
                  click: () => onSelect(s.station_code),
                }}
              >
                <MapTooltip direction="top">
                  <div className="map-tooltip">
                    <strong>{s.station_name}</strong>
                    <span className="map-tooltip-code">{s.station_code}</span>
                    <div className="map-tooltip-score">
                      <span>Exceedance Risk:</span>
                      <strong>{pct(s.probability)}</strong>
                    </div>
                  </div>
                </MapTooltip>
              </Circle>
            );
          })}
        </MapContainer>

        <div className="map-legend">
          <span>
            <i className="legend-dot danger" /> Alert Exceedance
          </span>
          <span>
            <i className="legend-dot safe" /> Normal Margin
          </span>
        </div>
      </div>

      <div className="panel-footer">
        <span className="footer-meta">India Hydrological Telemetry</span>
        <button
          className="text-button"
          onClick={() => onNavigate("stations")}
        >
          <span>Station Explorer</span>
          <HiArrowUpRight size={14} color="#38bdf8" />
        </button>
      </div>
    </div>
  );
}
