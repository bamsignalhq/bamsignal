import type { AdminHealthSnapshot } from "../components/admin/AdminHealthPanel";
import type { ProductionObservabilityBundle } from "../types/productionObservability";
import { fetchAdminHealthSnapshot } from "./fetchAdminHealthSnapshot";
import { buildProductionObservabilityBundle } from "./productionObservabilityLogic";
import { listObservabilityErrors } from "./productionObservabilityStore";

export async function fetchLiveHealthSnapshot(): Promise<AdminHealthSnapshot | null> {
  return fetchAdminHealthSnapshot();
}

export async function buildLiveProductionObservabilityBundle(): Promise<ProductionObservabilityBundle> {
  const health = await fetchLiveHealthSnapshot();
  const errors = listObservabilityErrors();
  return buildProductionObservabilityBundle(health, errors, { liveProbe: health !== null });
}

export { buildProductionObservabilityBundle };
