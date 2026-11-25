import { useCallback, useEffect, useState } from "react";
import type { AppPage } from "../types";

export type Route = { view: "landing" } | { view: "dashboard"; page: AppPage };

const PAGES: AppPage[] = ["overview", "stations", "models"];

function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] !== "dashboard") return { view: "landing" };
  const page = PAGES.find((p) => p === parts[1]) ?? "overview";
  return { view: "dashboard", page };
}

export function pageHref(page: AppPage) {
  return `#/dashboard/${page}`;
}

/** Tiny hash router: `#/` is the landing page, `#/dashboard/<page>` the app. */
export function useHashRoute() {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash));
      if (!window.location.hash.includes("dashboard")) return;
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((page: AppPage) => {
    window.location.hash = pageHref(page);
  }, []);

  return { route, navigate };
}
