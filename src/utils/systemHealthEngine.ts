import type { AdminHealthSnapshot } from "../components/admin/AdminHealthPanel";
import { apiUrl } from "../services/supabase";
import type { SystemHealthBundle } from "../types/systemHealth";
import { buildSystemHealthBundle } from "./systemHealthLogic";

export async function fetchLiveHealthSnapshot(): Promise<AdminHealthSnapshot | null> {
  try {
    const response = await fetch(apiUrl("/health"), { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as AdminHealthSnapshot;
  } catch {
    return null;
  }
}

export async function buildLiveSystemHealthBundle(): Promise<SystemHealthBundle> {
  const health = await fetchLiveHealthSnapshot();
  return buildSystemHealthBundle(health, { liveProbe: health !== null });
}

export { buildSystemHealthBundle };
