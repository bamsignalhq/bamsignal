/**
 * Enterprise Feature Flag Platform™ — server-side evaluation and governance.
 */

export const FEATURE_FLAG_PLATFORM_DB_TABLES = ["feature_flags", "feature_flag_audits"];

const DEFAULT_FLAGS = {
  voice_vibe: false,
  trusted_member: true,
  signal_concierge: true,
  relationship_consultant: true,
  research_center: false,
  legacy_families: false,
  communities: true,
  events: true,
  ai_matching: false,
  executive_dashboard: true,
  future_experiments: false
};

export function getFeatureFlagPlatformDatabaseTableManifest() {
  return FEATURE_FLAG_PLATFORM_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "feature-flags",
    migrationRef: "0021_feature_flag_platform.sql",
    hasUuidPrimaryKey: true,
    auditFields: tableName === "feature_flags" ? ["created_at", "updated_at", "created_by"] : ["created_at"]
  }));
}

export function canAccessFeatureFlagPlatform(permissions = []) {
  return (
    permissions.includes("SystemAdministration") ||
    permissions.includes("ManageGovernance") ||
    permissions.includes("ManageOperations")
  );
}

export function featureFlagPlatformRouteRegistered(source) {
  return source.includes("/hard/feature-flags") && source.includes("featureflags");
}

export function normalizeFeatureFlagRecord(raw) {
  const key = raw?.key ?? raw?.flagKey ?? raw?.flag_key;
  return {
    id: raw?.id ?? `ff_${key}`,
    key,
    label: raw?.label ?? key,
    enabled: Boolean(raw?.enabled),
    rolloutPercentage: Number(raw?.rolloutPercentage ?? raw?.rollout_percentage ?? 0),
    environment: raw?.environment ?? "production",
    description: raw?.description ?? "",
    rollout: raw?.rollout ?? raw?.rollout_config ?? { scope: "global" },
    createdBy: raw?.createdBy ?? raw?.created_by ?? "system",
    updatedAt: raw?.updatedAt ?? raw?.updated_at ?? new Date().toISOString(),
    active: Boolean(raw?.enabled) || Number(raw?.rolloutPercentage ?? raw?.rollout_percentage ?? 0) > 0
  };
}

export function isFeatureFlagActive(flag) {
  return Boolean(flag?.enabled) || Number(flag?.rolloutPercentage ?? 0) > 0;
}

export function canDeleteFeatureFlag(flag) {
  return !isFeatureFlagActive(flag);
}

export function evaluateEnterpriseFeatureFlag(flag, context = {}) {
  if (!flag) return false;

  if (!flag.enabled && Number(flag.rolloutPercentage ?? 0) <= 0) {
    return DEFAULT_FLAGS[flag.key] ?? false;
  }

  const env = context.environment ?? "production";
  if (flag.environment !== env && flag.environment !== "production") {
    return DEFAULT_FLAGS[flag.key] ?? false;
  }

  const rollout = flag.rollout ?? { scope: "global" };

  switch (rollout.scope) {
    case "global":
      return Boolean(flag.enabled);
    case "country":
      return (
        Boolean(flag.enabled) &&
        Boolean(context.country) &&
        (rollout.countries ?? []).includes(String(context.country).toLowerCase())
      );
    case "state":
      return (
        Boolean(flag.enabled) &&
        Boolean(context.state) &&
        (rollout.states ?? []).includes(String(context.state).toLowerCase())
      );
    case "city":
      return (
        Boolean(flag.enabled) &&
        Boolean(context.city) &&
        (rollout.cities ?? []).includes(String(context.city).toLowerCase())
      );
    case "member_ids":
      return (
        Boolean(flag.enabled) &&
        Boolean(context.memberId) &&
        (rollout.memberIds ?? []).includes(context.memberId)
      );
    case "consultant_ids":
      return (
        Boolean(flag.enabled) &&
        Boolean(context.consultantId) &&
        (rollout.consultantIds ?? []).includes(context.consultantId)
      );
    case "percentage": {
      const pct = Number(flag.rolloutPercentage ?? 0);
      if (!flag.enabled && pct <= 0) return false;
      const bucket = Number(context.memberHash ?? 0) % 100;
      return bucket < pct;
    }
    default:
      return Boolean(flag.enabled);
  }
}

export function isFeatureEnabled(key, flags = [], context = {}) {
  const flag = flags.find((item) => item.key === key || item.flagKey === key);
  if (flag) return evaluateEnterpriseFeatureFlag(normalizeFeatureFlagRecord(flag), context);
  return DEFAULT_FLAGS[key] ?? false;
}

export function buildFeatureFlagApiPayload(flags = []) {
  return {
    generatedAt: new Date().toISOString(),
    flags: flags.map(normalizeFeatureFlagRecord)
  };
}

export function appendFeatureFlagAuditRecord(audits, input) {
  return [
    {
      id: input.id ?? `ffa_${Date.now()}`,
      flagId: input.flagId,
      flagKey: input.flagKey,
      changedBy: input.changedBy,
      previousValue: input.previousValue ?? {},
      newValue: input.newValue ?? {},
      reason: input.reason ?? "",
      createdAt: input.createdAt ?? new Date().toISOString()
    },
    ...audits
  ];
}

export function formatFeatureFlagPlatformSummary(bundle) {
  return `${bundle.summary.enabled}/${bundle.summary.total} enabled · ${bundle.summary.active} active · ${bundle.audits.length} audit entries`;
}

export { DEFAULT_FLAGS as FEATURE_FLAG_SERVER_DEFAULTS };

export const FEATURE_FLAG_PLATFORM_SERVER_SEED = [
  {
    id: "ff_voice_vibe",
    key: "voice_vibe",
    label: "Voice Vibe",
    enabled: false,
    rolloutPercentage: 25,
    environment: "production",
    rollout: { scope: "percentage" }
  },
  {
    id: "ff_trusted_member",
    key: "trusted_member",
    label: "Trusted Member",
    enabled: true,
    rolloutPercentage: 100,
    environment: "production",
    rollout: { scope: "global" }
  },
  {
    id: "ff_signal_concierge",
    key: "signal_concierge",
    label: "Signal Concierge",
    enabled: true,
    rolloutPercentage: 100,
    environment: "production",
    rollout: { scope: "global" }
  },
  {
    id: "ff_relationship_consultant",
    key: "relationship_consultant",
    label: "Relationship Consultant",
    enabled: true,
    rolloutPercentage: 100,
    environment: "production",
    rollout: { scope: "country", countries: ["nigeria"] }
  },
  {
    id: "ff_research_center",
    key: "research_center",
    label: "Research Center",
    enabled: false,
    rolloutPercentage: 0,
    environment: "production",
    rollout: { scope: "member_ids", memberIds: ["member_demo_001"] }
  },
  {
    id: "ff_legacy_families",
    key: "legacy_families",
    label: "Legacy Families",
    enabled: false,
    rolloutPercentage: 10,
    environment: "production",
    rollout: { scope: "city", cities: ["lagos", "abuja"] }
  },
  {
    id: "ff_communities",
    key: "communities",
    label: "Communities",
    enabled: true,
    rolloutPercentage: 100,
    environment: "production",
    rollout: { scope: "global" }
  },
  {
    id: "ff_events",
    key: "events",
    label: "Events",
    enabled: true,
    rolloutPercentage: 100,
    environment: "production",
    rollout: { scope: "state", states: ["lagos", "fct"] }
  },
  {
    id: "ff_ai_matching",
    key: "ai_matching",
    label: "AI Matching",
    enabled: false,
    rolloutPercentage: 15,
    environment: "production",
    rollout: { scope: "percentage" }
  },
  {
    id: "ff_executive_dashboard",
    key: "executive_dashboard",
    label: "Executive Dashboard",
    enabled: true,
    rolloutPercentage: 100,
    environment: "production",
    rollout: { scope: "consultant_ids", consultantIds: ["consultant_exec_001"] }
  },
  {
    id: "ff_future_experiments",
    key: "future_experiments",
    label: "Future Experiments",
    enabled: false,
    rolloutPercentage: 0,
    environment: "production",
    rollout: { scope: "global" }
  }
];
