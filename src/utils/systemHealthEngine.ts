import type { AdminHealthSnapshot } from "../components/admin/AdminHealthPanel";
import type { SystemHealthBundle } from "../types/systemHealth";
import { fetchAdminHealthSnapshot } from "./fetchAdminHealthSnapshot";
import { buildSystemHealthBundle } from "./systemHealthLogic";

export async function fetchLiveHealthSnapshot(): Promise<AdminHealthSnapshot | null> {
  return fetchAdminHealthSnapshot();
}

export async function buildLiveSystemHealthBundle(): Promise<SystemHealthBundle> {
  const health = await fetchLiveHealthSnapshot();
  return buildSystemHealthBundle(health, { liveProbe: health !== null });
}

export { buildSystemHealthBundle };
