import { HiMagnifyingGlass, HiAdjustmentsHorizontal } from "./icons";
import type { RiskFilter } from "../types";

export function StationFilters({
  query,
  riskFilter,
  onQueryChange,
  onRiskFilterChange,
  className,
  searchPlaceholder,
  allLabel,
}: {
  query: string;
  riskFilter: RiskFilter;
  onQueryChange: (value: string) => void;
  onRiskFilterChange: (value: RiskFilter) => void;
  className: string;
  searchPlaceholder: string;
  allLabel: string;
}) {
  return (
    <div className={className}>
      <div className="search-box">
        <HiMagnifyingGlass size={16} color="#38bdf8" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={searchPlaceholder}
        />
      </div>
      <div className="filter-select-wrap">
        <HiAdjustmentsHorizontal size={14} color="#8b5cf6" className="filter-select-icon" />
        <select
          value={riskFilter}
          onChange={(e) => onRiskFilterChange(e.target.value as RiskFilter)}
        >
          <option value="all">{allLabel}</option>
          <option value="alert">Exceedance Alert</option>
          <option value="watch">Normal / Safe</option>
        </select>
      </div>
    </div>
  );
}
