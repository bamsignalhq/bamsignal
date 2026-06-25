import type { ConfigurationPlatformBundle, ConfigurationFilterState } from "../types/configurationPlatform";
import {
  buildConfigurationMetrics,
  countEntriesByCategory,
  emptyConfigurationFilters,
  filterConfigurationEntries,
  listPendingApprovals
} from "./configurationPlatformLogic";
import {
  listConfigurationApprovals,
  listConfigurationEntries,
  listConfigurationSnapshots,
  listConfigurationVersions,
  listFeatureFlags
} from "./configurationPlatformStore";

export function buildConfigurationPlatformBundle(
  filters: ConfigurationFilterState = emptyConfigurationFilters()
): ConfigurationPlatformBundle {
  const allEntries = listConfigurationEntries();
  const versions = listConfigurationVersions();
  const featureFlags = listFeatureFlags();
  const approvals = listConfigurationApprovals();
  const snapshots = listConfigurationSnapshots();
  const entries = filterConfigurationEntries(allEntries, filters);

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildConfigurationMetrics(allEntries, featureFlags, approvals, versions),
    entries,
    versions,
    featureFlags,
    approvals,
    snapshots,
    pendingApprovals: listPendingApprovals(approvals),
    categoryCounts: countEntriesByCategory(allEntries)
  };
}
