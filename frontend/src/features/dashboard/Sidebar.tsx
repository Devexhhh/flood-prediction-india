import { BarChart3, LayoutGrid, MapPin, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { PulseDot } from "../../components/magicui";
import { Logo } from "../../components/ui/logo";
import { pageHref } from "../../hooks/useHashRoute";
import { formatDate } from "../../lib/format";
import { cn } from "../../lib/utils";
import type { AppPage } from "../../types";

export const NAV: { id: AppPage; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "stations", label: "Station explorer", icon: MapPin },
  { id: "models", label: "Model evaluation", icon: BarChart3 },
];

export function Sidebar({
  page,
  alertCount,
  latestDate,
  stationCount,
}: {
  page: AppPage;
  alertCount: number | null;
  latestDate?: string;
  stationCount?: number;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r border-border bg-card px-3.5 py-5 lg:flex">
      <Logo className="px-2" />
      <nav aria-label="Dashboard" className="flex flex-col gap-0.5">
        <span className="px-2.5 pb-2 text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
          Monitoring
        </span>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = id === page;
          return (
            <a
              key={id}
              href={pageHref(id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-10 items-center gap-2.5 rounded-[9px] px-2.5 text-sm transition-colors",
                active ? "font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-[9px] bg-muted"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
                />
              )}
              <Icon size={17} strokeWidth={1.8} className="relative" />
              <span className="relative flex-1">{label}</span>
              {id === "overview" && alertCount !== null && alertCount > 0 && (
                <span className="relative rounded-full bg-risk-soft px-2 py-0.5 font-mono text-[11px] text-risk">
                  {alertCount}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1.5 rounded-xl border border-border p-3.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <PulseDot className="size-[7px] text-accent" /> CWC network
        </span>
        <span>{stationCount ? `${stationCount.toLocaleString("en-IN")} stations` : "703 stations"} · 17 features</span>
        <span className="font-mono">Data through {formatDate(latestDate)}</span>
      </div>
    </aside>
  );
}
