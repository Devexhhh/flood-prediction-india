import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { ModelMetric, ModelName, Overview, Station, StationDetail } from "../types";

/** Loads overview, stations and model metrics for the chosen model. */
export function useDashboardData(model: ModelName) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [metrics, setMetrics] = useState<ModelMetric[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setBusy(true);
    setError("");
    const m = encodeURIComponent(model);
    Promise.all([
      api<Overview>(`/api/overview?model=${m}`),
      api<Station[]>(`/api/stations?model=${m}&limit=2000`),
      api<{ available: boolean; models: ModelMetric[] }>("/api/model-metrics"),
    ])
      .then(([ov, st, mt]) => {
        if (!alive) return;
        setOverview(ov);
        setStations(st);
        setMetrics(mt.models ?? []);
      })
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
  }, [model, reloadKey]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  return { overview, stations, metrics, busy, error, setError, retry };
}

/** Loads one station's detail and history. */
export function useStationDetail(code: string | null, model: ModelName) {
  const [detail, setDetail] = useState<StationDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!code) {
      setDetail(null);
      return;
    }
    let alive = true;
    setLoading(true);
    api<StationDetail>(
      `/api/stations/${encodeURIComponent(code)}?model=${encodeURIComponent(model)}`,
    )
      .then((d) => alive && setDetail(d))
      .catch(() => alive && setDetail(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [code, model]);

  return { detail, loading };
}
