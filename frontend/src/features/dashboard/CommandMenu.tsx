import { CornerDownLeft, MapPin, Moon, Search, Sun, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../../app/providers/ThemeProvider";
import { pct } from "../../lib/format";
import { isAlert } from "../../lib/threshold";
import { cn } from "../../lib/utils";
import type { AppPage, Station } from "../../types";
import { NAV } from "./Sidebar";

type Item = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  hintRisk?: boolean;
  icon: LucideIcon;
  run: () => void;
};

export function CommandMenu({
  open,
  onClose,
  stations,
  threshold,
  onSelectStation,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  stations: Station[];
  threshold: number;
  onSelectStation: (code: string) => void;
  onNavigate: (page: AppPage) => void;
}) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const stationItems: Item[] = stations
      .filter((s) => !q || `${s.station_code} ${s.station_name}`.toLowerCase().includes(q))
      .slice(0, 8)
      .map((s) => ({
        id: `s-${s.station_code}`,
        group: "Stations",
        label: s.station_name || s.station_code,
        hint: pct(s.probability),
        hintRisk: isAlert(s.probability, threshold),
        icon: MapPin,
        run: () => onSelectStation(s.station_code),
      }));
    const pageItems: Item[] = NAV.filter((n) => !q || n.label.toLowerCase().includes(q)).map((n) => ({
      id: `p-${n.id}`,
      group: "Go to",
      label: n.label,
      icon: n.icon,
      run: () => onNavigate(n.id),
    }));
    const themeLabel = resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme";
    const actionItems: Item[] =
      !q || themeLabel.toLowerCase().includes(q) || "theme".includes(q)
        ? [{ id: "theme", group: "Actions", label: themeLabel, icon: resolvedTheme === "dark" ? Sun : Moon, run: toggleTheme }]
        : [];
    return [...stationItems, ...pageItems, ...actionItems];
  }, [query, stations, threshold, resolvedTheme, onSelectStation, onNavigate, toggleTheme]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function choose(item?: Item) {
    if (!item) return;
    item.run();
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(items.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(items[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search stations and commands"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-2.5 border-b border-border px-4">
              <Search size={16} className="text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stations, pages, actions…"
                aria-label="Search"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-list"
                aria-activedescendant={items[active] ? `cmd-${items[active].id}` : undefined}
                className="h-12 flex-1 border-0 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded-md border border-border px-1.5 font-mono text-[11px] text-muted-foreground">Esc</kbd>
            </div>
            <ul id="command-list" ref={listRef} role="listbox" className="m-0 max-h-[360px] list-none overflow-y-auto p-2">
              {items.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-muted-foreground">No results for “{query}”.</li>
              )}
              {items.map((item, i) => {
                const header = item.group !== lastGroup ? item.group : null;
                lastGroup = item.group;
                const Icon = item.icon;
                return (
                  <li key={item.id} role="presentation">
                    {header && (
                      <div className="px-3 pt-2 pb-1 text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
                        {header}
                      </div>
                    )}
                    <div
                      id={`cmd-${item.id}`}
                      role="option"
                      aria-selected={i === active}
                      data-index={i}
                      onMouseMove={() => setActive(i)}
                      onClick={() => choose(item)}
                      className={cn(
                        "flex h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm",
                        i === active ? "bg-muted text-foreground" : "text-muted-foreground",
                      )}
                    >
                      <Icon size={15} strokeWidth={1.8} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.hint && (
                        <span className={cn("font-mono text-xs", item.hintRisk ? "text-risk" : "text-muted-foreground")}>
                          {item.hint}
                        </span>
                      )}
                      {i === active && <CornerDownLeft size={13} className="text-muted-foreground" />}
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
