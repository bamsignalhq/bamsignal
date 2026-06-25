import { CONFIGURATION_CATEGORIES } from "../constants/configurationPlatform";
import type {
  ConfigurationApprovalRecord,
  ConfigurationEntryRecord,
  ConfigurationFilterState,
  ConfigurationMetric,
  ConfigurationVersionRecord,
  FeatureFlagRecord
} from "../types/configurationPlatform";
import type { ConfigurationCategoryId } from "../constants/configurationPlatform";

export function emptyConfigurationFilters(): ConfigurationFilterState {
  return { query: "", categoryId: "all" };
}

export function filterConfigurationEntries(
  entries: ConfigurationEntryRecord[],
  filters: ConfigurationFilterState
): ConfigurationEntryRecord[] {
  const query = filters.query.trim().toLowerCase();
  return entries.filter((entry) => {
    if (filters.categoryId !== "all" && entry.categoryId !== filters.categoryId) return false;
    if (!query) return true;
    const haystack = [entry.configKey, entry.label, entry.description ?? "", entry.categoryId]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function countEntriesByCategory(entries: ConfigurationEntryRecord[]) {
  const counts = Object.fromEntries(
    CONFIGURATION_CATEGORIES.map((category) => [category.id, 0])
  ) as Record<ConfigurationCategoryId, number>;
  for (const entry of entries) {
    counts[entry.categoryId] = (counts[entry.categoryId] ?? 0) + 1;
  }
  return counts;
}

export function listPendingApprovals(approvals: ConfigurationApprovalRecord[]) {
  return approvals.filter((item) => item.status === "pending");
}

export function listVersionsForEntry(versions: ConfigurationVersionRecord[], entryId: string) {
  return versions
    .filter((item) => item.entryId === entryId)
    .sort((left, right) => right.versionNumber - left.versionNumber);
}

export function countEnabledFlags(flags: FeatureFlagRecord[]) {
  return flags.filter((item) => item.enabled || item.mode === "enabled").length;
}

export function buildConfigurationMetrics(
  entries: ConfigurationEntryRecord[],
  flags: FeatureFlagRecord[],
  approvals: ConfigurationApprovalRecord[],
  versions: ConfigurationVersionRecord[]
): ConfigurationMetric[] {
  const pending = listPendingApprovals(approvals).length;
  const critical = entries.filter((item) => item.critical).length;
  return [
    { id: "entries", label: "Configuration entries", value: String(entries.length) },
    { id: "feature-flags", label: "Feature flags", value: String(flags.length) },
    { id: "enabled-flags", label: "Enabled flags", value: String(countEnabledFlags(flags)) },
    { id: "pending-approvals", label: "Pending approvals", value: String(pending) },
    { id: "versions", label: "Version records", value: String(versions.length) },
    { id: "critical-settings", label: "Critical settings", value: String(critical) }
  ];
}

export function requiresConfigurationApproval(entry: ConfigurationEntryRecord): boolean {
  return Boolean(entry.critical);
}

export function validateConfigurationChange(
  entry: ConfigurationEntryRecord,
  nextValue: ConfigurationEntryRecord["value"]
): { ok: boolean; reason?: string } {
  if (!entry.configKey) return { ok: false, reason: "missing-config-key" };
  if (nextValue === undefined || nextValue === null) return { ok: false, reason: "missing-value" };
  if (entry.valueType === "number" && typeof nextValue !== "number") {
    return { ok: false, reason: "invalid-number" };
  }
  if (entry.valueType === "boolean" && typeof nextValue !== "boolean") {
    return { ok: false, reason: "invalid-boolean" };
  }
  return { ok: true };
}

export function appendConfigurationVersion(
  entry: ConfigurationEntryRecord,
  versions: ConfigurationVersionRecord[],
  input: { value: ConfigurationEntryRecord["value"]; changedBy?: string; changeReason?: string; id?: string; createdAt?: string }
) {
  const validation = validateConfigurationChange(entry, input.value);
  if (!validation.ok) {
    throw new Error(`Configuration validation failed: ${validation.reason}`);
  }

  const nextVersion = entry.activeVersion + 1;
  const versionRecord: ConfigurationVersionRecord = {
    id: input.id ?? `ver_${Date.now()}`,
    entryId: entry.id,
    versionNumber: nextVersion,
    value: input.value,
    changeReason: input.changeReason ?? "",
    changedBy: input.changedBy ?? "system",
    createdAt: input.createdAt ?? new Date().toISOString()
  };

  const nextEntry: ConfigurationEntryRecord = {
    ...entry,
    value: input.value,
    activeVersion: nextVersion,
    status: requiresConfigurationApproval(entry) ? "pending-approval" : "active",
    updatedAt: new Date().toISOString(),
    updatedBy: input.changedBy
  };

  return {
    entry: nextEntry,
    versions: [...versions, versionRecord],
    requiresApproval: requiresConfigurationApproval(entry)
  };
}

export function processConfigurationApproval(
  approval: ConfigurationApprovalRecord,
  entry: ConfigurationEntryRecord,
  approverEmail: string
) {
  if (approval.status !== "pending") {
    throw new Error("Configuration approval violation: not pending");
  }
  if (approval.requestedBy === approverEmail) {
    throw new Error("Configuration approval violation: cannot approve own change");
  }

  return {
    approval: {
      ...approval,
      status: "approved" as const,
      approverEmail,
      decidedAt: new Date().toISOString()
    },
    entry: {
      ...entry,
      value: approval.proposedValue,
      activeVersion: approval.proposedVersion,
      status: "active" as const,
      updatedAt: new Date().toISOString(),
      updatedBy: approverEmail
    }
  };
}

export function rollbackConfigurationVersion(
  entry: ConfigurationEntryRecord,
  versions: ConfigurationVersionRecord[],
  targetVersion: number
): ConfigurationEntryRecord {
  const version = versions.find(
    (item) => item.entryId === entry.id && item.versionNumber === targetVersion
  );
  if (!version) {
    throw new Error("Configuration rollback violation: version not found");
  }

  return {
    ...entry,
    value: version.value,
    activeVersion: targetVersion,
    status: "active",
    updatedAt: new Date().toISOString()
  };
}

export function evaluateFeatureFlag(
  flag: FeatureFlagRecord,
  context: { memberHash?: number; regionId?: string; role?: string } = {}
): boolean {
  if (!flag.enabled && flag.mode === "disabled") return false;
  if (flag.mode === "enabled") return true;
  if (flag.mode === "disabled") return false;
  if (flag.mode === "future-rollout") return false;

  if (flag.mode === "gradual-rollout") {
    const percentage = Number(flag.rolloutConfig?.percentage ?? 0);
    const bucket = Number(context.memberHash ?? 0) % 100;
    return bucket < percentage;
  }

  if (flag.mode === "region-rollout") {
    return (flag.rolloutConfig?.regions ?? []).includes(context.regionId ?? "");
  }

  if (flag.mode === "role-rollout") {
    return (flag.rolloutConfig?.roles ?? []).includes(context.role ?? "");
  }

  return flag.enabled;
}
