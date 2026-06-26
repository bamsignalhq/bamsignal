import {
  FEATURE_FLAG_DEFAULTS,
  type EnterpriseFeatureFlagKey,
  type FeatureFlagEnvironmentId
} from "../constants/featureFlagPlatform";
import {
  FEATURE_FLAG_AUDIT_SEED,
  FEATURE_FLAG_PLATFORM_SEED
} from "../data/featureFlagPlatformSeed";
import type {
  EnterpriseFeatureFlagRecord,
  FeatureFlagAuditRecord,
  FeatureFlagEvaluationContext,
  FeatureFlagPlatformBundle,
  FeatureFlagRolloutConfig
} from "../types/featureFlagPlatform";

export function snapshotFeatureFlag(flag: EnterpriseFeatureFlagRecord) {
  return {
    enabled: flag.enabled,
    rolloutPercentage: flag.rolloutPercentage,
    environment: flag.environment,
    rollout: flag.rollout
  };
}

export function isFeatureFlagActive(flag: EnterpriseFeatureFlagRecord): boolean {
  return flag.enabled || flag.rolloutPercentage > 0;
}

export function canDeleteFeatureFlag(flag: EnterpriseFeatureFlagRecord): boolean {
  return !isFeatureFlagActive(flag);
}

export function evaluateEnterpriseFeatureFlag(
  flag: EnterpriseFeatureFlagRecord | undefined,
  context: FeatureFlagEvaluationContext = {}
): boolean {
  if (!flag) return false;

  if (!flag.enabled && flag.rolloutPercentage <= 0) {
    return FEATURE_FLAG_DEFAULTS[flag.key] ?? false;
  }

  const env = context.environment ?? "production";
  if (flag.environment !== env && flag.environment !== "production") {
    return FEATURE_FLAG_DEFAULTS[flag.key] ?? false;
  }

  const rollout = flag.rollout;

  switch (rollout.scope) {
    case "global":
      return flag.enabled;
    case "country":
      if (!context.country) return false;
      return flag.enabled && (rollout.countries ?? []).includes(context.country.toLowerCase());
    case "state":
      if (!context.state) return false;
      return flag.enabled && (rollout.states ?? []).includes(context.state.toLowerCase());
    case "city":
      if (!context.city) return false;
      return flag.enabled && (rollout.cities ?? []).includes(context.city.toLowerCase());
    case "member_ids":
      if (!context.memberId) return false;
      return flag.enabled && (rollout.memberIds ?? []).includes(context.memberId);
    case "consultant_ids":
      if (!context.consultantId) return false;
      return flag.enabled && (rollout.consultantIds ?? []).includes(context.consultantId);
    case "percentage": {
      if (!flag.enabled && flag.rolloutPercentage <= 0) return false;
      const pct = flag.rolloutPercentage;
      const bucket = Number(context.memberHash ?? 0) % 100;
      return bucket < pct;
    }
    default:
      return flag.enabled;
  }
}

export function evaluateFeatureFlagByKey(
  key: EnterpriseFeatureFlagKey,
  flags: EnterpriseFeatureFlagRecord[],
  context: FeatureFlagEvaluationContext = {}
): boolean {
  const flag = flags.find((item) => item.key === key);
  if (flag) return evaluateEnterpriseFeatureFlag(flag, context);
  return FEATURE_FLAG_DEFAULTS[key] ?? false;
}

export function buildFeatureFlagPlatformSummary(flags: EnterpriseFeatureFlagRecord[]) {
  const enabled = flags.filter((item) => item.enabled).length;
  const active = flags.filter((item) => isFeatureFlagActive(item)).length;
  return {
    total: flags.length,
    enabled,
    disabled: flags.length - enabled,
    active
  };
}

export function buildFeatureFlagPlatformBundle(
  flags = FEATURE_FLAG_PLATFORM_SEED,
  audits = FEATURE_FLAG_AUDIT_SEED,
  environment: FeatureFlagEnvironmentId = "production"
): FeatureFlagPlatformBundle {
  const filteredFlags = flags.filter((item) => item.environment === environment || item.environment === "production");
  return {
    generatedAt: new Date().toISOString(),
    environment,
    flags: filteredFlags.map((item) => ({
      ...item,
      active: isFeatureFlagActive(item)
    })),
    audits: [...audits].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    ),
    summary: buildFeatureFlagPlatformSummary(filteredFlags)
  };
}

export function toggleFeatureFlagRecord(
  flag: EnterpriseFeatureFlagRecord,
  enabled: boolean
): EnterpriseFeatureFlagRecord {
  return {
    ...flag,
    enabled,
    active: enabled || flag.rolloutPercentage > 0,
    updatedAt: new Date().toISOString()
  };
}

export function updateFeatureFlagRollout(
  flag: EnterpriseFeatureFlagRecord,
  rolloutPercentage: number,
  rollout: FeatureFlagRolloutConfig
): EnterpriseFeatureFlagRecord {
  return {
    ...flag,
    rolloutPercentage,
    rollout,
    active: flag.enabled || rolloutPercentage > 0,
    updatedAt: new Date().toISOString()
  };
}

export function appendFeatureFlagAudit(
  audits: FeatureFlagAuditRecord[],
  input: {
    flag: EnterpriseFeatureFlagRecord;
    changedBy: string;
    previousValue: Record<string, unknown>;
    newValue: Record<string, unknown>;
    reason?: string;
  }
): FeatureFlagAuditRecord[] {
  const record: FeatureFlagAuditRecord = {
    id: `ffa_${Date.now()}`,
    flagId: input.flag.id,
    flagKey: input.flag.key,
    changedBy: input.changedBy,
    previousValue: input.previousValue,
    newValue: input.newValue,
    reason: input.reason,
    createdAt: new Date().toISOString()
  };
  return [record, ...audits];
}

export function formatFeatureFlagRollout(flag: EnterpriseFeatureFlagRecord): string {
  const scope = flag.rollout.scope;
  if (scope === "percentage") return `${flag.rolloutPercentage}% rollout`;
  if (scope === "global") return flag.enabled ? "Global on" : "Global off";
  if (scope === "country") return `Countries: ${(flag.rollout.countries ?? []).join(", ") || "—"}`;
  if (scope === "state") return `States: ${(flag.rollout.states ?? []).join(", ") || "—"}`;
  if (scope === "city") return `Cities: ${(flag.rollout.cities ?? []).join(", ") || "—"}`;
  if (scope === "member_ids") return `${(flag.rollout.memberIds ?? []).length} member IDs`;
  if (scope === "consultant_ids") return `${(flag.rollout.consultantIds ?? []).length} consultant IDs`;
  return scope;
}

export { FEATURE_FLAG_DEFAULTS };
