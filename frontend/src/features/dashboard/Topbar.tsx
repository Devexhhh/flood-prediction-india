import { Search } from "lucide-react";
import { Segmented } from "../../components/ui/segmented";
import { ThemeToggle } from "../../components/ui/theme-toggle";
import { Logo } from "../../components/ui/logo";
import { pageHref } from "../../hooks/useHashRoute";
import { cn } from "../../lib/utils";
import { MODELS, type AppPage, type ModelName } from "../../types";
import { PAGE_META } from "./pageMeta";
import { NAV } from "./Sidebar";

const SHORT: Record<ModelName, string> = {
  "Random Forest": "Random Forest",
  XGBoost: "XGBoost",
  "Logistic Regression": "Logistic",
};

export function Topbar({
  page,
  model,
  onModelChange,
  onOpenCommand,
}: {
  page: AppPage;
  model: ModelName;
  onModelChange: (m: ModelName) => void;
  onOpenCommand: () => void;
}) {
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-7">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Logo className="lg:hidden" />
          <a href="#/" className="hidden transition-colors hover:text-foreground lg:inline">
            RiverWatch
          </a>
          <span aria-hidden="true" className="hidden lg:inline">/</span>
          <strong className="hidden font-medium text-foreground lg:inline">{PAGE_META[page].title}</strong>
        </div>

        <Segmented
          label="Model"
          value={model}
          onChange={onModelChange}
          options={MODELS.map((m) => ({ value: m, label: SHORT[m] }))}
          className="order-last w-full sm:order-none sm:ml-auto sm:w-auto"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCommand}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-[10px] border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Search stations and commands"
          >
            <Search size={15} />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded-md border border-border px-1.5 font-mono text-[11px] sm:inline">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile page tabs */}
      <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
        {NAV.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={pageHref(id)}
            aria-current={id === page ? "page" : undefined}
            className={cn(
              "flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-[13px]",
              id === page ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            <Icon size={15} strokeWidth={1.8} /> {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
