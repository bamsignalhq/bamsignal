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
    configKey: "payments.consultation_fee_ngn",
    categoryId: "payments",
    businessRuleId: "consultation-fee",
    label: "Consultation Fee",
    description: "Standard consultation fee in NGN — Paystack catalog price.",
    value: 25000,
    valueType: "number",
    critical: true,
    activeVersion: 5,
    status: "active",
    updatedAt: NOW,
    updatedBy: "finance@bamsignal.com"
  },
  {
    id: "cfg_002",
    configKey: "scheduling.working_hours",
    categoryId: "scheduling",
    businessRuleId: "working-hours",
    label: "Working Hours",
    description: "Institutional working hours for consultant availability (WAT).",
    value: { start: "09:00", end: "18:00", timezone: "Africa/Lagos" },
    valueType: "json",
    critical: false,
    activeVersion: 2,
    status: "active",
    updatedAt: NOW,
    updatedBy: "ops@bamsignal.com"
  },
  {
    id: "cfg_003",
    configKey: "scheduling.consultation_duration_minutes",
    categoryId: "scheduling",
    businessRuleId: "consultation-duration",
    label: "Consultation Duration",
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
    id: "cfg_004",
    configKey: "scheduling.meeting_buffer_minutes",
    categoryId: "scheduling",
    businessRuleId: "meeting-buffer",
    label: "Meeting Buffer",
    description: "Buffer between consultations for notes and handoff.",
    value: 15,
    valueType: "number",
    critical: false,
    activeVersion: 1,
    status: "active",
    updatedAt: NOW,
    updatedBy: "ops@bamsignal.com"
  },
  {
    id: "cfg_005",
    configKey: "consultants.assignment_rules",
    categoryId: "consultants",
    businessRuleId: "assignment-rules",
    label: "Assignment Rules",
    description: "Consultant assignment priority: city match, language, capacity.",
    value: { cityMatch: true, languageMatch: true, maxActiveJourneys: 12 },
    valueType: "json",
    critical: true,
    activeVersion: 2,
    status: "active",
    updatedAt: NOW,
    updatedBy: "ops@bamsignal.com"
  },
  {
    id: "cfg_006",
    configKey: "notifications.templates",
    categoryId: "notifications",
    businessRuleId: "notification-templates",
    label: "Notification Templates",
    description: "Email and WhatsApp template keys for institutional notifications.",
    value: { consultationReminder: "consult-reminder-v2", paymentReceipt: "payment-receipt-v1" },
    valueType: "json",
    critical: false,
    activeVersion: 2,
    status: "active",
    updatedAt: NOW,
    updatedBy: "ops@bamsignal.com"
  },
  {
    id: "cfg_007",
    configKey: "operations.journey_status_rules",
    categoryId: "operations",
    businessRuleId: "journey-status-rules",
    label: "Journey Status Rules",
    description: "Valid journey transitions and auto-archive thresholds.",
    value: { maxActivePerMember: 1, autoArchiveDays: 90 },
    valueType: "json",
    critical: true,
    activeVersion: 1,
    status: "active",
    updatedAt: NOW,
    updatedBy: "ops@bamsignal.com"
  },
  {
    id: "cfg_008",
    configKey: "operations.relationship_milestones",
    categoryId: "operations",
    businessRuleId: "relationship-milestones",
    label: "Relationship Milestones",
    description: "Milestone definitions for journey progression tracking.",
    value: ["introduction", "first-meeting", "compatibility-review", "commitment"],
    valueType: "json",
    critical: false,
    activeVersion: 1,
    status: "active",
    updatedAt: NOW,
    updatedBy: "ops@bamsignal.com"
  },
  {
    id: "cfg_009",
    configKey: "institution.archive_policies",
    categoryId: "institution",
    businessRuleId: "archive-policies",
    label: "Archive Policies",
    description: "Retention and cold-archive rules for journeys and documents.",
    value: { journeyRetentionDays: 365, documentRetentionDays: 730 },
    valueType: "json",
    critical: true,
    activeVersion: 1,
    status: "active",
    updatedAt: NOW,
    updatedBy: "governance@bamsignal.com"
  },
  {
    id: "cfg_010",
    configKey: "communities.success_story_policies",
    categoryId: "communities",
    businessRuleId: "success-story-policies",
    label: "Success Story Policies",
    description: "Consent and moderation rules for published success stories.",
    value: { requireDualConsent: true, moderationQueue: true },
    valueType: "json",
    critical: false,
    activeVersion: 1,
    status: "active",
    updatedAt: NOW,
    updatedBy: "ops@bamsignal.com"
  },
  {
    id: "cfg_011",
    configKey: "security.pin_attempt_limit",
    categoryId: "security",
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
    id: "cfg_012",
    configKey: "support.sla_hours",
    categoryId: "support",
    label: "Support SLA hours",
    description: "First-response SLA for institutional support tickets.",
    value: 24,
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
    entryId: "cfg_001",
    versionNumber: 4,
    value: 20000,
    changeReason: "Previous consultation fee",
    changedBy: "finance@bamsignal.com",
    createdAt: "2026-03-01T00:00:00.000Z"
  },
  {
    id: "ver_002",
    entryId: "cfg_001",
    versionNumber: 5,
    value: 25000,
    changeReason: "Q2 pricing adjustment — approved by finance",
    changedBy: "finance@bamsignal.com",
    createdAt: "2026-06-01T00:00:00.000Z"
  },
  {
    id: "ver_003",
    entryId: "cfg_005",
    versionNumber: 1,
    value: { cityMatch: true, maxActiveJourneys: 10 },
    changeReason: "Initial assignment rules",
    changedBy: "ops@bamsignal.com",
    createdAt: "2026-05-01T00:00:00.000Z"
  },
  {
    id: "ver_004",
    entryId: "cfg_005",
    versionNumber: 2,
    value: { cityMatch: true, languageMatch: true, maxActiveJourneys: 12 },
    changeReason: "Added language match for diaspora corridors",
    changedBy: "ops@bamsignal.com",
    createdAt: "2026-06-10T00:00:00.000Z"
  }
];

export const FEATURE_FLAG_SEED: FeatureFlagRecord[] = [
  {
    id: "flag_001",
    flagKey: "voice_vibe_beta",
    categoryId: "feature-flags",
    label: "Voice Vibe",
    description: "Voice profile feature for beta members.",
    mode: "beta",
    rolloutConfig: { percentage: 25, note: "Nigeria members first" },
    enabled: true,
    updatedAt: NOW
  },
  {
    id: "flag_002",
    flagKey: "diaspora_consultant_routing",
    categoryId: "consultants",
    label: "Diaspora consultant routing",
    mode: "preview",
    rolloutConfig: { regions: ["united-kingdom", "north-america"] },
    enabled: true,
    updatedAt: NOW
  },
  {
    id: "flag_003",
    flagKey: "executive_dashboard_v2",
    categoryId: "operations",
    label: "Executive dashboard v2",
    mode: "internal-only",
    rolloutConfig: { roles: ["Executive", "Admin"] },
    enabled: true,
    updatedAt: NOW
  },
  {
    id: "flag_004",
    flagKey: "community_events_hub",
    categoryId: "events",
    label: "Community events hub",
    mode: "preview",
    rolloutConfig: { note: "Staged preview for events team" },
    enabled: true,
    updatedAt: NOW
  },
  {
    id: "flag_005",
    flagKey: "whatsapp_notifications",
    categoryId: "notifications",
    label: "WhatsApp notifications",
    mode: "enable",
    rolloutConfig: {},
    enabled: true,
    updatedAt: NOW
  },
  {
    id: "flag_006",
    flagKey: "legacy_payment_fallback",
    categoryId: "payments",
    label: "Legacy payment fallback",
    mode: "disable",
    rolloutConfig: {},
    enabled: false,
    updatedAt: NOW
  },
  {
    id: "flag_007",
    flagKey: "research_survey_module",
    categoryId: "research",
    label: "Research survey module",
    mode: "maintenance",
    rolloutConfig: { note: "Temporarily disabled during data migration" },
    enabled: false,
    updatedAt: NOW
  }
];

export const CONFIGURATION_APPROVAL_SEED: ConfigurationApprovalRecord[] = [
  {
    id: "appr_001",
    entryId: "cfg_005",
    configKey: "consultants.assignment_rules",
    label: "Assignment Rules",
    proposedVersion: 3,
    proposedValue: { cityMatch: true, languageMatch: true, maxActiveJourneys: 15 },
    status: "pending",
    requestedBy: "ops@bamsignal.com",
    createdAt: "2026-06-24T14:00:00.000Z"
  },
  {
    id: "appr_002",
    entryId: "cfg_009",
    configKey: "institution.archive_policies",
    label: "Archive Policies",
    proposedVersion: 2,
    proposedValue: { journeyRetentionDays: 730, documentRetentionDays: 1095 },
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
    entryCount: 12,
    flagCount: 7,
    createdBy: "admin@bamsignal.com",
    createdAt: "2026-06-01T00:00:00.000Z"
  },
  {
    id: "snap_002",
    snapshotRef: "CFG-SNAP-2026-05-15",
    label: "Launch stabilization snapshot",
    entryCount: 10,
    flagCount: 6,
    createdBy: "ops@bamsignal.com",
    createdAt: "2026-05-15T12:00:00.000Z"
  }
];
