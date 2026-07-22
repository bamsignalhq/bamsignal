export type AdminRoleSlug =
  | "super_admin"
  | "platform_administrator"
  | "operations_administrator"
  | "moderator"
  | "concierge_agent"
  | "support_agent"
  | "finance_administrator"
  | "trust_administrator"
  | "read_only_auditor";

export type ModerationReportStatus =
  | "submitted"
  | "triaged"
  | "assigned"
  | "investigating"
  | "awaiting_response"
  | "action_taken"
  | "resolved"
  | "dismissed"
  | "appealed"
  | "closed";

export type SupportTicketStatus =
  | "open"
  | "assigned"
  | "awaiting_member"
  | "awaiting_staff"
  | "resolved"
  | "closed"
  | "reopened"
  | "escalated";

export type ConciergeQueueStatus =
  | "queued"
  | "assigned"
  | "in_progress"
  | "awaiting_review"
  | "escalated"
  | "completed"
  | "closed";

export type UserSafetyActionType =
  | "suspend"
  | "unsuspend"
  | "shadow_ban"
  | "remove_shadow_ban"
  | "temporary_lock"
  | "permanent_lock"
  | "photo_approval"
  | "profile_approval"
  | "identity_review"
  | "trust_review"
  | "genotype_review"
  | "verification_override";

export type RuntimeConfigKey =
  | "signup"
  | "messaging"
  | "payments"
  | "notifications"
  | "matching"
  | "concierge"
  | "maintenance_mode"
  | "emergency_banner"
  | "beta_features";

export type AdminEventType =
  | "admin.login"
  | "admin.logout"
  | "report.created"
  | "report.assigned"
  | "report.closed"
  | "ticket.created"
  | "ticket.updated"
  | "ticket.closed"
  | "concierge.assigned"
  | "concierge.completed"
  | "user.suspended"
  | "user.restored"
  | "feature.updated"
  | "configuration.updated";

export const MODERATION_REPORT_STATUSES: ModerationReportStatus[] = [
  "submitted",
  "triaged",
  "assigned",
  "investigating",
  "awaiting_response",
  "action_taken",
  "resolved",
  "dismissed",
  "appealed",
  "closed"
];

export const SUPPORT_TICKET_STATUSES: SupportTicketStatus[] = [
  "open",
  "assigned",
  "awaiting_member",
  "awaiting_staff",
  "resolved",
  "closed",
  "reopened",
  "escalated"
];

export const ADMIN_ROLES: AdminRoleSlug[] = [
  "super_admin",
  "platform_administrator",
  "operations_administrator",
  "moderator",
  "concierge_agent",
  "support_agent",
  "finance_administrator",
  "trust_administrator",
  "read_only_auditor"
];

export const RUNTIME_CONFIG_KEYS: RuntimeConfigKey[] = [
  "signup",
  "messaging",
  "payments",
  "notifications",
  "matching",
  "concierge",
  "maintenance_mode",
  "emergency_banner",
  "beta_features"
];
