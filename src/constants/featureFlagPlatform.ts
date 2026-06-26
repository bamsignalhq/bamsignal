/** Enterprise Feature Flag Platform™ — remote feature control without deployment. */

import { FEATURE_FLAG_PLATFORM_ADMIN_BRAND } from "./featureFlagPlatformAdmin";

export const FEATURE_FLAG_PLATFORM_BRAND = FEATURE_FLAG_PLATFORM_ADMIN_BRAND;

export const FEATURE_FLAG_ENVIRONMENTS = ["production", "staging", "development"] as const;
export type FeatureFlagEnvironmentId = (typeof FEATURE_FLAG_ENVIRONMENTS)[number];

export const FEATURE_FLAG_ROLLOUT_SCOPES = [
  { id: "global", label: "Global" },
  { id: "country", label: "Country" },
  { id: "state", label: "State" },
  { id: "city", label: "City" },
  { id: "percentage", label: "Percentage" },
  { id: "member_ids", label: "Member IDs" },
  { id: "consultant_ids", label: "Consultant IDs" }
] as const;

export type FeatureFlagRolloutScopeId = (typeof FEATURE_FLAG_ROLLOUT_SCOPES)[number]["id"];

export const FEATURE_FLAG_ROLLOUT_SCOPE_LABELS: Record<FeatureFlagRolloutScopeId, string> =
  Object.fromEntries(FEATURE_FLAG_ROLLOUT_SCOPES.map((item) => [item.id, item.label])) as Record<
    FeatureFlagRolloutScopeId,
    string
  >;

export const ENTERPRISE_FEATURE_FLAGS = [
  { key: "voice_vibe", label: "Voice Vibe", defaultEnabled: false },
  { key: "trusted_member", label: "Trusted Member", defaultEnabled: true },
  { key: "signal_concierge", label: "Signal Concierge", defaultEnabled: true },
  { key: "relationship_consultant", label: "Relationship Consultant", defaultEnabled: true },
  { key: "research_center", label: "Research Center", defaultEnabled: false },
  { key: "legacy_families", label: "Legacy Families", defaultEnabled: false },
  { key: "communities", label: "Communities", defaultEnabled: true },
  { key: "events", label: "Events", defaultEnabled: true },
  { key: "ai_matching", label: "AI Matching", defaultEnabled: false },
  { key: "executive_dashboard", label: "Executive Dashboard", defaultEnabled: true },
  { key: "future_experiments", label: "Future Experiments", defaultEnabled: false }
] as const;

export type EnterpriseFeatureFlagKey = (typeof ENTERPRISE_FEATURE_FLAGS)[number]["key"];

export const ENTERPRISE_FEATURE_FLAG_LABELS: Record<EnterpriseFeatureFlagKey, string> =
  Object.fromEntries(ENTERPRISE_FEATURE_FLAGS.map((item) => [item.key, item.label])) as Record<
    EnterpriseFeatureFlagKey,
    string
  >;

export const FEATURE_FLAG_DEFAULTS: Record<EnterpriseFeatureFlagKey, boolean> = Object.fromEntries(
  ENTERPRISE_FEATURE_FLAGS.map((item) => [item.key, item.defaultEnabled])
) as Record<EnterpriseFeatureFlagKey, boolean>;

export const FEATURE_FLAG_PLATFORM_DB_TABLES = ["feature_flags", "feature_flag_audits"] as const;

export const FEATURE_FLAG_OFFLINE_CACHE_KEY = "bamsignal.featureFlags.v1";

export const FEATURE_FLAG_CACHE_TTL_MS = 5 * 60 * 1000;
