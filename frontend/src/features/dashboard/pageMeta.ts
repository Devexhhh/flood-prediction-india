import type { AppPage } from "../../types";

export const PAGE_META: Record<AppPage, { title: string; subtitle: string }> = {
  overview: {
    title: "National overview",
    subtitle: "Next-day danger-level exceedance risk across monitored stations",
  },
  stations: {
    title: "Station explorer",
    subtitle: "Search, filter and export station risk scores",
  },
  models: {
    title: "Model evaluation",
    subtitle: "Chronological test set, thresholds chosen on validation data",
  },
};
