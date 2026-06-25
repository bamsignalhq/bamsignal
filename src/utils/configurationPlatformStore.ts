import type { ConfigurationAuditActionId } from "../constants/configurationPlatform";
import {
  CONFIGURATION_APPROVAL_SEED,
  CONFIGURATION_ENTRY_SEED,
  CONFIGURATION_SNAPSHOT_SEED,
  CONFIGURATION_VERSION_SEED,
  FEATURE_FLAG_SEED
} from "../data/configurationPlatformSeed";
import type {
  ConfigurationApprovalRecord,
  ConfigurationEntryRecord,
  ConfigurationSnapshotRecord,
  ConfigurationVersionRecord,
  FeatureFlagRecord
} from "../types/configurationPlatform";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import {
  appendConfigurationVersion,
  processConfigurationApproval,
  rollbackConfigurationVersion
} from "./configurationPlatformLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.configurationPlatform.v1";

type ConfigurationPlatformState = {
  entries: ConfigurationEntryRecord[];
  versions: ConfigurationVersionRecord[];
  featureFlags: FeatureFlagRecord[];
  approvals: ConfigurationApprovalRecord[];
  snapshots: ConfigurationSnapshotRecord[];
  updatedAt: string;
};

function defaultState(): ConfigurationPlatformState {
  return {
    entries: [...CONFIGURATION_ENTRY_SEED],
    versions: [...CONFIGURATION_VERSION_SEED],
    featureFlags: [...FEATURE_FLAG_SEED],
    approvals: [...CONFIGURATION_APPROVAL_SEED],
    snapshots: [...CONFIGURATION_SNAPSHOT_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): ConfigurationPlatformState {
  const stored = readJson<ConfigurationPlatformState>(STORAGE_KEY, defaultState());
  if (!stored?.entries?.length) return defaultState();
  return {
    ...defaultState(),
    ...stored,
    entries: stored.entries?.length ? stored.entries : CONFIGURATION_ENTRY_SEED,
    versions: stored.versions?.length ? stored.versions : CONFIGURATION_VERSION_SEED,
    featureFlags: stored.featureFlags?.length ? stored.featureFlags : FEATURE_FLAG_SEED,
    approvals: stored.approvals?.length ? stored.approvals : CONFIGURATION_APPROVAL_SEED,
    snapshots: stored.snapshots?.length ? stored.snapshots : CONFIGURATION_SNAPSHOT_SEED
  };
}

function saveState(state: ConfigurationPlatformState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logConfigurationAudit(
  action: ConfigurationAuditActionId,
  detail: string,
  entityRef: string
): void {
  appendAuditCenterEvent({
    actor: "configuration-platform",
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function listConfigurationEntries() {
  return loadState().entries;
}

export function listConfigurationVersions() {
  return loadState().versions;
}

export function listFeatureFlags() {
  return loadState().featureFlags;
}

export function listConfigurationApprovals() {
  return loadState().approvals;
}

export function listConfigurationSnapshots() {
  return loadState().snapshots;
}

export function proposeConfigurationChange(
  entryId: string,
  value: ConfigurationEntryRecord["value"],
  actor: string,
  changeReason?: string
): ConfigurationEntryRecord | null {
  const state = loadState();
  const index = state.entries.findIndex((item) => item.id === entryId);
  if (index < 0) return null;

  const result = appendConfigurationVersion(state.entries[index], state.versions, {
    value,
    changedBy: actor,
    changeReason
  });

  state.entries[index] = result.entry;
  state.versions = result.versions;

  if (result.requiresApproval) {
    state.approvals = [
      ...state.approvals,
      {
        id: `appr_${Date.now()}`,
        entryId: result.entry.id,
        configKey: result.entry.configKey,
        label: result.entry.label,
        proposedVersion: result.entry.activeVersion,
        proposedValue: value,
        status: "pending",
        requestedBy: actor,
        createdAt: new Date().toISOString()
      }
    ];
    logConfigurationAudit(
      "config-updated",
      `${result.entry.configKey} pending approval`,
      result.entry.configKey
    );
  } else {
    logConfigurationAudit("config-updated", `${result.entry.configKey} by ${actor}`, result.entry.configKey);
  }

  saveState(state);
  return result.entry;
}

export function approveConfigurationChange(
  approvalId: string,
  approverEmail: string
): ConfigurationEntryRecord | null {
  const state = loadState();
  const approvalIndex = state.approvals.findIndex((item) => item.id === approvalId);
  if (approvalIndex < 0) return null;

  const approval = state.approvals[approvalIndex];
  const entryIndex = state.entries.findIndex((item) => item.id === approval.entryId);
  if (entryIndex < 0) return null;

  const result = processConfigurationApproval(approval, state.entries[entryIndex], approverEmail);
  state.approvals[approvalIndex] = result.approval;
  state.entries[entryIndex] = result.entry;
  saveState(state);
  logConfigurationAudit(
    "config-approved",
    `${result.entry.configKey} approved by ${approverEmail}`,
    result.entry.configKey
  );
  return result.entry;
}

export function rollbackConfigurationEntry(
  entryId: string,
  targetVersion: number,
  actor: string
): ConfigurationEntryRecord | null {
  const state = loadState();
  const index = state.entries.findIndex((item) => item.id === entryId);
  if (index < 0) return null;

  const rolled = rollbackConfigurationVersion(
    state.entries[index],
    state.versions,
    targetVersion
  );
  state.entries[index] = { ...rolled, updatedBy: actor };
  saveState(state);
  logConfigurationAudit(
    "config-rolled-back",
    `${rolled.configKey} → v${targetVersion} by ${actor}`,
    rolled.configKey
  );
  return state.entries[index];
}

export function updateFeatureFlagMode(
  flagId: string,
  mode: FeatureFlagRecord["mode"],
  actor: string
): FeatureFlagRecord | null {
  const state = loadState();
  const index = state.featureFlags.findIndex((item) => item.id === flagId);
  if (index < 0) return null;

  const enabled = mode === "enabled" || mode === "gradual-rollout" || mode === "region-rollout" || mode === "role-rollout";
  state.featureFlags[index] = {
    ...state.featureFlags[index],
    mode,
    enabled,
    updatedAt: new Date().toISOString()
  };
  saveState(state);
  logConfigurationAudit(
    "feature-flag-updated",
    `${state.featureFlags[index].flagKey} → ${mode} by ${actor}`,
    state.featureFlags[index].flagKey
  );
  return state.featureFlags[index];
}
