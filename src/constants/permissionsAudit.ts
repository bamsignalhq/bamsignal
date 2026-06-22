/** Permissions Audit™ — role and access verification layer. */

export const PERMISSIONS_AUDIT_BRAND = "Permissions Audit™";
export const PERMISSIONS_AUDIT_ADMIN_PATH = "/hard/audit/security";

export type PermissionRoleId =
  | "member"
  | "consultant"
  | "senior-matchmaker"
  | "compatibility-specialist"
  | "family-values-advisor"
  | "diaspora-consultant"
  | "operations"
  | "support"
  | "research"
  | "executive"
  | "admin"
  | "super-admin";

export type PermissionVerifyAreaId =
  | "route-access"
  | "api-access"
  | "dashboard-access"
  | "document-access"
  | "finance-access"
  | "support-access"
  | "safety-access"
  | "audit-access";

export type PermissionSecurityStatusId = "secure" | "warning" | "critical";

export const PERMISSION_ROLES: { id: PermissionRoleId; label: string }[] = [
  { id: "member", label: "Member" },
  { id: "consultant", label: "Consultant" },
  { id: "senior-matchmaker", label: "Senior Matchmaker" },
  { id: "compatibility-specialist", label: "Compatibility Specialist" },
  { id: "family-values-advisor", label: "Family Values Advisor" },
  { id: "diaspora-consultant", label: "Diaspora Consultant" },
  { id: "operations", label: "Operations" },
  { id: "support", label: "Support" },
  { id: "research", label: "Research" },
  { id: "executive", label: "Executive" },
  { id: "admin", label: "Admin" },
  { id: "super-admin", label: "Super Admin" }
];

export const PERMISSION_ROLE_LABELS: Record<PermissionRoleId, string> = Object.fromEntries(
  PERMISSION_ROLES.map((item) => [item.id, item.label])
) as Record<PermissionRoleId, string>;

export const PERMISSION_VERIFY_AREAS: { id: PermissionVerifyAreaId; label: string }[] = [
  { id: "route-access", label: "Route access" },
  { id: "api-access", label: "API access" },
  { id: "dashboard-access", label: "Dashboard access" },
  { id: "document-access", label: "Document access" },
  { id: "finance-access", label: "Finance access" },
  { id: "support-access", label: "Support access" },
  { id: "safety-access", label: "Safety access" },
  { id: "audit-access", label: "Audit access" }
];

export const PERMISSION_VERIFY_AREA_LABELS: Record<PermissionVerifyAreaId, string> = Object.fromEntries(
  PERMISSION_VERIFY_AREAS.map((item) => [item.id, item.label])
) as Record<PermissionVerifyAreaId, string>;

export const PERMISSION_SECURITY_STATUSES: { id: PermissionSecurityStatusId; label: string }[] = [
  { id: "secure", label: "Secure" },
  { id: "warning", label: "Warning" },
  { id: "critical", label: "Critical" }
];

export const PERMISSION_SECURITY_STATUS_LABELS: Record<PermissionSecurityStatusId, string> =
  Object.fromEntries(
    PERMISSION_SECURITY_STATUSES.map((item) => [item.id, item.label])
  ) as Record<PermissionSecurityStatusId, string>;
