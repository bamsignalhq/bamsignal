/** Remote Configuration Center™ — operational settings without redeployment. */

import { CONFIGURATION_PLATFORM_ADMIN_BRAND } from "./configurationPlatformAdmin";

export const CONFIGURATION_PLATFORM_BRAND = CONFIGURATION_PLATFORM_ADMIN_BRAND;

export const CONFIGURATION_SECTIONS = [
  { id: "discovery", label: "Discovery" },
  { id: "messaging", label: "Messaging" },
  { id: "signals", label: "Signals" },
  { id: "consultations", label: "Consultations" },
  { id: "payments", label: "Payments" },
  { id: "notifications", label: "Notifications" },
  { id: "verification", label: "Verification" },
  { id: "moderation", label: "Moderation" },
  { id: "matching", label: "Matching" },
  { id: "ai", label: "AI" }
] as const;

export type ConfigurationSectionId = (typeof CONFIGURATION_SECTIONS)[number]["id"];

/** @deprecated Use ConfigurationSectionId */
export type ConfigurationCategoryId = ConfigurationSectionId;

export const CONFIGURATION_SECTION_LABELS: Record<ConfigurationSectionId, string> =
  Object.fromEntries(CONFIGURATION_SECTIONS.map((item) => [item.id, item.label])) as Record<
    ConfigurationSectionId,
    string
  >;

/** @deprecated */
export const CONFIGURATION_CATEGORY_LABELS = CONFIGURATION_SECTION_LABELS;
/** @deprecated */
export const CONFIGURATION_CATEGORIES = CONFIGURATION_SECTIONS;

export const REMOTE_CONFIG_KEYS = [
  { key: "signals.free_daily_limit", section: "signals", label: "Free daily signals", valueType: "number" },
  { key: "messaging.max_messages_per_day", section: "messaging", label: "Maximum messages", valueType: "number" },
  { key: "discovery.max_profile_photos", section: "discovery", label: "Maximum profile photos", valueType: "number" },
  {
    key: "discovery.min_profile_completeness",
    section: "discovery",
    label: "Minimum profile completeness",
    valueType: "number"
  },
  { key: "payments.boost_pricing_ngn", section: "payments", label: "Boost pricing", valueType: "number" },
  { key: "payments.referral_reward_ngn", section: "payments", label: "Referral rewards", valueType: "number" },
  { key: "consultations.pricing_ngn", section: "consultations", label: "Consultation pricing", valueType: "number" },
  { key: "consultations.voice_duration_seconds", section: "consultations", label: "Voice duration", valueType: "number" },
  { key: "verification.otp_cooldown_seconds", section: "verification", label: "OTP cooldown", valueType: "number" },
  { key: "notifications.retry_interval_seconds", section: "notifications", label: "Retry intervals", valueType: "number" }
] as const;

export type RemoteConfigKey = (typeof REMOTE_CONFIG_KEYS)[number]["key"];

export const REMOTE_CONFIG_DEFAULTS: Record<string, string | number | boolean | Record<string, unknown>> = {
  "signals.free_daily_limit": 5,
  "messaging.max_messages_per_day": 50,
  "discovery.max_profile_photos": 6,
  "discovery.min_profile_completeness": 70,
  "payments.boost_pricing_ngn": 1500,
  "payments.referral_reward_ngn": 500,
  "consultations.pricing_ngn": 25000,
  "consultations.voice_duration_seconds": 60,
  "consultations.working_hours": { start: "09:00", end: "18:00", timezone: "Africa/Lagos" },
  "consultations.duration_minutes": 45,
  "consultations.meeting_buffer_minutes": 15,
  "verification.otp_cooldown_seconds": 60,
  "verification.pin_attempt_limit": 5,
  "notifications.retry_interval_seconds": 300,
  "notifications.templates": { consultationReminder: "consult-reminder-v2", paymentReceipt: "payment-receipt-v1" },
  "matching.assignment_rules": { cityMatch: true, languageMatch: true, maxActiveJourneys: 12 },
  "matching.journey_status_rules": { maxActivePerMember: 1, autoArchiveDays: 90 },
  "moderation.support_sla_hours": 24,
  "moderation.success_story_policies": { requireDualConsent: true, moderationQueue: true },
  "ai.matching_experiment_weight": 0.15
};

export const REMOTE_CONFIG_OFFLINE_CACHE_KEY = "bamsignal.remoteConfig.v1";
export const REMOTE_CONFIG_CACHE_TTL_MS = 60_000;

export const CONFIGURATION_BUSINESS_RULES = [
  { id: "consultation-fee", label: "Consultation Fee" },
  { id: "working-hours", label: "Working Hours" },
  { id: "consultation-duration", label: "Consultation Duration" },
  { id: "meeting-buffer", label: "Meeting Buffer" },
  { id: "assignment-rules", label: "Assignment Rules" },
  { id: "notification-templates", label: "Notification Templates" },
  { id: "journey-status-rules", label: "Journey Status Rules" },
  { id: "relationship-milestones", label: "Relationship Milestones" },
  { id: "archive-policies", label: "Archive Policies" },
  { id: "success-story-policies", label: "Success Story Policies" }
] as const;

export type ConfigurationBusinessRuleId = (typeof CONFIGURATION_BUSINESS_RULES)[number]["id"];

export const CONFIGURATION_BUSINESS_RULE_LABELS: Record<ConfigurationBusinessRuleId, string> =
  Object.fromEntries(CONFIGURATION_BUSINESS_RULES.map((item) => [item.id, item.label])) as Record<
    ConfigurationBusinessRuleId,
    string
  >;

export const FEATURE_FLAG_MODES = [
  "enable",
  "disable",
  "preview",
  "internal-only",
  "beta",
  "maintenance"
] as const;

export type FeatureFlagModeId = (typeof FEATURE_FLAG_MODES)[number];

export const FEATURE_FLAG_MODE_LABELS: Record<FeatureFlagModeId, string> = {
  enable: "Enable",
  disable: "Disable",
  preview: "Preview",
  "internal-only": "Internal Only",
  beta: "Beta",
  maintenance: "Maintenance"
};

export const CONFIGURATION_ENTRY_STATUSES = ["draft", "active", "pending-approval", "archived"] as const;
export type ConfigurationEntryStatusId = (typeof CONFIGURATION_ENTRY_STATUSES)[number];

export const CONFIGURATION_APPROVAL_STATUSES = ["pending", "approved", "rejected", "rolled-back"] as const;
export type ConfigurationApprovalStatusId = (typeof CONFIGURATION_APPROVAL_STATUSES)[number];

export const CONFIGURATION_PLATFORM_DB_TABLES = [
  "configuration_entries",
  "configuration_versions",
  "feature_flags",
  "configuration_approvals",
  "configuration_snapshots"
] as const;

export const CONFIGURATION_AUDIT_ACTIONS = [
  "config-updated",
  "config-draft-saved",
  "config-published",
  "config-approved",
  "config-rejected",
  "config-rolled-back",
  "feature-flag-updated",
  "snapshot-created"
] as const;

export type ConfigurationAuditActionId = (typeof CONFIGURATION_AUDIT_ACTIONS)[number];

export const CONFIGURATION_PLATFORM_RULES = [
  "Operational settings live here — no redeploy required to change platform behavior.",
  "Typed values are validated before save (number, boolean, string, json).",
  "Draft → publish workflow for safe rollout of critical settings.",
  "Every change records who changed it, when, old value, new value, and reason.",
  "Version history with rollback for every published configuration change."
] as const;

export const CONFIGURATION_FUTURE_ARCHITECTURE = [
  { id: "environment-promotion", label: "Environment Promotion" },
  { id: "realtime-sync", label: "Realtime Sync" }
] as const;
