import type { AdminHealthSnapshot } from "../components/admin/AdminHealthPanel";
import type { PlatformHealthCenterBundle } from "../types/platformHealth";
import { fetchAdminHealthSnapshot } from "./fetchAdminHealthSnapshot";
import { buildPlatformHealthCenterBundle } from "./platformHealthLogic";
import { listPlatformHealthIncidents } from "./platformHealthStore";

export async function fetchLiveHealthSnapshot(): Promise<AdminHealthSnapshot | null> {
  return fetchAdminHealthSnapshot();
}

export async function buildLivePlatformHealthCenterBundle(): Promise<PlatformHealthCenterBundle> {
  const health = await fetchLiveHealthSnapshot();
  return buildPlatformHealthCenterBundle(health, {
    liveProbe: health !== null,
    incidents: listPlatformHealthIncidents()
  });
}

export { buildPlatformHealthCenterBundle };
