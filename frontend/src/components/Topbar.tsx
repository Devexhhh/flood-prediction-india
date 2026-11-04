import { CircleHelp, Waves } from "lucide-react";
import type { AppPage } from "../types";

const PAGE_LABEL: Record<AppPage, string> = {
  overview: "National overview",
  stations: "Station explorer",
  models: "Model performance",
};

export function Topbar({ activePage }: { activePage: AppPage }) {
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <Waves size={20} /> RIVERWATCH
      </div>
      <div className="breadcrumb">
        Monitoring <span>/</span> <strong>{PAGE_LABEL[activePage]}</strong>
      </div>
      <div className="top-actions">
        <span className="system-status">
          <i /> API workspace
        </span>
        <button className="icon-button" title="About this dashboard">
          <CircleHelp size={18} />
        </button>
      </div>
    </header>
  );
}
