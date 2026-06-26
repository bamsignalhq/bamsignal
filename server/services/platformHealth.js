/**
 * Platform Health Center™ — server-side operational helpers.
 */

export const PLATFORM_HEALTH_DB_TABLES = [
  "platform_health_snapshots",
  "platform_health_incidents",
  "platform_health_alerts",
  "platform_health_acknowledgements"
];

const STATUS_RANK = {
  healthy: 1,
  warning: 2,
  critical: 3
};

export function canAccessPlatformHealthCenter(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

export function platformHealthRouteRegistered(source) {
  return source.includes("/hard/platform-health") && source.includes("platformhealth");
}

export function resolveWorstPlatformHealthStatus(statuses) {
  if (!statuses?.length) return "healthy";
  return statuses.reduce((worst, current) => {
    return STATUS_RANK[current] > STATUS_RANK[worst] ? current : worst;
  }, "healthy");
}

export function buildPlatformHealthSummaryLine(bundle) {
  const { summary } = bundle;
  return `${summary.healthyCount} healthy · ${summary.warningCount} warning · ${summary.criticalCount} critical`;
}

export function getPlatformHealthDatabaseTableManifest() {
  return PLATFORM_HEALTH_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "platform-health",
    migrationRef: "202606259000_platform_health_center.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at"]
  }));
}

export function countPlatformHealthServicesByStatus(services) {
  return services.reduce(
    (counts, service) => {
      counts[service.status] = (counts[service.status] ?? 0) + 1;
      return counts;
    },
    { healthy: 0, warning: 0, critical: 0 }
  );
}

export function listActivePlatformHealthIncidents(incidents) {
  return incidents.filter((item) => item.status === "active" || item.status === "acknowledged");
}
