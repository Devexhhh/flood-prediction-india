import { RiDashboardLine, TbRadar } from "./icons";
import type { AppPage } from "../types";

const PAGE_LABEL: Record<AppPage, string> = {
  overview: "National Overview",
  stations: "Station Explorer",
  models: "Model Evaluation",
};

export function Topbar({ activePage }: { activePage: AppPage }) {
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <TbRadar size={18} color="#38bdf8" />
        <span>RIVERWATCH</span>
      </div>

      <div className="breadcrumb">
        <span>RiverWatch</span>
        <span className="breadcrumb-separator">/</span>
        <strong>{PAGE_LABEL[activePage]}</strong>
      </div>

      <div className="top-actions">
        <div className="system-pill">
          <span className="live-dot" />
          <span>Telemetry Stream Active</span>
        </div>
      </div>
    </header>
  );
}
