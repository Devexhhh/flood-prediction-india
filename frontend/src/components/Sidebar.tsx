import {
  BarChart3,
  ChevronDown,
  LayoutDashboard,
  MapPinned,
  ShieldCheck,
  Waves,
} from "lucide-react";
import type { AppPage } from "../types";

const NAV: { id: AppPage; label: string; icon: typeof LayoutDashboard; pill?: string }[] =
  [
    { id: "overview", label: "Overview", icon: LayoutDashboard, pill: "01" },
    { id: "stations", label: "Station explorer", icon: MapPinned },
    { id: "models", label: "Model performance", icon: BarChart3 },
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
          <Waves size={23} />
        </div>
        <div>
          <strong>
            RIVER<span>WATCH</span>
          </strong>
          <small>FLOOD INTELLIGENCE</small>
        </div>
      </div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="nav-list">
        {NAV.map(({ id, label, icon: Icon, pill }) => (
          <button
            key={id}
            className={activePage === id ? "nav-item active" : "nav-item"}
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} /> {label}
            {pill ? <span className="nav-pill">{pill}</span> : null}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="source-card">
          <div className="source-icon">
            <ShieldCheck size={17} />
          </div>
          <strong>Research prototype</strong>
          <p>
            Station-level danger-threshold exceedance predictions. Not an
            official warning service.
          </p>
        </div>
        <div className="profile-row">
          <div className="avatar">IN</div>
          <div>
            <strong>India monitoring</strong>
            <small>CWC-derived observations</small>
          </div>
          <ChevronDown size={15} />
        </div>
      </div>
    </aside>
  );
}
