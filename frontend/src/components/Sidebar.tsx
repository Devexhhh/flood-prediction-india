import {
  RiDashboardLine,
  RiCpuLine,
  PhMapPin,
  TbRadar,
} from "./icons";
import type { AppPage } from "../types";

const NAV = [
  { id: "overview" as AppPage, label: "Overview", icon: RiDashboardLine, color: "#3b82f6" },
  { id: "stations" as AppPage, label: "Station Explorer", icon: PhMapPin, color: "#10b981" },
  { id: "models" as AppPage, label: "Model Evaluation", icon: RiCpuLine, color: "#a855f7" },
];

export function Sidebar({
  activePage,
  onNavigate,
}: {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <TbRadar size={22} color="#38bdf8" />
        </div>
        <div className="brand-text">
          <strong>RIVERWATCH</strong>
          <small>HYDRO ANALYTICS</small>
        </div>
      </div>

      <div className="workspace-label">MONITORING</div>

      <nav className="nav-list">
        {NAV.map(({ id, label, icon: Icon, color }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              className={isActive ? "nav-item active" : "nav-item"}
              onClick={() => onNavigate(id)}
            >
              <span
                className="nav-icon-wrap"
                style={{
                  color: isActive ? color : "#71717a",
                  borderColor: isActive ? `${color}40` : "transparent",
                  background: isActive ? `${color}18` : "transparent",
                }}
              >
                <Icon size={17} color={isActive ? color : "#a1a1aa"} />
              </span>
              <span className="nav-label">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="system-telemetry-card">
          <div className="telemetry-header">
            <span className="pulse-indicator"></span>
            <strong>India Network</strong>
          </div>
          <div className="telemetry-meta">
            <span>CWC Hydrometry Pipeline</span>
            <code>Active · 1,400+ Stns</code>
          </div>
        </div>
      </div>
    </aside>
  );
}
