import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  Circle,
  MapContainer,
  TileLayer,
  Tooltip as MapTooltip,
  useMap,
} from "react-leaflet";
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
        <div>
          <div className="panel-kicker">GEOSPATIAL MONITORING</div>
          <h2>India station network</h2>
          <p>Explore station-level model scores</p>
        </div>
        <span className="live-badge">
          <i /> {stations.length} mapped
        </span>
      </div>
      <StationFilters
        className="map-filters"
        query={query}
        riskFilter={riskFilter}
        onQueryChange={onQueryChange}
        onRiskFilterChange={onRiskFilterChange}
        searchPlaceholder="Search station or code…"
        allLabel="All stations"
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
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
                radius={selectedCode === s.station_code ? 9000 : 4500}
                pathOptions={{
                  color:
                    selectedCode === s.station_code
                      ? "#ffffff"
                      : alert
                        ? "#ff667e"
                        : "#43d6ad",
                  fillColor: alert ? "#ff667e" : "#43d6ad",
                  fillOpacity: selectedCode === s.station_code ? 0.95 : 0.7,
                  weight: selectedCode === s.station_code ? 2 : 1,
                }}
                eventHandlers={{
                  click: () => onSelect(s.station_code),
                }}
              >
                <MapTooltip direction="top">
                  <div className="map-tooltip">
                    <strong>{s.station_name}</strong>
                    <br />
                    {s.station_code}
                    <br />
                    Score: {pct(s.probability)}
                  </div>
                </MapTooltip>
              </Circle>
            );
          })}
        </MapContainer>
        <div className="map-legend">
          <span>
            <i className="legend-dot danger" /> Above threshold
          </span>
          <span>
            <i className="legend-dot safe" /> Below threshold
          </span>
        </div>
      </div>
      <div className="panel-footer">
        <span>Source: processed station dataset</span>
        <button
          className="text-button"
          onClick={() => onNavigate("stations")}
        >
          Explore stations <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}
