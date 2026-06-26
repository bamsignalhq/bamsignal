import type { AdminHealthSnapshot } from "../components/admin/AdminHealthPanel";
import {
  OBSERVABILITY_MONITORED_SERVICES,
  OBSERVABILITY_SUMMARY_METRICS,
  type ObservabilityServiceId,
  type ObservabilityServiceStatusId
} from "../constants/productionObservability";
import {
  OBSERVABILITY_ACTIVE_MEMBERS_SEED,
  OBSERVABILITY_DATABASE_SEED,
  OBSERVABILITY_DEPLOYMENT_SEED,
  OBSERVABILITY_ENDPOINT_SEED,
  OBSERVABILITY_ERROR_SEED,
  OBSERVABILITY_PERFORMANCE_SEED,
  OBSERVABILITY_QUEUE_SEED,
  OBSERVABILITY_SERVICE_SEED
} from "../data/productionObservabilitySeed";
import type {
  ObservabilityDatabaseHealth,
  ObservabilityEndpointMetric,
  ObservabilityPerformanceSnapshot,
  ObservabilityQueueRecord,
  ObservabilityServiceRecord,
  ObservabilitySummaryCard,
  ProductionObservabilityBundle
} from "../types/productionObservability";
import { BUILD_VERSION } from "../buildInfo";

const STATUS_RANK: Record<ObservabilityServiceStatusId, number> = {
  healthy: 1,
  warning: 2,
  offline: 3
};

function worstStatus(statuses: ObservabilityServiceStatusId[]): ObservabilityServiceStatusId {
  return statuses.reduce<ObservabilityServiceStatusId>(
    (worst, current) => (STATUS_RANK[current] > STATUS_RANK[worst] ? current : worst),
    "healthy"
  );
}

function liveStatusForService(
  serviceId: ObservabilityServiceId,
  health: AdminHealthSnapshot | null
): ObservabilityServiceStatusId | null {
  if (!health) return null;

  switch (serviceId) {
    case "supabase":
    case "postgres":
      return health.database === "connected" ? "healthy" : "offline";
    case "storage":
      return health.photoStorage ? "healthy" : "offline";
    case "paystack":
      return health.paystack ? "healthy" : "offline";
    case "resend":
      return health.resend ? "healthy" : "offline";
    case "sendchamp":
      return health.sendchamp ? "healthy" : "warning";
    case "firebase":
      return health.firebase ? "healthy" : "warning";
    default:
      return null;
  }
}

export function buildObservabilityServiceRecords(
  health: AdminHealthSnapshot | null,
  checkedAt = new Date().toISOString()
): ObservabilityServiceRecord[] {
  return OBSERVABILITY_MONITORED_SERVICES.map((service) => {
    const seed = OBSERVABILITY_SERVICE_SEED.find((item) => item.id === service.id);
    const liveStatus = liveStatusForService(service.id, health);
    const status = service.future ? "warning" : (liveStatus ?? seed?.status ?? "warning");

    return {
      id: service.id,
      label: service.label,
      critical: service.critical,
      status,
      responseTimeMs: seed?.responseTimeMs ?? 0,
      checkedAt,
      note: service.future ? "Planned — not yet provisioned" : seed?.note,
      future: service.future
    };
  });
}

export function buildObservabilitySummaryCards(
  services: ObservabilityServiceRecord[],
  queues: ObservabilityQueueRecord[],
  endpoints: ObservabilityEndpointMetric[],
  checkedAt: string
): ObservabilitySummaryCard[] {
  const criticalServices = services.filter((item) => item.critical && !item.future);
  const systemHealthStatus = worstStatus(criticalServices.map((item) => item.status));
  const healthyCritical = criticalServices.filter((item) => item.status === "healthy").length;

  const avgLatency =
    endpoints.length > 0
      ? Math.round(endpoints.reduce((sum, item) => sum + item.avgResponseMs, 0) / endpoints.length)
      : 0;
  const latencyStatus: ObservabilityServiceStatusId =
    avgLatency > 500 ? "offline" : avgLatency > 250 ? "warning" : "healthy";

  const totalFailures = endpoints.reduce((sum, item) => sum + item.failureCount, 0);
  const totalRequests = endpoints.length * 1000;
  const errorRate = totalRequests > 0 ? (totalFailures / totalRequests) * 100 : 0;
  const errorStatus: ObservabilityServiceStatusId =
    errorRate > 1 ? "offline" : errorRate > 0.3 ? "warning" : "healthy";

  const queueStatuses = queues.map((item) => item.status);
  const queueHealthStatus = worstStatus(queueStatuses);
  const queueDepth = queues.reduce((sum, item) => sum + item.depth, 0);

  const backgroundJobQueues = queues.filter((item) => item.id !== "failed");
  const backgroundStatus = worstStatus(backgroundJobQueues.map((item) => item.status));
  const activeJobs = backgroundJobQueues.reduce((sum, item) => sum + item.depth, 0);

  return OBSERVABILITY_SUMMARY_METRICS.map((metric) => {
    switch (metric.id) {
      case "system-health":
        return {
          id: metric.id,
          label: metric.label,
          value: `${healthyCritical}/${criticalServices.length} critical OK`,
          status: systemHealthStatus,
          detail: `Checked ${new Date(checkedAt).toLocaleTimeString()}`
        };
      case "api-latency":
        return {
          id: metric.id,
          label: metric.label,
          value: `${avgLatency} ms avg`,
          status: latencyStatus,
          detail: `p95 ${Math.max(...endpoints.map((item) => item.p95ResponseMs), 0)} ms`
        };
      case "active-members":
        return {
          id: metric.id,
          label: metric.label,
          value: OBSERVABILITY_ACTIVE_MEMBERS_SEED.toLocaleString(),
          status: "healthy",
          detail: "Members active in last 24h"
        };
      case "error-rate":
        return {
          id: metric.id,
          label: metric.label,
          value: `${errorRate.toFixed(2)}%`,
          status: errorStatus,
          detail: `${totalFailures} failures in window`
        };
      case "queue-health":
        return {
          id: metric.id,
          label: metric.label,
          value: `${queueDepth} pending`,
          status: queueHealthStatus,
          detail: `${queues.filter((item) => item.status !== "healthy").length} queues degraded`
        };
      case "background-jobs":
        return {
          id: metric.id,
          label: metric.label,
          value: `${activeJobs} active`,
          status: backgroundStatus,
          detail: `${queues.find((item) => item.id === "failed")?.depth ?? 0} in failed queue`
        };
    }
  });
}

export function listSlowEndpoints(
  endpoints: ObservabilityEndpointMetric[],
  limit = 5
): ObservabilityEndpointMetric[] {
  return [...endpoints]
    .sort((left, right) => right.p95ResponseMs - left.p95ResponseMs)
    .slice(0, limit);
}

export function buildObservabilityPerformanceSnapshot(
  checkedAt = new Date().toISOString()
): ObservabilityPerformanceSnapshot {
  return {
    ...OBSERVABILITY_PERFORMANCE_SEED,
    buildVersion: BUILD_VERSION,
    environment: import.meta.env.PROD ? "production" : "development",
    capturedAt: checkedAt
  };
}

export function buildObservabilityDatabaseHealth(
  health: AdminHealthSnapshot | null,
  checkedAt = new Date().toISOString()
): ObservabilityDatabaseHealth {
  const connected = health?.database === "connected";
  return {
    ...OBSERVABILITY_DATABASE_SEED,
    status: connected ? "healthy" : health === null ? "warning" : "offline",
    checkedAt
  };
}

export function buildProductionObservabilityBundle(
  health: AdminHealthSnapshot | null,
  errors = OBSERVABILITY_ERROR_SEED,
  options?: { checkedAt?: string; liveProbe?: boolean }
): ProductionObservabilityBundle {
  const checkedAt = options?.checkedAt ?? new Date().toISOString();
  const services = buildObservabilityServiceRecords(health, checkedAt);
  const endpoints = OBSERVABILITY_ENDPOINT_SEED.map((item) => ({ ...item, checkedAt }));
  const queues = OBSERVABILITY_QUEUE_SEED.map((item) => ({ ...item, checkedAt }));

  return {
    generatedAt: checkedAt,
    liveProbe: options?.liveProbe ?? health !== null,
    summaryCards: buildObservabilitySummaryCards(services, queues, endpoints, checkedAt),
    services,
    endpoints,
    queues,
    errors: [...errors].sort(
      (left, right) => new Date(right.lastSeenAt).getTime() - new Date(left.lastSeenAt).getTime()
    ),
    deployments: [...OBSERVABILITY_DEPLOYMENT_SEED].sort(
      (left, right) => new Date(right.deployedAt).getTime() - new Date(left.deployedAt).getTime()
    ),
    performance: buildObservabilityPerformanceSnapshot(checkedAt),
    database: buildObservabilityDatabaseHealth(health, checkedAt)
  };
}

export function formatObservabilityResponseTime(ms: number): string {
  if (ms <= 0) return "—";
  return `${Math.round(ms)} ms`;
}

export function formatObservabilityCheckedAt(value: string): string {
  return new Date(value).toLocaleString();
}

export function triageObservabilityError(
  error: ProductionObservabilityBundle["errors"][number],
  action: "resolve" | "ignore" | "assign",
  actor: string,
  assignee?: string
) {
  if (action === "resolve") {
    return { ...error, triageStatus: "resolved" as const };
  }
  if (action === "ignore") {
    return { ...error, triageStatus: "ignored" as const };
  }
  return {
    ...error,
    triageStatus: "assigned" as const,
    assignedTo: assignee ?? actor
  };
}

export function countOpenObservabilityErrors(errors: ProductionObservabilityBundle["errors"]) {
  return errors.filter((item) => item.triageStatus === "open" || item.triageStatus === "assigned").length;
}

export { worstStatus as resolveWorstObservabilityStatus };
