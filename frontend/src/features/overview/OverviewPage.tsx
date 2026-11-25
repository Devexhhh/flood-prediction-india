import type { Station, StationDetail } from "../../types";
import { HistoryChart } from "./HistoryChart";
import { PriorityList } from "./PriorityList";
import { StationCard } from "./StationCard";
import { StationMap } from "./StationMap";

export function OverviewPage({
  stations,
  threshold,
  selectedCode,
  selectedStation,
  detail,
  detailLoading,
  onSelect,
  onViewAll,
}: {
  stations: Station[];
  threshold: number;
  selectedCode: string | null;
  selectedStation: Station | null;
  detail: StationDetail | null;
  detailLoading: boolean;
  onSelect: (code: string) => void;
  onViewAll: () => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <StationMap
        stations={stations}
        threshold={threshold}
        selectedCode={selectedCode}
        selectedStation={selectedStation}
        onSelect={onSelect}
      />
      <PriorityList
        stations={stations}
        threshold={threshold}
        selectedCode={selectedCode}
        onSelect={onSelect}
        onViewAll={onViewAll}
      />
      <HistoryChart detail={detail} stationName={selectedStation?.station_name} />
      <StationCard station={selectedStation} detail={detail} threshold={threshold} loading={detailLoading} />
    </div>
  );
}
