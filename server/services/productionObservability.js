/**
 * Production Observability Center™ — server-side operational helpers.
 */

export const PRODUCTION_OBSERVABILITY_DB_TABLES = [
  "observability_service_snapshots",
  "observability_error_events",
  "observability_deployments",
  "observability_queue_snapshots",
  "observability_endpoint_metrics"
];

const STATUS_RANK = {
  healthy: 1,
  warning: 2,
  offline: 3
};

export function canAccessProductionObservability(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

export function productionObservabilityRouteRegistered(source) {
  return source.includes("/hard/observability") && source.includes("observability");
}

export function resolveWorstObservabilityStatus(statuses) {
  if (!statuses?.length) return "healthy";
  return statuses.reduce((worst, current) => {
    return STATUS_RANK[current] > STATUS_RANK[worst] ? current : worst;
  }, "healthy");
}

export function buildObservabilitySummaryLine(bundle) {
  const openErrors = bundle.errors.filter(
    (item) => item.triageStatus === "open" || item.triageStatus === "assigned"
  ).length;
  const degradedServices = bundle.services.filter((item) => item.status !== "healthy").length;
  return `${degradedServices} degraded · ${openErrors} open errors · ${bundle.summaryCards.find((item) => item.id === "active-members")?.value ?? "—"} active members`;
}

export function getProductionObservabilityDatabaseTableManifest() {
  return PRODUCTION_OBSERVABILITY_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "observability",
    migrationRef: "0013_production_observability.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at"]
  }));
}

export function triageObservabilityErrorRecord(error, action, actor, assignee) {
  if (action === "resolve") {
    return { ...error, triageStatus: "resolved" };
  }
  if (action === "ignore") {
    return { ...error, triageStatus: "ignored" };
  }
  return { ...error, triageStatus: "assigned", assignedTo: assignee ?? actor };
}

export function listSlowObservabilityEndpoints(endpoints, limit = 5) {
  return [...endpoints].sort((left, right) => right.p95ResponseMs - left.p95ResponseMs).slice(0, limit);
}

export function countObservabilityQueuesByStatus(queues) {
  return queues.reduce(
    (counts, queue) => {
      counts[queue.status] = (counts[queue.status] ?? 0) + 1;
      return counts;
    },
    { healthy: 0, warning: 0, offline: 0 }
  );
}
