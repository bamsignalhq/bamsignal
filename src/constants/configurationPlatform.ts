/** Institutional Configuration Center™ — centralized institutional configuration layer. */

import { CONFIGURATION_PLATFORM_ADMIN_BRAND } from "./configurationPlatformAdmin";

export const CONFIGURATION_PLATFORM_BRAND = CONFIGURATION_PLATFORM_ADMIN_BRAND;

export const CONFIGURATION_SECTIONS = [
  { id: "institution", label: "Institution" },
  { id: "payments", label: "Payments" },
  { id: "consultants", label: "Consultants" },
  { id: "scheduling", label: "Scheduling" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "support", label: "Support" },
  { id: "communities", label: "Communities" },
  { id: "events", label: "Events" },
  { id: "research", label: "Research" },
  { id: "operations", label: "Operations" },
  { id: "feature-flags", label: "Feature Flags" }
] as const;

export type ConfigurationSectionId = (typeof CONFIGURATION_SECTIONS)[number]["id"];

/** @deprecated Use ConfigurationSectionId — kept for entry field compatibility. */
export type ConfigurationCategoryId = ConfigurationSectionId;

export const CONFIGURATION_SECTION_LABELS: Record<ConfigurationSectionId, string> =
  Object.fromEntries(CONFIGURATION_SECTIONS.map((item) => [item.id, item.label])) as Record<
    ConfigurationSectionId,
    string
  >;

/** @deprecated Use CONFIGURATION_SECTION_LABELS */
export const CONFIGURATION_CATEGORY_LABELS = CONFIGURATION_SECTION_LABELS;

/** @deprecated Use CONFIGURATION_SECTIONS */
export const CONFIGURATION_CATEGORIES = CONFIGURATION_SECTIONS;

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
  "config-approved",
  "config-rejected",
  "config-rolled-back",
  "feature-flag-updated",
  "snapshot-created"
] as const;

export type ConfigurationAuditActionId = (typeof CONFIGURATION_AUDIT_ACTIONS)[number];

export const CONFIGURATION_PLATFORM_RULES = [
  "No critical business rule should require developers to edit code.",
  "Operations configures the institution safely through this center.",
  "Critical settings require approval before activation.",
  "Every change records changed by, previous value, current value, date, and reason.",
  "Rollback is available for every versioned configuration change."
] as const;

/** Future-ready — documented only, not implemented. */
export const CONFIGURATION_FUTURE_ARCHITECTURE = [
  { id: "remote-config", label: "Remote Config" },
  { id: "environment-promotion", label: "Environment Promotion" },
  { id: "configuration-versioning", label: "Configuration Versioning" },
  { id: "approval-workflow", label: "Approval Workflow" }
] as const;
