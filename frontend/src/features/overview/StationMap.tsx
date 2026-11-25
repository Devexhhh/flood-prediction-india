import { useEffect } from "react";
import { Circle, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useChartColors, useTheme } from "../../app/providers/ThemeProvider";
import { Card, CardHeader } from "../../components/ui/card";
import { pct } from "../../lib/format";
import { isAlert } from "../../lib/threshold";
import { stationLatLon } from "../../lib/utils";
import type { Station } from "../../types";

const TILES = {
  dark: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  light: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
};

function FlyTo({ station }: { station: Station | null }) {
  const map = useMap();
  useEffect(() => {
    const ll = station && stationLatLon(station);
    if (ll) map.flyTo(ll, Math.max(map.getZoom(), 6), { duration: 0.7 });
  }, [map, station]);
  return null;
}

export function StationMap({
  stations,
  threshold,
  selectedCode,
  selectedStation,
  onSelect,
}: {
  stations: Station[];
  threshold: number;
  selectedCode: string | null;
  selectedStation: Station | null;
  onSelect: (code: string) => void;
}) {
  const { resolvedTheme } = useTheme();
  const c = useChartColors();
  const mapped = stations.filter((s) => stationLatLon(s));

  return (
    <Card className="flex min-h-[460px] flex-col overflow-hidden">
      <CardHeader
        title="Station map"
        subtitle={`${mapped.length.toLocaleString("en-IN")} stations mapped`}
        action={
          <div className="flex gap-3.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-risk" /> At or above cutoff
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full border-[1.5px] border-muted-foreground" /> Below cutoff
            </span>
          </div>
        }
      />
      <div className="relative isolate z-0 min-h-[380px] flex-1">
        <MapContainer
          center={[22.5, 79]}
          zoom={4.5}
          minZoom={3}
          maxZoom={12}
          zoomSnap={0.5}
          scrollWheelZoom={false}
          className="absolute inset-0 h-full w-full"
        >
          <TileLayer
            key={resolvedTheme}
            url={TILES[resolvedTheme]}
            maxNativeZoom={16}
            attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors"
          />
          <FlyTo station={selectedStation} />
          {mapped.map((s) => {
            const ll = stationLatLon(s)!;
            const alert = isAlert(s.probability, threshold);
            const selected = s.station_code === selectedCode;
            return (
              <Circle
                key={s.station_code}
                center={ll}
                radius={selected ? 9000 : 4800}
                pathOptions={{
                  color: selected ? c.foreground : alert ? c.risk : c.muted,
                  weight: selected ? 2.5 : 1.2,
                  fillColor: alert ? c.risk : c.card,
                  fillOpacity: alert ? 0.85 : 0.6,
                }}
                eventHandlers={{ click: () => onSelect(s.station_code) }}
              >
                <Tooltip direction="top" className="rw-tooltip" offset={[0, -4]}>
                  <div className="flex flex-col gap-0.5">
                    <strong className="text-[13px] font-medium">{s.station_name || s.station_code}</strong>
                    <span className="font-mono text-[11px] opacity-70">{s.station_code}</span>
                    <span className="font-mono text-xs">{pct(s.probability)} exceedance</span>
                  </div>
                </Tooltip>
              </Circle>
            );
          })}
        </MapContainer>
      </div>
    </Card>
  );
}
