/**
 * Enterprise API Center — server-side API operations logic.
 */

export const ENTERPRISE_API_CENTER_DB_TABLES = [
  "enterprise_api_endpoints",
  "enterprise_api_operations_snapshots",
  "enterprise_api_tool_runs",
  "enterprise_api_failed_jobs"
];

export const ENTERPRISE_API_TOOLS = [
  "disable-endpoint",
  "maintenance-mode",
  "retry-failed-jobs",
  "replay-requests",
  "api-documentation",
  "openapi-export"
];

export function getEnterpriseApiCenterDatabaseTableManifest() {
  return ENTERPRISE_API_CENTER_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "enterprise-api",
    migrationRef: "202606261900_enterprise_api_center.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"]
  }));
}

export function enterpriseApiRouteRegistered(source) {
  return source.includes("/hard/api") && source.includes("enterpriseapi");
}

export function canAccessEnterpriseApiCenter(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

function worstStatus(statuses) {
  const order = ["disabled", "maintenance", "degraded", "healthy"];
  for (const status of order) {
    if (statuses.includes(status)) return status;
  }
  return "healthy";
}

export function buildEnterpriseApiCenterSummary(endpoints, failedJobs) {
  const endpointCount = endpoints.length;
  const healthyCount = endpoints.filter((item) => item.status === "healthy").length;
  const degradedCount = endpoints.filter((item) => item.status === "degraded").length;
  const disabledCount = endpoints.filter((item) => item.status === "disabled").length;
  const maintenanceCount = endpoints.filter((item) => item.status === "maintenance").length;

  const activeEndpoints = endpoints.filter(
    (item) => item.status !== "disabled" && item.status !== "maintenance"
  );
  const totalRequestsPerMin = endpoints.reduce((sum, item) => sum + (item.requestsPerMin ?? 0), 0);
  const avgLatencyMs = activeEndpoints.length
    ? Math.round(
        activeEndpoints.reduce((sum, item) => sum + (item.latencyMs ?? 0), 0) / activeEndpoints.length
      )
    : 0;

  const totalErrors = endpoints.reduce((sum, item) => sum + (item.errorCount ?? 0), 0);
  const errorRatePercent =
    totalRequestsPerMin > 0
      ? Math.round((totalErrors / totalRequestsPerMin) * 1000) / 10
      : 0;

  const failedJobsCount = failedJobs.filter((item) => item.status === "pending").length;
  const healthStatus = worstStatus(endpoints.map((item) => item.status));

  let operationsScore = 100;
  if (degradedCount > 0) operationsScore -= degradedCount * 6;
  if (disabledCount > 0) operationsScore -= disabledCount * 10;
  if (maintenanceCount > 0) operationsScore -= maintenanceCount * 4;
  if (errorRatePercent > 2) operationsScore -= 8;
  if (avgLatencyMs > 400) operationsScore -= 6;
  if (failedJobsCount > 0) operationsScore -= failedJobsCount * 5;
  operationsScore = Math.max(0, Math.min(100, operationsScore));

  return {
    operationsScore,
    healthStatus,
    endpointCount,
    healthyCount,
    degradedCount,
    disabledCount,
    maintenanceCount,
    totalRequestsPerMin,
    avgLatencyMs,
    errorRatePercent,
    failedJobsCount
  };
}

export function formatEnterpriseApiSummaryLine(summary) {
  return `${summary.operationsScore}% ops · ${summary.endpointCount} endpoints · ${summary.totalRequestsPerMin} rpm · ${summary.avgLatencyMs}ms avg · ${summary.errorRatePercent}% errors`;
}

export function filterEndpointsByStatus(endpoints, status) {
  if (status === "all") return endpoints;
  return endpoints.filter((item) => item.status === status);
}

export function sortEndpointsByLatency(endpoints) {
  return [...endpoints].sort((a, b) => (b.latencyMs ?? 0) - (a.latencyMs ?? 0));
}
