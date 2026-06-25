/**
 * Institutional Configuration Center™ — server-side configuration governance.
 */

export const CONFIGURATION_PLATFORM_DB_TABLES = [
  "configuration_entries",
  "configuration_versions",
  "feature_flags",
  "configuration_approvals",
  "configuration_snapshots"
];

export function getConfigurationPlatformDatabaseTableManifest() {
  return CONFIGURATION_PLATFORM_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "configuration",
    migrationRef: "0011_configuration_platform.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"]
  }));
}

export function canAccessConfigurationPlatform(permissions = []) {
  return (
    permissions.includes("SystemAdministration") ||
    permissions.includes("ManageGovernance") ||
    permissions.includes("ManageOperations")
  );
}

export function requiresConfigurationApproval(entry) {
  return Boolean(entry?.critical);
}

export function validateConfigurationChange(entry, nextValue) {
  if (!entry?.configKey) {
    return { ok: false, reason: "missing-config-key" };
  }
  if (nextValue === undefined || nextValue === null) {
    return { ok: false, reason: "missing-value" };
  }
  if (entry.valueType === "number" && typeof nextValue !== "number") {
    return { ok: false, reason: "invalid-number" };
  }
  if (entry.valueType === "boolean" && typeof nextValue !== "boolean") {
    return { ok: false, reason: "invalid-boolean" };
  }
  return { ok: true };
}

export function appendConfigurationVersion(entry, versions, input) {
  const validation = validateConfigurationChange(entry, input.value);
  if (!validation.ok) {
    throw new Error(`Configuration validation failed: ${validation.reason}`);
  }

  const nextVersion = (entry.activeVersion ?? 1) + 1;
  const versionRecord = {
    id: input.id ?? `ver_${Date.now()}`,
    entryId: entry.id,
    versionNumber: nextVersion,
    value: input.value,
    changeReason: input.changeReason ?? "",
    changedBy: input.changedBy ?? "system",
    createdAt: input.createdAt ?? new Date().toISOString()
  };

  const nextEntry = {
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

export function processConfigurationApproval(approval, entry, approverEmail) {
  if (approval.status !== "pending") {
    throw new Error("Configuration approval violation: not pending");
  }
  if (approval.requestedBy === approverEmail) {
    throw new Error("Configuration approval violation: cannot approve own change");
  }

  return {
    approval: {
      ...approval,
      status: "approved",
      approverEmail,
      decidedAt: new Date().toISOString()
    },
    entry: {
      ...entry,
      value: approval.proposedValue,
      activeVersion: approval.proposedVersion,
      status: "active",
      updatedAt: new Date().toISOString(),
      updatedBy: approverEmail
    }
  };
}

export function rollbackConfigurationVersion(entry, versions, targetVersion) {
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

export function evaluateFeatureFlag(flag, context = {}) {
  if (flag?.mode === "maintenance") return Boolean(context.bypassMaintenance);
  if (flag?.mode === "disable" || (!flag?.enabled && flag?.mode === "disable")) return false;
  if (flag?.mode === "enable") return true;
  if (flag?.mode === "preview") return Boolean(context.isPreview);
  if (flag?.mode === "internal-only") {
    return (
      Boolean(context.isInternal) ||
      ["Admin", "Executive", "Operations"].includes(context.role ?? "")
    );
  }
  if (flag?.mode === "beta") {
    if (context.isBeta) return true;
    const percentage = Number(flag.rolloutConfig?.percentage ?? 0);
    const bucket = Number(context.memberHash ?? 0) % 100;
    return bucket < percentage;
  }
  return Boolean(flag?.enabled);
}

export function buildConfigurationSnapshot(entries, flags, input = {}) {
  return {
    id: input.id ?? `snap_${Date.now()}`,
    snapshotRef: input.snapshotRef ?? `CFG-SNAP-${Date.now()}`,
    label: input.label ?? "Configuration snapshot",
    entriesSnapshot: entries.map((entry) => ({
      configKey: entry.configKey,
      value: entry.value,
      activeVersion: entry.activeVersion
    })),
    flagsSnapshot: flags.map((flag) => ({
      flagKey: flag.flagKey,
      mode: flag.mode,
      enabled: flag.enabled,
      rolloutConfig: flag.rolloutConfig
    })),
    createdBy: input.createdBy ?? "system",
    createdAt: new Date().toISOString()
  };
}
