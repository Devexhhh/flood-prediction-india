import { lazy, Suspense } from "react";
import { LandingPage } from "../features/landing/LandingPage";
import { useHashRoute } from "../hooks/useHashRoute";
import { ThemeProvider } from "./providers/ThemeProvider";

// The dashboard pulls in Leaflet and Recharts; load it only when needed.
const Dashboard = lazy(() =>
  import("../features/dashboard/Dashboard").then((m) => ({ default: m.Dashboard })),
);

export function App() {
  const { route, navigate } = useHashRoute();
  return (
    <ThemeProvider>
      {route.view === "landing" ? (
        <LandingPage />
      ) : (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Dashboard page={route.page} navigate={navigate} />
        </Suspense>
      )}
    </ThemeProvider>
  );
}
