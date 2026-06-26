import type {
  EnterpriseApiCenterBundle,
  EnterpriseApiCenterSummary,
  EnterpriseApiEndpoint,
  EnterpriseApiFailedJob
} from "../types/enterpriseApiCenter";
import type { EnterpriseApiEndpointStatusId } from "../constants/enterpriseApiCenter";

function worstStatus(statuses: EnterpriseApiEndpointStatusId[]): EnterpriseApiEndpointStatusId {
  const order: EnterpriseApiEndpointStatusId[] = ["disabled", "maintenance", "degraded", "healthy"];
  return order.find((status) => statuses.includes(status)) ?? "healthy";
}

export function buildEnterpriseApiCenterSummary(
  endpoints: EnterpriseApiEndpoint[],
  failedJobs: EnterpriseApiFailedJob[]
): EnterpriseApiCenterSummary {
  const endpointCount = endpoints.length;
  const healthyCount = endpoints.filter((item) => item.status === "healthy").length;
  const degradedCount = endpoints.filter((item) => item.status === "degraded").length;
  const disabledCount = endpoints.filter((item) => item.status === "disabled").length;
  const maintenanceCount = endpoints.filter((item) => item.status === "maintenance").length;

  const activeEndpoints = endpoints.filter(
    (item) => item.status !== "disabled" && item.status !== "maintenance"
  );
  const totalRequestsPerMin = endpoints.reduce((sum, item) => sum + item.requestsPerMin, 0);
  const avgLatencyMs = activeEndpoints.length
    ? Math.round(
        activeEndpoints.reduce((sum, item) => sum + item.latencyMs, 0) / activeEndpoints.length
      )
    : 0;

  const totalErrors = endpoints.reduce((sum, item) => sum + item.errorCount, 0);
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

export function buildEnterpriseApiCenterBundle(input: {
  endpoints: EnterpriseApiEndpoint[];
  failedJobs: EnterpriseApiFailedJob[];
  toolRuns: EnterpriseApiCenterBundle["toolRuns"];
}): EnterpriseApiCenterBundle {
  return {
    generatedAt: new Date().toISOString(),
    summary: buildEnterpriseApiCenterSummary(input.endpoints, input.failedJobs),
    endpoints: input.endpoints,
    failedJobs: input.failedJobs,
    toolRuns: input.toolRuns
  };
}

export function formatEnterpriseApiSummaryLine(summary: EnterpriseApiCenterSummary): string {
  return `${summary.operationsScore}% ops · ${summary.endpointCount} endpoints · ${summary.totalRequestsPerMin} rpm · ${summary.avgLatencyMs}ms avg · ${summary.errorRatePercent}% errors`;
}

export function filterEndpointsByStatus(
  endpoints: EnterpriseApiEndpoint[],
  status: EnterpriseApiEndpointStatusId | "all"
): EnterpriseApiEndpoint[] {
  if (status === "all") return endpoints;
  return endpoints.filter((item) => item.status === status);
}

export function sortEndpointsByLatency(
  endpoints: EnterpriseApiEndpoint[]
): EnterpriseApiEndpoint[] {
  return [...endpoints].sort((a, b) => b.latencyMs - a.latencyMs);
}
