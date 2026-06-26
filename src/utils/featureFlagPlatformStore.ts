import { FEATURE_FLAG_OFFLINE_CACHE_KEY } from "../constants/featureFlagPlatform";
import {
  FEATURE_FLAG_AUDIT_SEED,
  FEATURE_FLAG_PLATFORM_SEED
} from "../data/featureFlagPlatformSeed";
import type {
  EnterpriseFeatureFlagRecord,
  FeatureFlagAuditRecord,
  FeatureFlagRolloutUpdateInput,
  FeatureFlagToggleInput
} from "../types/featureFlagPlatform";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import {
  appendFeatureFlagAudit,
  canDeleteFeatureFlag,
  snapshotFeatureFlag,
  toggleFeatureFlagRecord,
  updateFeatureFlagRollout
} from "./featureFlagPlatformLogic";
import { readJson, writeJson } from "./storage";

type FeatureFlagPlatformState = {
  flags: EnterpriseFeatureFlagRecord[];
  audits: FeatureFlagAuditRecord[];
  updatedAt: string;
};

const STORAGE_KEY = "bamsignal.featureFlagPlatform.v1";

function defaultState(): FeatureFlagPlatformState {
  return {
    flags: [...FEATURE_FLAG_PLATFORM_SEED],
    audits: [...FEATURE_FLAG_AUDIT_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): FeatureFlagPlatformState {
  const stored = readJson<FeatureFlagPlatformState>(STORAGE_KEY, defaultState());
  if (!stored?.flags?.length) return defaultState();
  return {
    ...defaultState(),
    ...stored,
    flags: stored.flags?.length ? stored.flags : FEATURE_FLAG_PLATFORM_SEED,
    audits: stored.audits?.length ? stored.audits : FEATURE_FLAG_AUDIT_SEED
  };
}

function saveState(state: FeatureFlagPlatformState) {
  writeJson(STORAGE_KEY, state);
  writeJson(FEATURE_FLAG_OFFLINE_CACHE_KEY, {
    flags: state.flags,
    cachedAt: state.updatedAt
  });
}

export function listFeatureFlags(): EnterpriseFeatureFlagRecord[] {
  return loadState().flags;
}

export function listFeatureFlagAudits(): FeatureFlagAuditRecord[] {
  return loadState().audits;
}

export function getFeatureFlagByKey(key: EnterpriseFeatureFlagRecord["key"]) {
  return loadState().flags.find((item) => item.key === key) ?? null;
}

export function toggleFeatureFlag(input: FeatureFlagToggleInput): EnterpriseFeatureFlagRecord {
  const state = loadState();
  const index = state.flags.findIndex((item) => item.id === input.flagId);
  if (index < 0) throw new Error(`Feature flag not found: ${input.flagId}`);

  const current = state.flags[index];
  const previousValue = snapshotFeatureFlag(current);
  const updated = toggleFeatureFlagRecord(current, input.enabled);
  state.flags[index] = updated;
  state.audits = appendFeatureFlagAudit(state.audits, {
    flag: updated,
    changedBy: input.actor,
    previousValue,
    newValue: snapshotFeatureFlag(updated),
    reason: input.reason
  });
  state.updatedAt = new Date().toISOString();
  saveState(state);

  appendAuditCenterEvent({
    actor: input.actor,
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef: updated.key,
    result: "success",
    ipPlaceholder: "—",
    detail: `[feature-flag-toggled] ${updated.key} → ${input.enabled ? "enabled" : "disabled"} by ${input.actor}`
  });

  return updated;
}

export function updateFeatureFlagRolloutConfig(
  input: FeatureFlagRolloutUpdateInput
): EnterpriseFeatureFlagRecord {
  const state = loadState();
  const index = state.flags.findIndex((item) => item.id === input.flagId);
  if (index < 0) throw new Error(`Feature flag not found: ${input.flagId}`);

  const current = state.flags[index];
  const previousValue = snapshotFeatureFlag(current);
  const updated = updateFeatureFlagRollout(current, input.rolloutPercentage, input.rollout);
  state.flags[index] = updated;
  state.audits = appendFeatureFlagAudit(state.audits, {
    flag: updated,
    changedBy: input.actor,
    previousValue,
    newValue: snapshotFeatureFlag(updated),
    reason: input.reason
  });
  state.updatedAt = new Date().toISOString();
  saveState(state);

  appendAuditCenterEvent({
    actor: input.actor,
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef: updated.key,
    result: "success",
    ipPlaceholder: "—",
    detail: `[feature-flag-rollout-updated] ${updated.key} by ${input.actor}`
  });

  return updated;
}

export function deleteFeatureFlag(flagId: string, actor: string): void {
  const state = loadState();
  const index = state.flags.findIndex((item) => item.id === flagId);
  if (index < 0) throw new Error(`Feature flag not found: ${flagId}`);

  const flag = state.flags[index];
  if (!canDeleteFeatureFlag(flag)) {
    throw new Error(`Cannot delete active feature flag: ${flag.key}`);
  }

  state.flags.splice(index, 1);
  state.updatedAt = new Date().toISOString();
  saveState(state);

  appendAuditCenterEvent({
    actor,
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef: flag.key,
    result: "success",
    ipPlaceholder: "—",
    detail: `[feature-flag-deleted] ${flag.key} deleted by ${actor}`
  });
}

export function getFeatureFlagPlatformStorageKey() {
  return STORAGE_KEY;
}

export function resetFeatureFlagPlatformState() {
  saveState(defaultState());
}
