import type { AdminHealthSnapshot } from "../components/admin/AdminHealthPanel";
import { apiUrl } from "../services/supabase";
import type { ProductionObservabilityBundle } from "../types/productionObservability";
import { buildProductionObservabilityBundle } from "./productionObservabilityLogic";
import { listObservabilityErrors } from "./productionObservabilityStore";

export async function fetchLiveHealthSnapshot(): Promise<AdminHealthSnapshot | null> {
  try {
    const response = await fetch(apiUrl("/health"), { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as AdminHealthSnapshot;
  } catch {
    return null;
  }
}

export async function buildLiveProductionObservabilityBundle(): Promise<ProductionObservabilityBundle> {
  const health = await fetchLiveHealthSnapshot();
  const errors = listObservabilityErrors();
  return buildProductionObservabilityBundle(health, errors, { liveProbe: health !== null });
}

export { buildProductionObservabilityBundle };
