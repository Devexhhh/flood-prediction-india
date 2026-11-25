import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stationLatLon(s: {
  lat?: number | null;
  lon?: number | null;
  lat_meta?: number | null;
  lon_meta?: number | null;
}): [number, number] | null {
  const lat = s.lat ?? s.lat_meta;
  const lon = s.lon ?? s.lon_meta;
  return typeof lat === "number" &&
    typeof lon === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lon)
    ? [lat, lon]
    : null;
}
