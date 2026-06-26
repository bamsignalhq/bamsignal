import type { AdminHealthSnapshot } from "../components/admin/AdminHealthPanel";
import {
  PLATFORM_HEALTH_MONITORED_SERVICES,
  PLATFORM_HEALTH_STATUS_LABELS,
  type PlatformHealthServiceId,
  type PlatformHealthStatusId
} from "../constants/platformHealth";
import {
  PLATFORM_HEALTH_ALERT_SEED,
  PLATFORM_HEALTH_INCIDENT_SEED,
  PLATFORM_HEALTH_SERVICE_SEED
} from "../data/platformHealthSeed";
import type {
  PlatformHealthCenterBundle,
  PlatformHealthIncidentRecord,
  PlatformHealthServiceRecord,
  PlatformHealthSummary
} from "../types/platformHealth";

const STATUS_RANK: Record<PlatformHealthStatusId, number> = {
  healthy: 1,
  warning: 2,
  critical: 3
};

export function worstPlatformHealthStatus(statuses: PlatformHealthStatusId[]): PlatformHealthStatusId {
  return statuses.reduce<PlatformHealthStatusId>(
    (worst, current) => (STATUS_RANK[current] > STATUS_RANK[worst] ? current : worst),
    "healthy"
  );
}

function liveStatusForService(
  serviceId: PlatformHealthServiceId,
  health: AdminHealthSnapshot | null
): PlatformHealthStatusId | null {
  if (!health) return null;

  switch (serviceId) {
    case "supabase":
    case "database":
      return health.database === "connected" ? "healthy" : "critical";
    case "authentication":
      return health.signupEmail ? "healthy" : "warning";
    case "storage":
      return health.photoStorage ? "healthy" : "critical";
    case "paystack":
      return health.paystack ? "healthy" : "critical";
    case "resend":
      return health.resend ? "healthy" : "critical";
    case "sendchamp":
      return health.sendchamp ? "healthy" : "warning";
    case "firebase":
      return health.firebase ? "healthy" : "warning";
    default:
      return null;
  }
}

export function buildPlatformHealthServiceRecords(
  health: AdminHealthSnapshot | null,
  checkedAt = new Date().toISOString()
): PlatformHealthServiceRecord[] {
  return PLATFORM_HEALTH_MONITORED_SERVICES.map((service) => {
    const seed = PLATFORM_HEALTH_SERVICE_SEED.find((item) => item.id === service.id);
    const liveStatus = liveStatusForService(service.id, health);
    const status = liveStatus ?? seed?.status ?? "warning";

    return {
      id: service.id,
      label: service.label,
      critical: service.critical,
      status,
      responseTimeMs: seed?.responseTimeMs ?? 0,
      lastSuccessAt: seed?.lastSuccessAt ?? checkedAt,
      lastFailureAt: seed?.lastFailureAt ?? null,
      failureCount24h: seed?.failureCount24h ?? 0,
      recoveryAttempts: seed?.recoveryAttempts ?? 0,
      checkedAt,
      note: seed?.note
    };
  });
}

export function buildPlatformHealthSummary(
  services: PlatformHealthServiceRecord[],
  checkedAt: string
): PlatformHealthSummary {
  const healthyCount = services.filter((item) => item.status === "healthy").length;
  const warningCount = services.filter((item) => item.status === "warning").length;
  const criticalCount = services.filter((item) => item.status === "critical").length;
  const criticalOfflineCount = services.filter(
    (item) => item.critical && item.status === "critical"
  ).length;
  const criticalServices = services.filter((item) => item.critical);
  const overallStatus = worstPlatformHealthStatus(criticalServices.map((item) => item.status));

  return {
    overallStatus,
    healthyCount,
    warningCount,
    criticalCount,
    criticalOfflineCount,
    lastCheckedAt: checkedAt
  };
}

export function partitionPlatformHealthIncidents(
  incidents: PlatformHealthIncidentRecord[]
): { activeIncidents: PlatformHealthIncidentRecord[]; resolvedIncidents: PlatformHealthIncidentRecord[] } {
  const activeIncidents = incidents.filter(
    (item) => item.status === "active" || item.status === "acknowledged"
  );
  const resolvedIncidents = incidents.filter((item) => item.status === "resolved");
  return { activeIncidents, resolvedIncidents };
}

export function buildPlatformHealthCenterBundle(
  health: AdminHealthSnapshot | null,
  options: { liveProbe?: boolean; incidents?: PlatformHealthIncidentRecord[] } = {}
): PlatformHealthCenterBundle {
  const checkedAt = new Date().toISOString();
  const services = buildPlatformHealthServiceRecords(health, checkedAt);
  const summary = buildPlatformHealthSummary(services, checkedAt);
  const incidents = options.incidents ?? [...PLATFORM_HEALTH_INCIDENT_SEED];
  const { activeIncidents, resolvedIncidents } = partitionPlatformHealthIncidents(incidents);

  return {
    generatedAt: checkedAt,
    liveProbe: options.liveProbe ?? false,
    summary,
    services,
    activeIncidents,
    resolvedIncidents,
    alerts: [...PLATFORM_HEALTH_ALERT_SEED]
  };
}

export function buildPlatformHealthSummaryLine(bundle: PlatformHealthCenterBundle): string {
  const { summary } = bundle;
  return `${summary.healthyCount} healthy · ${summary.warningCount} warning · ${summary.criticalCount} critical · ${PLATFORM_HEALTH_STATUS_LABELS[summary.overallStatus]}`;
}

export function acknowledgePlatformHealthIncident(
  incident: PlatformHealthIncidentRecord,
  actor: string,
  note?: string
): PlatformHealthIncidentRecord {
  const acknowledgedAt = new Date().toISOString();
  return {
    ...incident,
    status: "acknowledged",
    acknowledgedBy: actor,
    acknowledgedAt,
    timeline: [
      ...incident.timeline,
      { at: acknowledgedAt, actor, note: note ?? "Incident acknowledged" }
    ]
  };
}

export function formatPlatformHealthDuration(iso: string): string {
  const deltaMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.round(deltaMs / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
