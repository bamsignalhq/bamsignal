import type {
  ConfigurationApprovalRecord,
  ConfigurationEntryRecord,
  ConfigurationSnapshotRecord,
  ConfigurationVersionRecord,
  FeatureFlagRecord
} from "../types/configurationPlatform";
import { REMOTE_CONFIG_DEFAULTS } from "../constants/configurationPlatform";

const NOW = "2026-06-26T15:00:00.000Z";

function entry(
  id: string,
  configKey: string,
  categoryId: ConfigurationEntryRecord["categoryId"],
  label: string,
  valueType: ConfigurationEntryRecord["valueType"],
  extra: Partial<ConfigurationEntryRecord> = {}
): ConfigurationEntryRecord {
  const value = REMOTE_CONFIG_DEFAULTS[configKey] ?? extra.value ?? 0;
  return {
    id,
    configKey,
    categoryId,
    label,
    value,
    valueType,
    critical: extra.critical ?? false,
    activeVersion: extra.activeVersion ?? 1,
    status: extra.status ?? "active",
    draftValue: extra.draftValue,
    updatedAt: NOW,
    updatedBy: extra.updatedBy ?? "ops@bamsignal.com",
    description: extra.description,
    businessRuleId: extra.businessRuleId
  };
}

export const CONFIGURATION_ENTRY_SEED: ConfigurationEntryRecord[] = [
  entry("cfg_sig_001", "signals.free_daily_limit", "signals", "Free daily signals", "number", {
    description: "Number of free signals a member can send per day."
  }),
  entry("cfg_msg_001", "messaging.max_messages_per_day", "messaging", "Maximum messages", "number", {
    description: "Daily outbound message cap per member conversation."
  }),
  entry("cfg_dis_001", "discovery.max_profile_photos", "discovery", "Maximum profile photos", "number"),
  entry("cfg_dis_002", "discovery.min_profile_completeness", "discovery", "Minimum profile completeness", "number", {
    description: "Minimum profile completeness percentage required for discover visibility."
  }),
  entry("cfg_pay_001", "payments.boost_pricing_ngn", "payments", "Boost pricing", "number", {
    critical: true,
    activeVersion: 2
  }),
  entry("cfg_pay_002", "payments.referral_reward_ngn", "payments", "Referral rewards", "number"),
  entry("cfg_pay_003", "payments.consultation_fee_ngn", "payments", "Consultation pricing (legacy key)", "number", {
    value: REMOTE_CONFIG_DEFAULTS["consultations.pricing_ngn"],
    critical: true,
    activeVersion: 5
  }),
  entry("cfg_con_001", "consultations.pricing_ngn", "consultations", "Consultation pricing", "number", {
    businessRuleId: "consultation-fee",
    critical: true,
    activeVersion: 5
  }),
  entry("cfg_con_002", "consultations.voice_duration_seconds", "consultations", "Voice duration", "number"),
  entry("cfg_con_003", "consultations.working_hours", "consultations", "Working hours", "json", {
    businessRuleId: "working-hours",
    valueType: "json"
  }),
  entry("cfg_con_004", "consultations.duration_minutes", "consultations", "Consultation duration", "number", {
    businessRuleId: "consultation-duration"
  }),
  entry("cfg_con_005", "consultations.meeting_buffer_minutes", "consultations", "Meeting buffer", "number", {
    businessRuleId: "meeting-buffer"
  }),
  entry("cfg_ver_001", "verification.otp_cooldown_seconds", "verification", "OTP cooldown", "number"),
  entry("cfg_ver_002", "verification.pin_attempt_limit", "verification", "PIN attempt limit", "number", {
    critical: true,
    activeVersion: 2
  }),
  entry("cfg_not_001", "notifications.retry_interval_seconds", "notifications", "Retry intervals", "number"),
  entry("cfg_not_002", "notifications.templates", "notifications", "Notification templates", "json", {
    businessRuleId: "notification-templates",
    valueType: "json"
  }),
  entry("cfg_mat_001", "matching.assignment_rules", "matching", "Assignment rules", "json", {
    businessRuleId: "assignment-rules",
    critical: true,
    activeVersion: 2,
    valueType: "json"
  }),
  entry("cfg_mat_002", "matching.journey_status_rules", "matching", "Journey status rules", "json", {
    businessRuleId: "journey-status-rules",
    critical: true,
    valueType: "json"
  }),
  entry("cfg_mod_001", "moderation.support_sla_hours", "moderation", "Support SLA hours", "number"),
  entry("cfg_mod_002", "moderation.success_story_policies", "moderation", "Success story policies", "json", {
    businessRuleId: "success-story-policies",
    valueType: "json"
  }),
  entry("cfg_ai_001", "ai.matching_experiment_weight", "ai", "AI matching experiment weight", "number", {
    status: "draft",
    draftValue: 0.25,
    description: "Draft weight for AI-assisted compatibility scoring."
  })
];

export const CONFIGURATION_VERSION_SEED: ConfigurationVersionRecord[] = [
  {
    id: "ver_001",
    entryId: "cfg_pay_003",
    versionNumber: 4,
    value: 20000,
    changeReason: "Previous consultation fee",
    changedBy: "finance@bamsignal.com",
    createdAt: "2026-03-01T00:00:00.000Z"
  },
  {
    id: "ver_002",
    entryId: "cfg_pay_003",
    versionNumber: 5,
    value: 25000,
    changeReason: "Q2 pricing adjustment — approved by finance",
    changedBy: "finance@bamsignal.com",
    createdAt: "2026-06-01T00:00:00.000Z"
  },
  {
    id: "ver_003",
    entryId: "cfg_mat_001",
    versionNumber: 1,
    value: { cityMatch: true, maxActiveJourneys: 10 },
    changeReason: "Initial assignment rules",
    changedBy: "ops@bamsignal.com",
    createdAt: "2026-05-01T00:00:00.000Z"
  },
  {
    id: "ver_004",
    entryId: "cfg_mat_001",
    versionNumber: 2,
    value: { cityMatch: true, languageMatch: true, maxActiveJourneys: 12 },
    changeReason: "Added language match for diaspora corridors",
    changedBy: "ops@bamsignal.com",
    createdAt: "2026-06-10T00:00:00.000Z"
  }
];

export const FEATURE_FLAG_SEED: FeatureFlagRecord[] = [];

export const CONFIGURATION_APPROVAL_SEED: ConfigurationApprovalRecord[] = [
  {
    id: "appr_001",
    entryId: "cfg_mat_001",
    configKey: "matching.assignment_rules",
    label: "Assignment Rules",
    proposedVersion: 3,
    proposedValue: { cityMatch: true, languageMatch: true, maxActiveJourneys: 15 },
    status: "pending",
    requestedBy: "ops@bamsignal.com",
    createdAt: "2026-06-24T14:00:00.000Z"
  }
];

export const CONFIGURATION_SNAPSHOT_SEED: ConfigurationSnapshotRecord[] = [
  {
    id: "snap_001",
    snapshotRef: "CFG-SNAP-2026-06-01",
    label: "Pre-Q2 remote config baseline",
    entryCount: 20,
    flagCount: 0,
    createdBy: "admin@bamsignal.com",
    createdAt: "2026-06-01T00:00:00.000Z"
  }
];
