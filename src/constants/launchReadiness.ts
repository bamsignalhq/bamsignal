/** Launch Readiness Command Center™ — final institutional readiness dashboard. */

export const LAUNCH_READINESS_BRAND = "Launch Readiness Command Center™";
export const LAUNCH_READINESS_ADMIN_PATH = "/hard/launch";

export type LaunchReadinessAreaId =
  | "routes"
  | "database"
  | "permissions"
  | "journey-integrity"
  | "payments"
  | "scheduling"
  | "notifications"
  | "consultants"
  | "support"
  | "safety"
  | "finance"
  | "documents"
  | "academy"
  | "operations"
  | "executive";

export type LaunchReadinessStatusId = "ready" | "needs-review" | "blocked" | "critical";

export const LAUNCH_READINESS_AREAS: { id: LaunchReadinessAreaId; label: string }[] = [
  { id: "routes", label: "Routes" },
  { id: "database", label: "Database" },
  { id: "permissions", label: "Permissions" },
  { id: "journey-integrity", label: "Journey Integrity" },
  { id: "payments", label: "Payments" },
  { id: "scheduling", label: "Scheduling" },
  { id: "notifications", label: "Notifications" },
  { id: "consultants", label: "Consultants" },
  { id: "support", label: "Support" },
  { id: "safety", label: "Safety" },
  { id: "finance", label: "Finance" },
  { id: "documents", label: "Documents" },
  { id: "academy", label: "Academy" },
  { id: "operations", label: "Operations" },
  { id: "executive", label: "Executive" }
];

export const LAUNCH_READINESS_AREA_LABELS: Record<LaunchReadinessAreaId, string> = Object.fromEntries(
  LAUNCH_READINESS_AREAS.map((item) => [item.id, item.label])
) as Record<LaunchReadinessAreaId, string>;

export const LAUNCH_READINESS_STATUSES: { id: LaunchReadinessStatusId; label: string }[] = [
  { id: "ready", label: "Ready" },
  { id: "needs-review", label: "Needs Review" },
  { id: "blocked", label: "Blocked" },
  { id: "critical", label: "Critical" }
];

export const LAUNCH_READINESS_STATUS_LABELS: Record<LaunchReadinessStatusId, string> = Object.fromEntries(
  LAUNCH_READINESS_STATUSES.map((item) => [item.id, item.label])
) as Record<LaunchReadinessStatusId, string>;
