import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useDashboardData, useStationDetail } from "../../hooks/useDashboardData";
import { downloadStations } from "../../lib/csv";
import { DEFAULT_THRESHOLDS, isAlert } from "../../lib/threshold";
import type { AppPage, ModelName, RiskFilter } from "../../types";
import { ModelsPage } from "../models/ModelsPage";
import { OverviewPage } from "../overview/OverviewPage";
import { StationsPage } from "../stations/StationsPage";
import { CommandMenu } from "./CommandMenu";
import { Controls } from "./Controls";
import { KpiGrid } from "./KpiGrid";
import { PAGE_META } from "./pageMeta";
import { Sidebar } from "./Sidebar";
import { ErrorState, LoadingState } from "./States";
import { Topbar } from "./Topbar";

export function Dashboard({
  page,
  navigate,
}: {
  page: AppPage;
  navigate: (page: AppPage) => void;
}) {
  const [model, setModel] = useState<ModelName>("Random Forest");
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLDS["Random Forest"]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [commandOpen, setCommandOpen] = useState(false);

  const { overview, stations, metrics, busy, slow, error, setError, retry } = useDashboardData(model);
  const { detail, loading: detailLoading } = useStationDetail(selectedCode, model);

  function changeModel(next: ModelName) {
    setModel(next);
    setThreshold(DEFAULT_THRESHOLDS[next]);
  }

  // Keep a valid selection when the station list changes.
  useEffect(() => {
    if (!stations.length) return;
    setSelectedCode((old) =>
      old && stations.some((s) => s.station_code === old)
        ? old
        : [...stations].sort((a, b) => b.probability - a.probability)[0].station_code,
    );
  }, [stations]);

  // ⌘K / Ctrl+K or "/" opens the command menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sorted = useMemo(
    () => [...stations].sort((a, b) => b.probability - a.probability),
    [stations],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((s) => {
      const matches = !q || `${s.station_code} ${s.station_name}`.toLowerCase().includes(q);
      const alert = isAlert(s.probability, threshold);
      return matches && (riskFilter === "all" || (riskFilter === "alert" ? alert : !alert));
    });
  }, [sorted, query, riskFilter, threshold]);

  const alertCount = useMemo(
    () => stations.filter((s) => isAlert(s.probability, threshold)).length,
    [stations, threshold],
  );

  const selectedStation = stations.find((s) => s.station_code === selectedCode) ?? null;
  const meta = PAGE_META[page];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        page={page}
        alertCount={busy ? null : alertCount}
        latestDate={overview?.latest_data_date}
        stationCount={overview?.station_count}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          page={page}
          model={model}
          onModelChange={changeModel}
          onOpenCommand={() => setCommandOpen(true)}
        />

        <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-4 py-6 sm:px-7">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.45 }}
              className="flex flex-col gap-1.5"
            >
              <h1 className="m-0 text-[28px] font-semibold tracking-[-0.035em]">{meta.title}</h1>
              <p className="m-0 text-sm text-muted-foreground">{meta.subtitle}</p>
            </motion.div>
            {page !== "models" && (
              <Controls model={model} threshold={threshold} onThresholdChange={setThreshold} />
            )}
          </div>

          {error && <ErrorState message={error} onRetry={retry} onDismiss={() => setError("")} />}

          {busy && !error && <LoadingState slow={slow} />}

          {!busy && !error && overview && (
            <>
              {page !== "models" && (
                <KpiGrid
                  stationCount={overview.station_count}
                  alertCount={alertCount}
                  stations={sorted}
                  threshold={threshold}
                />
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
                  className="flex flex-col gap-5"
                >
                  {page === "overview" && (
                    <OverviewPage
                      stations={filtered}
                      threshold={threshold}
                      selectedCode={selectedCode}
                      selectedStation={selectedStation}
                      detail={detail}
                      detailLoading={detailLoading}
                      onSelect={setSelectedCode}
                      onViewAll={() => navigate("stations")}
                    />
                  )}
                  {page === "stations" && (
                    <StationsPage
                      stations={filtered}
                      total={stations.length}
                      threshold={threshold}
                      query={query}
                      riskFilter={riskFilter}
                      selectedCode={selectedCode}
                      selectedStation={selectedStation}
                      detail={detail}
                      detailLoading={detailLoading}
                      onQueryChange={setQuery}
                      onRiskFilterChange={setRiskFilter}
                      onSelect={setSelectedCode}
                      onDownload={() => downloadStations(filtered, threshold)}
                    />
                  )}
                  {page === "models" && (
                    <ModelsPage metrics={metrics} model={model} onModelChange={changeModel} />
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}

          <footer className="flex flex-wrap justify-between gap-2 pt-2 pb-3 text-xs text-muted-foreground">
            <span>Station-level danger-threshold prediction. Not an inundation forecast.</span>
            <span>Data: Central Water Commission, India</span>
          </footer>
        </main>
      </div>

      <CommandMenu
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        stations={sorted}
        threshold={threshold}
        onSelectStation={(code) => {
          setSelectedCode(code);
          if (page === "models") navigate("overview");
        }}
        onNavigate={navigate}
      />
    </div>
  );
}
