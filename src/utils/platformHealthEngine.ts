import type { AdminHealthSnapshot } from "../components/admin/AdminHealthPanel";
import { apiUrl } from "../services/supabase";
import type { PlatformHealthCenterBundle } from "../types/platformHealth";
import { buildPlatformHealthCenterBundle } from "./platformHealthLogic";
import { listPlatformHealthIncidents } from "./platformHealthStore";

export async function fetchLiveHealthSnapshot(): Promise<AdminHealthSnapshot | null> {
  try {
    const response = await fetch(apiUrl("/health"), { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as AdminHealthSnapshot;
  } catch {
    return null;
  }
}

export async function buildLivePlatformHealthCenterBundle(): Promise<PlatformHealthCenterBundle> {
  const health = await fetchLiveHealthSnapshot();
  return buildPlatformHealthCenterBundle(health, {
    liveProbe: health !== null,
    incidents: listPlatformHealthIncidents()
  });
}

export { buildPlatformHealthCenterBundle };
