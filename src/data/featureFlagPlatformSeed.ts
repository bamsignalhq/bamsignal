import type {
  EnterpriseFeatureFlagRecord,
  FeatureFlagAuditRecord
} from "../types/featureFlagPlatform";
import { ENTERPRISE_FEATURE_FLAGS } from "../constants/featureFlagPlatform";

const NOW = "2026-06-26T14:00:00.000Z";

function flag(
  key: EnterpriseFeatureFlagRecord["key"],
  enabled: boolean,
  rolloutPercentage: number,
  rollout: EnterpriseFeatureFlagRecord["rollout"],
  extra: Partial<EnterpriseFeatureFlagRecord> = {}
): EnterpriseFeatureFlagRecord {
  const meta = ENTERPRISE_FEATURE_FLAGS.find((item) => item.key === key);
  return {
    id: `ff_${key}`,
    key,
    label: meta?.label ?? key,
    enabled,
    rolloutPercentage,
    environment: "production",
    rollout,
    createdBy: "system@bamsignal.com",
    updatedAt: NOW,
    active: enabled || rolloutPercentage > 0,
    ...extra
  };
}

export const FEATURE_FLAG_PLATFORM_SEED: EnterpriseFeatureFlagRecord[] = [
  flag("voice_vibe", false, 25, { scope: "percentage" }, {
    description: "Voice profile and vibe playback for members."
  }),
  flag("trusted_member", true, 100, { scope: "global" }, {
    description: "Trusted member badge and verification flow."
  }),
  flag("signal_concierge", true, 100, { scope: "global" }, {
    description: "Signal Concierge application and journey intake."
  }),
  flag("relationship_consultant", true, 100, { scope: "country", countries: ["nigeria"] }, {
    description: "Relationship consultant matching and scheduling."
  }),
  flag("research_center", false, 0, { scope: "member_ids", memberIds: ["member_demo_001"] }, {
    description: "Institutional research surveys and insights."
  }),
  flag("legacy_families", false, 10, { scope: "city", cities: ["lagos", "abuja"] }, {
    description: "Legacy families program for multi-generational matching."
  }),
  flag("communities", true, 100, { scope: "global" }, {
    description: "City and diaspora community hubs."
  }),
  flag("events", true, 100, { scope: "state", states: ["lagos", "fct"] }, {
    description: "Signal Events discovery and RSVP."
  }),
  flag("ai_matching", false, 15, { scope: "percentage" }, {
    description: "AI-assisted compatibility scoring experiment."
  }),
  flag("executive_dashboard", true, 100, { scope: "consultant_ids", consultantIds: ["consultant_exec_001"] }, {
    description: "Executive dashboard for institutional leadership."
  }),
  flag("future_experiments", false, 0, { scope: "global" }, {
    description: "Placeholder for staged experiments — default off."
  })
];

export const FEATURE_FLAG_AUDIT_SEED: FeatureFlagAuditRecord[] = [
  {
    id: "ffa_001",
    flagId: "ff_voice_vibe",
    flagKey: "voice_vibe",
    changedBy: "ops@bamsignal.com",
    previousValue: { enabled: false, rolloutPercentage: 10 },
    newValue: { enabled: false, rolloutPercentage: 25 },
    reason: "Expand beta to 25% after stability review",
    createdAt: "2026-06-25T10:00:00.000Z"
  },
  {
    id: "ffa_002",
    flagId: "ff_ai_matching",
    flagKey: "ai_matching",
    changedBy: "stanlex",
    previousValue: { enabled: true, rolloutPercentage: 30 },
    newValue: { enabled: false, rolloutPercentage: 15 },
    reason: "Reduce blast radius after latency spike",
    createdAt: "2026-06-24T16:30:00.000Z"
  }
];
