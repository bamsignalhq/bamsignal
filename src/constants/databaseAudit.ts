/** Database Audit Center™ — Supabase migration certainty layer. */

export const DATABASE_AUDIT_BRAND = "Database Audit Center™";
export const DATABASE_AUDIT_ADMIN_PATH = "/hard/audit/database";

export type DatabaseDomainId =
  | "consultants"
  | "members"
  | "introductions"
  | "follow-ups"
  | "archives"
  | "legacy"
  | "payments"
  | "notifications"
  | "documents"
  | "support"
  | "safety"
  | "careers"
  | "academy"
  | "qa"
  | "finance";

export type DatabaseHealthStatusId =
  | "healthy"
  | "partial"
  | "legacy-dependency"
  | "missing"
  | "needs-migration";

export const DATABASE_DOMAINS: { id: DatabaseDomainId; label: string }[] = [
  { id: "consultants", label: "Consultants" },
  { id: "members", label: "Members" },
  { id: "introductions", label: "Introductions" },
  { id: "follow-ups", label: "Follow-ups" },
  { id: "archives", label: "Archives" },
  { id: "legacy", label: "Legacy" },
  { id: "payments", label: "Payments" },
  { id: "notifications", label: "Notifications" },
  { id: "documents", label: "Documents" },
  { id: "support", label: "Support" },
  { id: "safety", label: "Safety" },
  { id: "careers", label: "Careers" },
  { id: "academy", label: "Academy" },
  { id: "qa", label: "QA" },
  { id: "finance", label: "Finance" }
];

export const DATABASE_DOMAIN_LABELS: Record<DatabaseDomainId, string> = Object.fromEntries(
  DATABASE_DOMAINS.map((item) => [item.id, item.label])
) as Record<DatabaseDomainId, string>;

export const DATABASE_HEALTH_STATUSES: { id: DatabaseHealthStatusId; label: string }[] = [
  { id: "healthy", label: "Healthy" },
  { id: "partial", label: "Partial" },
  { id: "legacy-dependency", label: "Legacy Dependency" },
  { id: "missing", label: "Missing" },
  { id: "needs-migration", label: "Needs Migration" }
];

export const DATABASE_HEALTH_STATUS_LABELS: Record<DatabaseHealthStatusId, string> = Object.fromEntries(
  DATABASE_HEALTH_STATUSES.map((item) => [item.id, item.label])
) as Record<DatabaseHealthStatusId, string>;
