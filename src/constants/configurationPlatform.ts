/** Enterprise Configuration Platform™ — centralized runtime and feature configuration. */

import { CONFIGURATION_PLATFORM_ADMIN_BRAND } from "./configurationPlatformAdmin";

export const CONFIGURATION_PLATFORM_BRAND = CONFIGURATION_PLATFORM_ADMIN_BRAND;

export const CONFIGURATION_CATEGORIES = [
  { id: "institution", label: "Institution" },
  { id: "payments", label: "Payments" },
  { id: "notifications", label: "Notifications" },
  { id: "consultations", label: "Consultations" },
  { id: "scheduling", label: "Scheduling" },
  { id: "consultants", label: "Consultants" },
  { id: "operations", label: "Operations" },
  { id: "research", label: "Research" },
  { id: "events", label: "Events" },
  { id: "institute", label: "Institute" },
  { id: "communities", label: "Communities" },
  { id: "careers", label: "Careers" },
  { id: "support", label: "Support" },
  { id: "finance", label: "Finance" },
  { id: "security", label: "Security" },
  { id: "governance", label: "Governance" }
] as const;

export type ConfigurationCategoryId = (typeof CONFIGURATION_CATEGORIES)[number]["id"];

export const CONFIGURATION_CATEGORY_LABELS: Record<ConfigurationCategoryId, string> = Object.fromEntries(
  CONFIGURATION_CATEGORIES.map((item) => [item.id, item.label])
) as Record<ConfigurationCategoryId, string>;

export const FEATURE_FLAG_MODES = [
  "enabled",
  "disabled",
  "gradual-rollout",
  "region-rollout",
  "role-rollout",
  "future-rollout"
] as const;

export type FeatureFlagModeId = (typeof FEATURE_FLAG_MODES)[number];

export const FEATURE_FLAG_MODE_LABELS: Record<FeatureFlagModeId, string> = {
  enabled: "Enabled",
  disabled: "Disabled",
  "gradual-rollout": "Gradual rollout",
  "region-rollout": "Region rollout",
  "role-rollout": "Role rollout",
  "future-rollout": "Future rollout"
};

export const RUNTIME_CONFIG_DOMAINS = [
  "limits",
  "pricing",
  "journey-settings",
  "notification-timings",
  "application-limits",
  "consultation-duration",
  "follow-up-cadence",
  "archive-policies",
  "retention"
] as const;

export type RuntimeConfigDomainId = (typeof RUNTIME_CONFIG_DOMAINS)[number];

export const RUNTIME_CONFIG_DOMAIN_LABELS: Record<RuntimeConfigDomainId, string> = {
  limits: "Limits",
  pricing: "Pricing",
  "journey-settings": "Journey settings",
  "notification-timings": "Notification timings",
  "application-limits": "Application limits",
  "consultation-duration": "Consultation duration",
  "follow-up-cadence": "Follow-up cadence",
  "archive-policies": "Archive policies",
  retention: "Retention"
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
  "No magic numbers — all limits live in configuration.",
  "No scattered environment logic — runtime reads from this platform.",
  "Critical settings require approval before activation.",
  "Every change is versioned with rollback support.",
  "Every change is audit logged."
] as const;

/** Future-ready — documented only, not implemented. */
export const CONFIGURATION_FUTURE_ARCHITECTURE = [
  { id: "ab-testing", label: "A/B Testing" },
  { id: "canary-releases", label: "Canary Releases" },
  { id: "blue-green-deployments", label: "Blue/Green Deployments" },
  { id: "dynamic-config-service", label: "Dynamic Config Service" }
] as const;
