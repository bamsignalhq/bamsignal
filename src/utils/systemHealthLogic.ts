import {
  MONITORED_SERVICES,
  type MonitoredServiceId,
  type ServiceHealthStatusId
} from "../constants/systemHealth";
import {
  SYSTEM_HEALTH_DEPENDENCIES_SEED,
  SYSTEM_HEALTH_INCIDENTS_SEED,
  SYSTEM_HEALTH_SERVICE_SEED
} from "../data/systemHealthSeed";
import type { AdminHealthSnapshot } from "../components/admin/AdminHealthPanel";
import type {
  DependencyStatusRecord,
  HealthIncidentRecord,
  HealthSummary,
  ServiceHealthRecord,
  SystemHealthBundle
} from "../types/systemHealth";

const STATUS_RANK: Record<ServiceHealthStatusId, number> = {
  offline: 4,
  maintenance: 3,
  degraded: 2,
  healthy: 1
};

function worstStatus(statuses: ServiceHealthStatusId[]): ServiceHealthStatusId {
  return statuses.reduce<ServiceHealthStatusId>((worst, current) => {
    return STATUS_RANK[current] > STATUS_RANK[worst] ? current : worst;
  }, "healthy");
}

function liveStatusForService(
  serviceId: MonitoredServiceId,
  health: AdminHealthSnapshot | null
): ServiceHealthStatusId | null {
  if (!health) return null;

  switch (serviceId) {
    case "supabase":
      if (health.database !== "connected") return "offline";
      return health.signupEmail ? "healthy" : "degraded";
    case "paystack":
      return health.paystack ? "healthy" : "offline";
    case "resend":
      return health.resend ? "healthy" : "offline";
    case "sendchamp":
      return health.sendchamp ? "healthy" : "degraded";
    case "storage":
      return health.photoStorage ? "healthy" : "offline";
    case "email-queue":
      return health.resend ? "healthy" : "offline";
    case "whatsapp-queue":
      return health.sendchamp ? "healthy" : "degraded";
    case "background-jobs":
      return health.firebase ? "healthy" : "degraded";
    default:
      return null;
  }
}

export function buildServiceHealthRecords(
  health: AdminHealthSnapshot | null,
  checkedAt = new Date().toISOString()
): ServiceHealthRecord[] {
  return MONITORED_SERVICES.map((service) => {
    const seed = SYSTEM_HEALTH_SERVICE_SEED.find((item) => item.id === service.id);
    const liveStatus = liveStatusForService(service.id, health);
    const status = liveStatus ?? seed?.status ?? "degraded";

    return {
      id: service.id,
      label: service.label,
      category: service.category,
      critical: service.critical,
      status,
      metrics: seed?.metrics ?? {
        uptimePercent: 0,
        responseTimeMs: 0,
        errorCount24h: 0,
        lastFailureAt: null,
        recoveryTimeMinutes: null
      },
      note: seed?.note ?? "Monitored institutional dependency.",
      checkedAt
    };
  });
}

export function buildHealthSummary(services: ServiceHealthRecord[], checkedAt: string): HealthSummary {
  const counts = {
    healthy: 0,
    degraded: 0,
    offline: 0,
    maintenance: 0
  };

  for (const service of services) {
    counts[service.status] += 1;
  }

  const criticalOfflineCount = services.filter(
    (service) => service.critical && (service.status === "offline" || service.status === "maintenance")
  ).length;

  const overallStatus = worstStatus(services.map((service) => service.status));

  return {
    overallStatus,
    healthyCount: counts.healthy,
    degradedCount: counts.degraded,
    offlineCount: counts.offline,
    maintenanceCount: counts.maintenance,
    criticalOfflineCount,
    lastCheckedAt: checkedAt
  };
}

export function buildDependencyStatuses(services: ServiceHealthRecord[]): DependencyStatusRecord[] {
  const byId = Object.fromEntries(services.map((service) => [service.id, service])) as Record<
    MonitoredServiceId,
    ServiceHealthRecord
  >;

  return SYSTEM_HEALTH_DEPENDENCIES_SEED.map((dependency) => {
    const statuses = dependency.dependsOn.map((serviceId) => byId[serviceId]?.status ?? "offline");
    return {
      id: dependency.id,
      label: dependency.label,
      dependsOn: [...dependency.dependsOn],
      status: worstStatus(statuses),
      impact: dependency.impact
    };
  });
}

export function listHealthIncidents(): HealthIncidentRecord[] {
  return [...SYSTEM_HEALTH_INCIDENTS_SEED].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
  );
}

export function buildSystemHealthBundle(
  health: AdminHealthSnapshot | null,
  options?: { checkedAt?: string; liveProbe?: boolean }
): SystemHealthBundle {
  const checkedAt = options?.checkedAt ?? new Date().toISOString();
  const services = buildServiceHealthRecords(health, checkedAt);

  return {
    generatedAt: checkedAt,
    summary: buildHealthSummary(services, checkedAt),
    services,
    dependencies: buildDependencyStatuses(services),
    incidents: listHealthIncidents(),
    liveProbe: options?.liveProbe ?? health !== null
  };
}

export function formatUptimePercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatResponseTimeMs(value: number): string {
  return `${Math.round(value)} ms`;
}

export function formatRecoveryTime(minutes: number | null): string {
  if (minutes === null) return "—";
  return `${minutes} min`;
}

export function formatLastFailure(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}
