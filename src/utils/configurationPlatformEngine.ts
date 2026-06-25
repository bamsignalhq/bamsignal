import type { ConfigurationPlatformBundle, ConfigurationFilterState } from "../types/configurationPlatform";
import {
  buildConfigurationAuditHistory,
  buildConfigurationMetrics,
  countEntriesBySection,
  emptyConfigurationFilters,
  filterConfigurationEntries,
  filterFlagsBySection,
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
  const allFlags = listFeatureFlags();
  const approvals = listConfigurationApprovals();
  const snapshots = listConfigurationSnapshots();
  const entries = filterConfigurationEntries(allEntries, filters);
  const featureFlags =
    filters.sectionId === "all"
      ? allFlags
      : filterFlagsBySection(allFlags, filters.sectionId);

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildConfigurationMetrics(allEntries, allFlags, approvals, versions),
    entries,
    versions,
    featureFlags,
    approvals,
    snapshots,
    pendingApprovals: listPendingApprovals(approvals),
    auditHistory: buildConfigurationAuditHistory(allEntries, versions),
    sectionCounts: countEntriesBySection(allEntries)
  };
}
