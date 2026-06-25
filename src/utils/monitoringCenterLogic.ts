import type {
  MaintenanceWindowRecord,
  MonitoringAlertRecord,
  MonitoringIncidentRecord,
  MonitoringSummary,
  ServiceHealthRecord
} from "../types/monitoringCenter";
import type {
  MonitoringSectionId,
  MonitoringServiceStatusId
} from "../constants/monitoringCenter";

const STATUS_RANK: Record<MonitoringServiceStatusId, number> = {
  unknown: 0,
  healthy: 1,
  maintenance: 2,
  degraded: 3,
  "partial-outage": 4,
  "major-outage": 5
};

export function resolveWorstMonitoringStatus(
  statuses: MonitoringServiceStatusId[]
): MonitoringServiceStatusId {
  if (!statuses.length) return "unknown";
  return statuses.reduce((worst, current) => {
    return STATUS_RANK[current] > STATUS_RANK[worst] ? current : worst;
  }, "healthy");
}

export function countServicesByMonitoringStatus(services: ServiceHealthRecord[]) {
  return services.reduce(
    (counts, service) => {
      const key = service.status;
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    },
    {
      healthy: 0,
      degraded: 0,
      "partial-outage": 0,
      "major-outage": 0,
      maintenance: 0,
      unknown: 0
    } as Record<MonitoringServiceStatusId, number>
  );
}

export function buildMonitoringSummary(
  services: ServiceHealthRecord[],
  incidents: MonitoringIncidentRecord[],
  alerts: MonitoringAlertRecord[],
  maintenance: MaintenanceWindowRecord[]
): MonitoringSummary {
  const counts = countServicesByMonitoringStatus(services);
  const outageCount = counts["partial-outage"] + counts["major-outage"];
  const openIncidents = incidents.filter((item) => !["resolved", "closed"].includes(item.status)).length;
  const openAlerts = alerts.filter(
    (item) => item.status === "open" || item.status === "acknowledged"
  ).length;
  const activeMaintenance = maintenance.filter((item) => item.status === "active").length;

  return {
    overallStatus: resolveWorstMonitoringStatus(services.map((item) => item.status)),
    healthyCount: counts.healthy,
    degradedCount: counts.degraded,
    outageCount,
    openIncidents,
    openAlerts,
    activeMaintenance
  };
}

export function appendIncidentTimeline(
  incident: MonitoringIncidentRecord,
  input: { actor: string; note: string }
): MonitoringIncidentRecord {
  return {
    ...incident,
    timeline: [
      ...incident.timeline,
      { at: new Date().toISOString(), actor: input.actor, note: input.note }
    ]
  };
}

export function acknowledgeAlert(
  alert: MonitoringAlertRecord,
  actor: string
): MonitoringAlertRecord {
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

export function resolveAlert(alert: MonitoringAlertRecord, actor: string): MonitoringAlertRecord {
  return {
    ...alert,
    status: "resolved",
    acknowledgedBy: alert.acknowledgedBy ?? actor,
    acknowledgedAt: alert.acknowledgedAt ?? new Date().toISOString(),
    resolvedAt: new Date().toISOString()
  };
}

export function filterServicesForSection(
  services: ServiceHealthRecord[],
  sectionId: MonitoringSectionId
): ServiceHealthRecord[] {
  if (sectionId === "overview") return services;
  if (sectionId === "integrations") {
    return services.filter((item) => item.sectionId === "integrations");
  }
  if (sectionId === "queues") {
    return services.filter(
      (item) =>
        item.sectionId === "queues" ||
        item.id === "queue-workers" ||
        item.id === "background-jobs"
    );
  }
  if (sectionId === "jobs") {
    return services.filter((item) => item.sectionId === "jobs" || item.id === "cron-jobs");
  }
  if (sectionId === "services") {
    return services.filter((item) => item.sectionId === "services");
  }
  if (sectionId === "infrastructure") {
    return services.filter((item) => item.sectionId === "infrastructure");
  }
  return services;
}

export function listIntegrationServices(services: ServiceHealthRecord[]) {
  return services.filter((item) => item.sectionId === "integrations");
}

export function listQueueServices(services: ServiceHealthRecord[]) {
  return services.filter(
    (item) =>
      item.sectionId === "queues" ||
      item.id === "queue-workers" ||
      item.id === "background-jobs"
  );
}

export function listOpenAlerts(alerts: MonitoringAlertRecord[]) {
  return alerts.filter((item) => item.status === "open" || item.status === "acknowledged");
}

export function listActiveIncidents(incidents: MonitoringIncidentRecord[]) {
  return incidents.filter((item) => !["resolved", "closed"].includes(item.status));
}

export function listUpcomingMaintenance(windows: MaintenanceWindowRecord[]) {
  return windows.filter((item) => item.status === "scheduled" || item.status === "active");
}

export function formatMonitoringSummaryLine(summary: MonitoringSummary) {
  return `${summary.healthyCount} healthy · ${summary.degradedCount} degraded · ${summary.outageCount} outage · ${summary.openIncidents} incidents · ${summary.openAlerts} alerts`;
}
