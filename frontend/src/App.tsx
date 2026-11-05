import { useEffect, useMemo, useState } from "react";
import { AppFooter } from "./components/AppFooter";
import { ErrorBanner } from "./components/ErrorBanner";
import { HistoryPanel } from "./components/HistoryPanel";
import { MetricsGrid } from "./components/MetricsGrid";
import { ModelPerformance } from "./components/ModelPerformance";
import { OverviewPage } from "./components/OverviewPage";
import { PageHeading } from "./components/PageHeading";
import { Sidebar } from "./components/Sidebar";
import { StationDirectory } from "./components/StationDirectory";
import { Topbar } from "./components/Topbar";
import { TbRadar } from "./components/icons";
import { api } from "./lib/api";
import { downloadStations } from "./lib/csv";
import { formatDate } from "./lib/format";
import { DEFAULT_THRESHOLDS, isAlert } from "./lib/threshold";
import type {
  AppPage,
  ModelMetric,
  ModelName,
  Overview,
  RiskFilter,
  Station,
  StationDetail,
} from "./types";

function App() {
  const [model, setModel] = useState<ModelName>("Random Forest");
  const [threshold, setThreshold] = useState(
    DEFAULT_THRESHOLDS["Random Forest"],
  );
  const [overview, setOverview] = useState<Overview | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [detail, setDetail] = useState<StationDetail | null>(null);
  const [metrics, setMetrics] = useState<ModelMetric[]>([]);
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [activePage, setActivePage] = useState<AppPage>("overview");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  function handleModelChange(next: ModelName) {
    setModel(next);
    setThreshold(DEFAULT_THRESHOLDS[next]);
  }

  useEffect(() => {
    let alive = true;
    setBusy(true);
    setError("");
    Promise.all([
      api<Overview>(`/api/overview?model=${encodeURIComponent(model)}`),
      api<Station[]>(
        `/api/stations?model=${encodeURIComponent(model)}&limit=2000`,
      ),
      api<{ available: boolean; models: ModelMetric[] }>("/api/model-metrics"),
    ])
      .then(([ov, st, mt]) => {
        if (!alive) return;
        setOverview(ov);
        setStations(st);
        setMetrics(mt.models ?? []);
        setSelectedCode((old) =>
          old && st.some((s) => s.station_code === old)
            ? old
            : (st[0]?.station_code ?? null),
        );
      })
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
  }, [model]);

  useEffect(() => {
    if (!selectedCode) {
      setDetail(null);
      return;
    }
    let alive = true;
    api<StationDetail>(
      `/api/stations/${encodeURIComponent(selectedCode)}?model=${encodeURIComponent(model)}`,
    )
      .then((result) => alive && setDetail(result))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [selectedCode, model]);

  const filteredStations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stations.filter((s) => {
      const matches =
        !q || `${s.station_code} ${s.station_name}`.toLowerCase().includes(q);
      const alert = isAlert(s.probability, threshold);
      const riskMatches =
        riskFilter === "all" || (riskFilter === "alert" ? alert : !alert);
      return matches && riskMatches;
    });
  }, [stations, query, riskFilter, threshold]);

  const alertCount = useMemo(
    () => stations.filter((s) => isAlert(s.probability, threshold)).length,
    [stations, threshold],
  );

  const selectedStation =
    stations.find((s) => s.station_code === selectedCode) ?? null;
  const validMapStations = filteredStations.filter((s) => {
    const lat = s.lat ?? s.lat_meta;
    const lon = s.lon ?? s.lon_meta;
    return (
      typeof lat === "number" &&
      typeof lon === "number" &&
      Number.isFinite(lat) &&
      Number.isFinite(lon)
    );
  });

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="main-content">
        <Topbar activePage={activePage} />

        <div className="page-wrap">
          {error && (
            <ErrorBanner message={error} onDismiss={() => setError("")} />
          )}

          <PageHeading
            activePage={activePage}
            model={model}
            onModelChange={handleModelChange}
            threshold={threshold}
            onThresholdChange={setThreshold}
          />

          {busy && (
            <div className="loading-panel">
              <div className="spinner" /> Loading station telemetry…
            </div>
          )}

          {!busy && !error && overview && (
            <>
              <div className="telemetry-bar">
                <span className="telemetry-stat">
                  <TbRadar size={15} color="#38bdf8" />
                  Telemetry Date: <strong>{formatDate(overview.latest_data_date)}</strong>
                </span>
                <span className="telemetry-stat">
                  Model: <strong>{model}</strong>
                </span>
              </div>

              {activePage !== "models" && (
                <MetricsGrid
                  overview={overview}
                  threshold={threshold}
                  alertCount={alertCount}
                  stations={stations}
                />
              )}

              {activePage === "overview" && (
                <OverviewPage
                  mapStations={validMapStations}
                  rankedStations={filteredStations}
                  selectedStation={selectedStation}
                  selectedCode={selectedCode}
                  detail={detail}
                  query={query}
                  riskFilter={riskFilter}
                  threshold={threshold}
                  onQueryChange={setQuery}
                  onRiskFilterChange={setRiskFilter}
                  onSelect={setSelectedCode}
                  onDownload={() =>
                    downloadStations(filteredStations, threshold)
                  }
                  onNavigate={setActivePage}
                />
              )}

              {activePage === "stations" && (
                <StationDirectory
                  stations={filteredStations}
                  selectedCode={selectedCode}
                  query={query}
                  riskFilter={riskFilter}
                  threshold={threshold}
                  onQueryChange={setQuery}
                  onRiskFilterChange={setRiskFilter}
                  onSelect={setSelectedCode}
                  onDownload={() =>
                    downloadStations(filteredStations, threshold)
                  }
                />
              )}

              {activePage === "models" && (
                <ModelPerformance metrics={metrics} />
              )}

              {activePage !== "models" && detail && (
                <HistoryPanel
                  detail={detail}
                  stationName={selectedStation?.station_name}
                />
              )}
            </>
          )}

          <AppFooter />
        </div>
      </main>
    </div>
  );
}

export default App;
