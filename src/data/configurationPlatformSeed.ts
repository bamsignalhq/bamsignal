import type {
  ConfigurationApprovalRecord,
  ConfigurationEntryRecord,
  ConfigurationSnapshotRecord,
  ConfigurationVersionRecord,
  FeatureFlagRecord
} from "../types/configurationPlatform";

const NOW = "2026-06-25T10:00:00.000Z";

export const CONFIGURATION_ENTRY_SEED: ConfigurationEntryRecord[] = [
  {
    id: "cfg_001",
    configKey: "consultation.duration_minutes",
    categoryId: "consultations",
    domainId: "consultation-duration",
    label: "Consultation duration",
    description: "Default consultation session length in minutes.",
    value: 45,
    valueType: "number",
    critical: false,
    activeVersion: 3,
    status: "active",
    updatedAt: NOW,
    updatedBy: "ops@bamsignal.com"
  },
  {
    id: "cfg_002",
    configKey: "followup.cadence_days",
    categoryId: "consultations",
    domainId: "follow-up-cadence",
    label: "Follow-up cadence",
    description: "Days between introduction follow-up checkpoints.",
    value: 3,
    valueType: "number",
    critical: false,
    activeVersion: 2,
    status: "active",
    updatedAt: NOW,
    updatedBy: "ops@bamsignal.com"
  },
  {
    id: "cfg_003",
    configKey: "applications.daily_limit",
    categoryId: "operations",
    domainId: "application-limits",
    label: "Daily application limit",
    description: "Maximum concierge applications processed per day per region.",
    value: 120,
    valueType: "number",
    critical: true,
    activeVersion: 4,
    status: "active",
    updatedAt: NOW,
    updatedBy: "admin@bamsignal.com"
  },
  {
    id: "cfg_004",
    configKey: "pricing.consultation_ngn",
    categoryId: "payments",
    domainId: "pricing",
    label: "Consultation price (NGN)",
    description: "Standard consultation fee — Paystack processes payment; this governs catalog price.",
    value: 25000,
    valueType: "number",
    critical: true,
    activeVersion: 5,
    status: "active",
    updatedAt: NOW,
    updatedBy: "finance@bamsignal.com"
  },
  {
    id: "cfg_005",
    configKey: "notifications.reminder_hours",
    categoryId: "notifications",
    domainId: "notification-timings",
    label: "Consultation reminder hours",
    description: "Hours before consultation to send member reminder.",
    value: [24, 2],
    valueType: "json",
    critical: false,
    activeVersion: 2,
    status: "active",
    updatedAt: NOW,
    updatedBy: "ops@bamsignal.com"
  },
  {
    id: "cfg_006",
    configKey: "archive.journey_retention_days",
    categoryId: "governance",
    domainId: "retention",
    label: "Journey archive retention",
    description: "Days before completed journeys move to cold archive.",
    value: 365,
    valueType: "number",
    critical: true,
    activeVersion: 1,
    status: "active",
    updatedAt: NOW,
    updatedBy: "governance@bamsignal.com"
  },
  {
    id: "cfg_007",
    configKey: "security.pin_attempt_limit",
    categoryId: "security",
    domainId: "limits",
    label: "PIN attempt limit",
    description: "Failed PIN attempts before temporary lockout.",
    value: 5,
    valueType: "number",
    critical: true,
    activeVersion: 2,
    status: "active",
    updatedAt: NOW,
    updatedBy: "security@bamsignal.com"
  },
  {
    id: "cfg_008",
    configKey: "journey.max_active_per_member",
    categoryId: "operations",
    domainId: "journey-settings",
    label: "Max active journeys per member",
    value: 1,
    valueType: "number",
    critical: false,
    activeVersion: 1,
    status: "active",
    updatedAt: NOW,
    updatedBy: "ops@bamsignal.com"
  }
];

export const CONFIGURATION_VERSION_SEED: ConfigurationVersionRecord[] = [
  {
    id: "ver_001",
    entryId: "cfg_004",
    versionNumber: 4,
    value: 20000,
    changeReason: "Previous consultation price",
    changedBy: "finance@bamsignal.com",
    createdAt: "2026-03-01T00:00:00.000Z"
  },
  {
    id: "ver_002",
    entryId: "cfg_004",
    versionNumber: 5,
    value: 25000,
    changeReason: "Q2 pricing adjustment — approved by finance",
    changedBy: "finance@bamsignal.com",
    createdAt: "2026-06-01T00:00:00.000Z"
  },
  {
    id: "ver_003",
    entryId: "cfg_003",
    versionNumber: 3,
    value: 100,
    changeReason: "Pre-launch capacity limit",
    changedBy: "ops@bamsignal.com",
    createdAt: "2026-05-01T00:00:00.000Z"
  }
];

export const FEATURE_FLAG_SEED: FeatureFlagRecord[] = [
  {
    id: "flag_001",
    flagKey: "voice_vibe_beta",
    categoryId: "institute",
    label: "Voice Vibe beta",
    description: "Gradual rollout of Voice Vibe profile feature.",
    mode: "gradual-rollout",
    rolloutConfig: { percentage: 25, note: "Nigeria members first" },
    enabled: true,
    updatedAt: NOW
  },
  {
    id: "flag_002",
    flagKey: "diaspora_consultant_routing",
    categoryId: "consultants",
    label: "Diaspora consultant routing",
    mode: "region-rollout",
    rolloutConfig: { regions: ["united-kingdom", "north-america"] },
    enabled: true,
    updatedAt: NOW
  },
  {
    id: "flag_003",
    flagKey: "executive_dashboard_v2",
    categoryId: "governance",
    label: "Executive dashboard v2",
    mode: "role-rollout",
    rolloutConfig: { roles: ["Executive", "Admin"] },
    enabled: true,
    updatedAt: NOW
  },
  {
    id: "flag_004",
    flagKey: "community_events_hub",
    categoryId: "events",
    label: "Community events hub",
    mode: "future-rollout",
    rolloutConfig: { note: "Scheduled for Q3 — not active" },
    enabled: false,
    updatedAt: NOW
  },
  {
    id: "flag_005",
    flagKey: "whatsapp_notifications",
    categoryId: "notifications",
    label: "WhatsApp notifications",
    mode: "enabled",
    rolloutConfig: {},
    enabled: true,
    updatedAt: NOW
  },
  {
    id: "flag_006",
    flagKey: "legacy_payment_fallback",
    categoryId: "payments",
    label: "Legacy payment fallback",
    mode: "disabled",
    rolloutConfig: {},
    enabled: false,
    updatedAt: NOW
  }
];

export const CONFIGURATION_APPROVAL_SEED: ConfigurationApprovalRecord[] = [
  {
    id: "appr_001",
    entryId: "cfg_003",
    configKey: "applications.daily_limit",
    label: "Daily application limit",
    proposedVersion: 5,
    proposedValue: 150,
    status: "pending",
    requestedBy: "ops@bamsignal.com",
    createdAt: "2026-06-24T14:00:00.000Z"
  },
  {
    id: "appr_002",
    entryId: "cfg_006",
    configKey: "archive.journey_retention_days",
    label: "Journey archive retention",
    proposedVersion: 2,
    proposedValue: 730,
    status: "pending",
    requestedBy: "governance@bamsignal.com",
    createdAt: "2026-06-23T09:00:00.000Z"
  }
];

export const CONFIGURATION_SNAPSHOT_SEED: ConfigurationSnapshotRecord[] = [
  {
    id: "snap_001",
    snapshotRef: "CFG-SNAP-2026-06-01",
    label: "Pre-Q2 pricing baseline",
    entryCount: 8,
    flagCount: 6,
    createdBy: "admin@bamsignal.com",
    createdAt: "2026-06-01T00:00:00.000Z"
  },
  {
    id: "snap_002",
    snapshotRef: "CFG-SNAP-2026-05-15",
    label: "Launch stabilization snapshot",
    entryCount: 7,
    flagCount: 5,
    createdBy: "ops@bamsignal.com",
    createdAt: "2026-05-15T12:00:00.000Z"
  }
];
