/**
 * Enterprise Monitoring, Observability & Incident Center™ — server-side NOC logic.
 */

export const MONITORING_CENTER_DB_TABLES = [
  "monitoring_services",
  "service_health_snapshots",
  "monitoring_incidents",
  "monitoring_alerts",
  "maintenance_windows",
  "metric_snapshots"
];

const STATUS_RANK = {
  unknown: 0,
  healthy: 1,
  maintenance: 2,
  degraded: 3,
  "partial-outage": 4,
  "major-outage": 5
};

export function getMonitoringCenterDatabaseTableManifest() {
  return MONITORING_CENTER_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "monitoring",
    migrationRef: "0012_monitoring_center.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"]
  }));
}

export function canAccessMonitoringCenter(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

export function resolveWorstMonitoringStatus(statuses) {
  if (!statuses?.length) return "unknown";
  return statuses.reduce((worst, current) => {
    return STATUS_RANK[current] > STATUS_RANK[worst] ? current : worst;
  }, "healthy");
}

export function countServicesByMonitoringStatus(services) {
  return services.reduce(
    (counts, service) => {
      const key = service.status ?? "unknown";
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    },
    { healthy: 0, degraded: 0, "partial-outage": 0, "major-outage": 0, maintenance: 0, unknown: 0 }
  );
}

export function buildMonitoringSummary(services, incidents, alerts, maintenance) {
  const counts = countServicesByMonitoringStatus(services);
  const outageCount =
    (counts["partial-outage"] ?? 0) + (counts["major-outage"] ?? 0) + (counts.offline ?? 0);
  const openIncidents = incidents.filter((item) => !["resolved", "closed"].includes(item.status)).length;
  const openAlerts = alerts.filter((item) => item.status === "open" || item.status === "acknowledged").length;
  const activeMaintenance = maintenance.filter((item) => item.status === "active").length;

  return {
    overallStatus: resolveWorstMonitoringStatus(services.map((item) => item.status)),
    healthyCount: counts.healthy ?? 0,
    degradedCount: counts.degraded ?? 0,
    outageCount,
    openIncidents,
    openAlerts,
    activeMaintenance
  };
}

export function appendIncidentTimeline(incident, input) {
  const entry = {
    at: new Date().toISOString(),
    actor: input.actor,
    note: input.note
  };
  return {
    ...incident,
    timeline: [...(incident.timeline ?? []), entry]
  };
}

export function acknowledgeAlert(alert, actor) {
  if (alert.status === "resolved") {
    throw new Error("Monitoring alert violation: already resolved");
  }
  return {
    ...alert,
    status: "acknowledged",
    acknowledgedBy: actor,
    acknowledgedAt: new Date().toISOString()
  };
}

export function resolveAlert(alert, actor) {
  return {
    ...alert,
    status: "resolved",
    acknowledgedBy: alert.acknowledgedBy ?? actor,
    acknowledgedAt: alert.acknowledgedAt ?? new Date().toISOString(),
    resolvedAt: new Date().toISOString()
  };
}

export function filterServicesBySection(services, sectionId) {
  if (!sectionId || sectionId === "overview") return services;
  if (sectionId === "integrations") {
    return services.filter((item) => item.sectionId === "integrations");
  }
  if (sectionId === "queues") {
    return services.filter(
      (item) => item.sectionId === "queues" || item.id === "queue-workers" || item.id === "background-jobs"
    );
  }
  if (sectionId === "jobs") {
    return services.filter((item) => item.sectionId === "jobs" || item.id === "cron-jobs");
  }
  return services.filter((item) => item.sectionId === sectionId);
}

export function listIntegrationServices(services) {
  return services.filter((item) => item.sectionId === "integrations");
}

export function listQueueServices(services) {
  return services.filter(
    (item) => item.sectionId === "queues" || item.id.includes("queue") || item.id === "background-jobs"
  );
}
