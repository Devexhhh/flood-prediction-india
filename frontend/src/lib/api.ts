/**
 * API origin. Empty in development (Vite proxies /api to localhost:8000);
 * set VITE_API_BASE_URL on Vercel to the Render service URL.
 */
export const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export async function api<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `API request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

/** Fire-and-forget request that wakes a sleeping free-tier backend. */
export function warmUpApi() {
  fetch(`${API_BASE}/api/health`, { cache: "no-store" }).catch(() => {});
}
