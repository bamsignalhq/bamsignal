import { PLATFORM_LOAD_BLOCK_ON_CRITICAL, PLATFORM_LOAD_THRESHOLDS } from "../../../shared/platformLoadCertification.mjs";

export function buildLoadScore(simulation, bottlenecks) {
  const criticalCount = bottlenecks.filter((item) => item.critical).length;
  const warningCount = bottlenecks.filter((item) => !item.critical).length;
  const penalty = criticalCount * 18 + warningCount * 6;
  return Math.max(0, Math.min(100, 100 - penalty));
}

export function identifyBottlenecks(simulation) {
  const { measurement, virtualMembers, journeysFailed } = simulation;
  const bottlenecks = [];

  if (measurement.api.p95 > PLATFORM_LOAD_THRESHOLDS.apiP95Ms) {
    bottlenecks.push({
      id: "api-latency",
      label: "API latency",
      critical: true,
      metric: "apiP95Ms",
      value: measurement.api.p95,
      threshold: PLATFORM_LOAD_THRESHOLDS.apiP95Ms,
      detail: `API p95 ${measurement.api.p95}ms exceeds ${PLATFORM_LOAD_THRESHOLDS.apiP95Ms}ms`
    });
  }

  if (measurement.health.p95 > PLATFORM_LOAD_THRESHOLDS.healthP95Ms) {
    bottlenecks.push({
      id: "health-latency",
      label: "Health probe latency",
      critical: false,
      metric: "healthP95Ms",
      value: measurement.health.p95,
      threshold: PLATFORM_LOAD_THRESHOLDS.healthP95Ms,
      detail: `Health p95 ${measurement.health.p95}ms exceeds ${PLATFORM_LOAD_THRESHOLDS.healthP95Ms}ms`
    });
  }

  if (measurement.database.p95 > PLATFORM_LOAD_THRESHOLDS.readyP95Ms) {
    bottlenecks.push({
      id: "database-latency",
      label: "Database readiness latency",
      critical: true,
      metric: "readyP95Ms",
      value: measurement.database.p95,
      threshold: PLATFORM_LOAD_THRESHOLDS.readyP95Ms,
      detail: `/ready p95 ${measurement.database.p95}ms exceeds ${PLATFORM_LOAD_THRESHOLDS.readyP95Ms}ms`
    });
  }

  if (measurement.failureRatePercent > PLATFORM_LOAD_THRESHOLDS.failureRatePercent) {
    bottlenecks.push({
      id: "failure-rate",
      label: "Request failure rate",
      critical: true,
      metric: "failureRatePercent",
      value: measurement.failureRatePercent,
      threshold: PLATFORM_LOAD_THRESHOLDS.failureRatePercent,
      detail: `Failure rate ${measurement.failureRatePercent}% exceeds ${PLATFORM_LOAD_THRESHOLDS.failureRatePercent}%`
    });
  }

  if (measurement.queueDepth.max > PLATFORM_LOAD_THRESHOLDS.maxQueueDepth) {
    bottlenecks.push({
      id: "queue-depth",
      label: "In-flight queue depth",
      critical: true,
      metric: "maxQueueDepth",
      value: measurement.queueDepth.max,
      threshold: PLATFORM_LOAD_THRESHOLDS.maxQueueDepth,
      detail: `Queue depth ${measurement.queueDepth.max} exceeds ${PLATFORM_LOAD_THRESHOLDS.maxQueueDepth}`
    });
  }

  if (measurement.ram.peakMb > PLATFORM_LOAD_THRESHOLDS.runnerRamMbPeak) {
    bottlenecks.push({
      id: "runner-ram",
      label: "Runner RAM peak",
      critical: false,
      metric: "runnerRamMbPeak",
      value: measurement.ram.peakMb,
      threshold: PLATFORM_LOAD_THRESHOLDS.runnerRamMbPeak,
      detail: `Runner heap peak ${measurement.ram.peakMb}MB exceeds ${PLATFORM_LOAD_THRESHOLDS.runnerRamMbPeak}MB`
    });
  }

  const cpuPerMember = virtualMembers > 0 ? Math.round(measurement.cpu.userMs / virtualMembers) : 0;
  if (cpuPerMember > PLATFORM_LOAD_THRESHOLDS.cpuUserMsPerMember) {
    bottlenecks.push({
      id: "cpu-per-member",
      label: "CPU per virtual member",
      critical: false,
      metric: "cpuUserMsPerMember",
      value: cpuPerMember,
      threshold: PLATFORM_LOAD_THRESHOLDS.cpuUserMsPerMember,
      detail: `CPU user ${cpuPerMember}ms/member exceeds ${PLATFORM_LOAD_THRESHOLDS.cpuUserMsPerMember}ms`
    });
  }

  const slowest = measurement.endpoints[0];
  if (slowest && slowest.p95 > PLATFORM_LOAD_THRESHOLDS.apiP95Ms) {
    bottlenecks.push({
      id: "slowest-endpoint",
      label: "Slowest endpoint",
      critical: false,
      metric: "slowestEndpointP95",
      value: slowest.p95,
      threshold: PLATFORM_LOAD_THRESHOLDS.apiP95Ms,
      detail: `${slowest.method} ${slowest.path} p95 ${slowest.p95}ms`
    });
  }

  if (journeysFailed > 0 && measurement.failureRatePercent <= PLATFORM_LOAD_THRESHOLDS.failureRatePercent) {
    bottlenecks.push({
      id: "journey-failures",
      label: "Member journey failures",
      critical: false,
      metric: "journeysFailed",
      value: journeysFailed,
      threshold: 0,
      detail: `${journeysFailed} member journeys reported unexpected step outcomes`
    });
  }

  return bottlenecks;
}

export function buildLoadRecommendations(bottlenecks, simulation) {
  const recommendations = [];
  const slowest = simulation.measurement.endpoints.slice(0, 5);

  for (const bottleneck of bottlenecks.filter((item) => item.critical)) {
    recommendations.push({
      id: `rec_${bottleneck.id}`,
      priority: "critical",
      title: `Resolve ${bottleneck.label}`,
      detail: bottleneck.detail
    });
  }

  if (slowest.length) {
    recommendations.push({
      id: "rec_cache_hot_paths",
      priority: "high",
      title: "Optimize hottest endpoints",
      detail: slowest.map((item) => `${item.method} ${item.path} p95=${item.p95}ms`).join("; ")
    });
  }

  if (simulation.measurement.queueDepth.max > PLATFORM_LOAD_THRESHOLDS.maxQueueDepth * 0.7) {
    recommendations.push({
      id: "rec_concurrency_controls",
      priority: "high",
      title: "Add concurrency controls",
      detail: "Queue depth approached limits — review rate limits, connection pooling, and upstream timeouts."
    });
  }

  if (simulation.measurement.database.p95 > PLATFORM_LOAD_THRESHOLDS.readyP95Ms * 0.75) {
    recommendations.push({
      id: "rec_database_scaling",
      priority: "medium",
      title: "Review database capacity",
      detail: "/ready latency indicates database or dependency pressure under member load."
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      id: "rec_continue_monitoring",
      priority: "low",
      title: "Continue production monitoring",
      detail: "Load certification passed thresholds — keep weekly runs at 1000 virtual members before major releases."
    });
  }

  return recommendations;
}

export function evaluateLoadGate(bottlenecks) {
  if (!PLATFORM_LOAD_BLOCK_ON_CRITICAL) return true;
  return !bottlenecks.some((item) => item.critical);
}
