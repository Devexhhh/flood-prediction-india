import { Search } from "lucide-react";
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
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={searchPlaceholder}
        />
      </div>
      <select
        value={riskFilter}
        onChange={(e) => onRiskFilterChange(e.target.value as RiskFilter)}
      >
        <option value="all">{allLabel}</option>
        <option value="alert">Above threshold</option>
        <option value="watch">Below threshold</option>
      </select>
    </div>
  );
}
