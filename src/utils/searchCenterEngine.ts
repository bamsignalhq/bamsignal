import type { EnterpriseSearchCenterBundle, SearchFilters } from "../types/searchCenter";
import { buildEnterpriseSearchCenterBundle } from "./searchCenterLogic";

export function buildSearchCenterBundle(filters: SearchFilters): EnterpriseSearchCenterBundle {
  return buildEnterpriseSearchCenterBundle(filters);
}

export async function buildLiveSearchCenterBundle(
  filters: SearchFilters
): Promise<EnterpriseSearchCenterBundle> {
  return buildSearchCenterBundle(filters);
}

export { buildEnterpriseSearchCenterBundle };
