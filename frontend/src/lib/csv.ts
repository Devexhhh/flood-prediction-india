import type { Station } from "../types";
import { isAlert } from "./threshold";

export function downloadStations(stations: Station[], threshold: number) {
  const headers = [
    "station_code",
    "station_name",
    "date",
    "probability",
    "threshold",
    "predicted_exceedance",
    "lat",
    "lon",
  ];
  const csv = [
    headers.join(","),
    ...stations.map((s) => {
      const row: Record<string, unknown> = {
        ...s,
        threshold,
        predicted_exceedance: isAlert(s.probability, threshold),
      };
      return headers
        .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
        .join(",");
    }),
  ].join("\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "flood-risk-stations.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
