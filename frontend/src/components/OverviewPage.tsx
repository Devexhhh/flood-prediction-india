import type { AppPage, RiskFilter, Station, StationDetail } from "../types";
import { PriorityStations } from "./PriorityStations";
import { SelectedStationCard } from "./SelectedStationCard";
import { StationMap } from "./StationMap";

export function OverviewPage({
  mapStations,
  rankedStations,
  selectedStation,
  selectedCode,
  detail,
  query,
  riskFilter,
  onQueryChange,
  onRiskFilterChange,
  threshold,
  onSelect,
  onDownload,
  onNavigate,
}: {
  mapStations: Station[];
  rankedStations: Station[];
  selectedStation: Station | null;
  selectedCode: string | null;
  detail: StationDetail | null;
  query: string;
  riskFilter: RiskFilter;
  threshold: number;
  onQueryChange: (value: string) => void;
  onRiskFilterChange: (value: RiskFilter) => void;
  onSelect: (code: string) => void;
  onDownload: () => void;
  onNavigate: (page: AppPage) => void;
}) {
  return (
    <section className="content-grid">
      <StationMap
        stations={mapStations}
        selectedStation={selectedStation}
        selectedCode={selectedCode}
        query={query}
        riskFilter={riskFilter}
        threshold={threshold}
        onQueryChange={onQueryChange}
        onRiskFilterChange={onRiskFilterChange}
        onSelect={onSelect}
        onNavigate={onNavigate}
      />
      <div className="right-stack">
        <PriorityStations
          stations={rankedStations}
          selectedCode={selectedCode}
          threshold={threshold}
          onSelect={onSelect}
          onDownload={onDownload}
          onNavigate={onNavigate}
        />
        <SelectedStationCard
          detail={detail}
          selectedStation={selectedStation}
          threshold={threshold}
          onNavigate={onNavigate}
        />
      </div>
    </section>
  );
}
