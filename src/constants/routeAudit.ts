/** Route & Navigation Audit™ — complete route inventory and health reporting. */

export const ROUTE_AUDIT_BRAND = "Route & Navigation Audit™";
export const ROUTE_AUDIT_ADMIN_PATH = "/hard/audit/routes";

export type RouteAuditAreaId =
  | "public"
  | "member"
  | "consultant"
  | "admin"
  | "institute"
  | "events"
  | "concierge"
  | "century";

export type RouteHealthStatusId =
  | "healthy"
  | "duplicate"
  | "deprecated"
  | "orphaned"
  | "needs-redirect";

export const ROUTE_AUDIT_AREAS: { id: RouteAuditAreaId; label: string }[] = [
  { id: "public", label: "Public routes" },
  { id: "member", label: "Member routes" },
  { id: "consultant", label: "Consultant routes" },
  { id: "admin", label: "Admin routes" },
  { id: "institute", label: "Institute routes" },
  { id: "events", label: "Events routes" },
  { id: "concierge", label: "Concierge routes" },
  { id: "century", label: "Century routes" }
];

export const ROUTE_AUDIT_AREA_LABELS: Record<RouteAuditAreaId, string> = Object.fromEntries(
  ROUTE_AUDIT_AREAS.map((item) => [item.id, item.label])
) as Record<RouteAuditAreaId, string>;

export const ROUTE_HEALTH_STATUSES: { id: RouteHealthStatusId; label: string }[] = [
  { id: "healthy", label: "Healthy" },
  { id: "duplicate", label: "Duplicate" },
  { id: "deprecated", label: "Deprecated" },
  { id: "orphaned", label: "Orphaned" },
  { id: "needs-redirect", label: "Needs Redirect" }
];

export const ROUTE_HEALTH_STATUS_LABELS: Record<RouteHealthStatusId, string> = Object.fromEntries(
  ROUTE_HEALTH_STATUSES.map((item) => [item.id, item.label])
) as Record<RouteHealthStatusId, string>;
