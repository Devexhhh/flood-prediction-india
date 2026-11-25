import { Download, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Segmented } from "../../components/ui/segmented";
import { StatusBadge } from "../../components/ui/status-badge";
import { pct } from "../../lib/format";
import { isAlert } from "../../lib/threshold";
import { cn } from "../../lib/utils";
import type { RiskFilter, Station, StationDetail } from "../../types";
import { HistoryChart } from "../overview/HistoryChart";
import { StationCard } from "../overview/StationCard";

const PAGE_SIZE = 50;

export function StationsPage({
  stations,
  total,
  threshold,
  query,
  riskFilter,
  selectedCode,
  selectedStation,
  detail,
  detailLoading,
  onQueryChange,
  onRiskFilterChange,
  onSelect,
  onDownload,
}: {
  stations: Station[];
  total: number;
  threshold: number;
  query: string;
  riskFilter: RiskFilter;
  selectedCode: string | null;
  selectedStation: Station | null;
  detail: StationDetail | null;
  detailLoading: boolean;
  onQueryChange: (v: string) => void;
  onRiskFilterChange: (v: RiskFilter) => void;
  onSelect: (code: string) => void;
  onDownload: () => void;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  useEffect(() => setVisible(PAGE_SIZE), [query, riskFilter]);
  const rows = stations.slice(0, visible);

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-border p-3.5">
          <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-[10px] border border-border px-3 text-muted-foreground focus-within:border-muted-foreground">
            <Search size={15} />
            <span className="sr-only">Search stations</span>
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search by code or name"
              className="flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => onQueryChange("")} aria-label="Clear search" className="cursor-pointer rounded p-0.5 hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </label>
          <Segmented
            label="Status filter"
            value={riskFilter}
            onChange={onRiskFilterChange}
            options={[
              { value: "all", label: "All" },
              { value: "alert", label: "Alerts" },
              { value: "watch", label: "Watch" },
            ]}
          />
          <Button variant="outline" onClick={onDownload} disabled={!stations.length}>
            <Download size={15} /> Export CSV
          </Button>
        </div>

        <div className="max-h-[560px] overflow-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Station</th>
                <th className="w-[34%] px-4 py-3 font-medium">Exceedance probability</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Danger level</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const alert = isAlert(s.probability, threshold);
                const selected = s.station_code === selectedCode;
                const danger = s.danger_level ?? s.danger_level_meta;
                return (
                  <tr
                    key={s.station_code}
                    onClick={() => onSelect(s.station_code)}
                    className={cn("cursor-pointer border-t border-border transition-colors", selected ? "bg-muted" : "hover:bg-muted/60")}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.station_code}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(s.station_code);
                        }}
                        aria-pressed={selected}
                        className="cursor-pointer text-left hover:underline"
                      >
                        {s.station_name || "—"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5">
                        <span className="h-[5px] flex-1 overflow-hidden rounded-full bg-muted">
                          <span
                            className={cn("block h-full rounded-full transition-[width] duration-500", alert ? "bg-risk" : "bg-muted-foreground")}
                            style={{ width: `${s.probability * 100}%` }}
                          />
                        </span>
                        <span className="w-14 text-right font-mono text-[13px]">{pct(s.probability)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge alert={alert} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[13px]">
                      {typeof danger === "number" ? `${danger.toFixed(2)} m` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {stations.length === 0 && (
            <p className="m-0 p-10 text-center text-sm text-muted-foreground">No stations match this search.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>
            Showing {rows.length.toLocaleString("en-IN")} of {stations.length.toLocaleString("en-IN")}
            {stations.length !== total && ` (filtered from ${total.toLocaleString("en-IN")})`}
          </span>
          {visible < stations.length && (
            <Button variant="ghost" size="sm" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
              Show {Math.min(PAGE_SIZE, stations.length - visible)} more
            </Button>
          )}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <HistoryChart detail={detail} stationName={selectedStation?.station_name} />
        <StationCard station={selectedStation} detail={detail} threshold={threshold} loading={detailLoading} />
      </div>
    </>
  );
}
