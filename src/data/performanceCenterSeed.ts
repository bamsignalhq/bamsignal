import type {
  PerformanceApiProfile,
  PerformanceCapacityPlan,
  PerformanceDatabaseProfile,
  PerformanceGrowthForecast,
  PerformanceMetricSnapshot,
  PerformanceOptimizationItem
} from "../types/performanceCenter";
import { PERFORMANCE_METRICS, PERFORMANCE_SECTIONS } from "../constants/performanceCenter";

const NOW = "2026-06-25T14:00:00.000Z";

const SECTION_METRIC_MAP: Record<string, string[]> = {
  "system-performance": ["avg-response-time", "p95", "p99", "concurrent-sessions"],
  "api-performance": ["avg-response-time", "p95", "p99", "api-throughput"],
  "database-performance": ["database-queries", "slow-queries", "index-usage", "cache-hit-rate"],
  "queue-performance": ["queue-times", "worker-utilization"],
  "search-performance": ["avg-response-time", "p95", "cache-hit-rate"],
  storage: ["storage-growth"],
  bandwidth: ["bandwidth-usage"],
  "capacity-planning": ["concurrent-sessions", "api-throughput", "storage-growth"],
  "growth-forecast": ["concurrent-sessions", "api-throughput", "storage-growth", "bandwidth-usage"],
  optimization: ["slow-queries", "api-throughput"]
};

function metricValue(metricId: string): number {
  const values: Record<string, number> = {
    "avg-response-time": 142,
    p95: 380,
    p99: 720,
    "database-queries": 840,
    "slow-queries": 12,
    "index-usage": 91,
    "cache-hit-rate": 87,
    "queue-times": 210,
    "worker-utilization": 68,
    "storage-growth": 18.4,
    "bandwidth-usage": 2.6,
    "api-throughput": 4200,
    "concurrent-sessions": 1240
  };
  return values[metricId] ?? 0;
}

function metricStatus(metricId: string): "healthy" | "watch" | "strained" | "critical" {
  if (metricId === "slow-queries" && metricValue(metricId) > 10) return "watch";
  if (metricId === "p99" && metricValue(metricId) > 600) return "watch";
  if (metricId === "worker-utilization" && metricValue(metricId) > 65) return "watch";
  if (metricId === "cache-hit-rate" && metricValue(metricId) < 90) return "watch";
  return "healthy";
}

export const PERFORMANCE_METRIC_SEED: PerformanceMetricSnapshot[] = PERFORMANCE_SECTIONS.flatMap(
  (section, sectionIndex) => {
    const metricIds = SECTION_METRIC_MAP[section.id] ?? ["avg-response-time"];
    return metricIds.map((metricId, metricIndex) => {
      const metric = PERFORMANCE_METRICS.find((item) => item.id === metricId)!;
      return {
        id: `pm_${sectionIndex}_${metricIndex}`,
        metricRef: `PM-${section.id.toUpperCase().replace(/-/g, "_")}-${metricId.toUpperCase().replace(/-/g, "_")}`,
        metricId: metric.id,
        sectionId: section.id,
        value: metricValue(metricId),
        unit: metric.unit,
        status: metricStatus(metricId),
        collectedAt: NOW
      };
    });
  }
);

export const PERFORMANCE_API_PROFILE_SEED: PerformanceApiProfile[] = [
  {
    id: "api_001",
    endpointRef: "API-DISCOVER-FEED",
    path: "/api/discover/feed",
    method: "GET",
    avgResponseMs: 186,
    p95Ms: 420,
    p99Ms: 780,
    throughputPerMin: 980,
    errorRate: 0.4,
    status: "watch"
  },
  {
    id: "api_002",
    endpointRef: "API-CHATS-THREADS",
    path: "/api/chats/threads",
    method: "GET",
    avgResponseMs: 124,
    p95Ms: 310,
    p99Ms: 540,
    throughputPerMin: 720,
    errorRate: 0.2,
    status: "healthy"
  },
  {
    id: "api_003",
    endpointRef: "API-PAYMENTS-VERIFY",
    path: "/api/payments/verify",
    method: "POST",
    avgResponseMs: 340,
    p95Ms: 890,
    p99Ms: 1420,
    throughputPerMin: 45,
    errorRate: 0.8,
    status: "strained"
  },
  {
    id: "api_004",
    endpointRef: "API-PROFILE-PATCH",
    path: "/api/profile",
    method: "PATCH",
    avgResponseMs: 210,
    p95Ms: 480,
    p99Ms: 920,
    throughputPerMin: 180,
    errorRate: 0.3,
    status: "healthy"
  },
  {
    id: "api_005",
    endpointRef: "API-SEARCH-MEMBERS",
    path: "/api/search/members",
    method: "GET",
    avgResponseMs: 290,
    p95Ms: 640,
    p99Ms: 1180,
    throughputPerMin: 320,
    errorRate: 0.5,
    status: "watch"
  }
];

export const PERFORMANCE_DATABASE_PROFILE_SEED: PerformanceDatabaseProfile[] = [
  {
    id: "db_001",
    profileRef: "DB-PRIMARY",
    name: "Primary PostgreSQL",
    queryCount: 840,
    slowQueryCount: 12,
    indexUsagePercent: 91,
    cacheHitPercent: 94,
    connectionPoolUsed: 62,
    status: "healthy"
  },
  {
    id: "db_002",
    profileRef: "DB-ANALYTICS",
    name: "Analytics Read Pool",
    queryCount: 120,
    slowQueryCount: 4,
    indexUsagePercent: 78,
    cacheHitPercent: 82,
    connectionPoolUsed: 38,
    status: "watch"
  },
  {
    id: "db_003",
    profileRef: "DB-JOURNEY",
    name: "Journey Engine Tables",
    queryCount: 210,
    slowQueryCount: 8,
    indexUsagePercent: 85,
    cacheHitPercent: 88,
    connectionPoolUsed: 55,
    status: "watch"
  }
];

export const PERFORMANCE_CAPACITY_PLAN_SEED: PerformanceCapacityPlan[] = [
  {
    id: "cap_001",
    planRef: "CAP-SYSTEM",
    domain: "Application servers",
    sectionId: "system-performance",
    currentCapacity: 2500,
    expectedCapacity: 5000,
    projectedGrowthPercent: 120,
    remainingHeadroomPercent: 52,
    recommendation: "Add second app node before 10k concurrent sessions",
    status: "watch"
  },
  {
    id: "cap_002",
    planRef: "CAP-API",
    domain: "API throughput",
    sectionId: "api-performance",
    currentCapacity: 6000,
    expectedCapacity: 12000,
    projectedGrowthPercent: 95,
    remainingHeadroomPercent: 48,
    recommendation: "Enable request coalescing on discover feed",
    status: "watch"
  },
  {
    id: "cap_003",
    planRef: "CAP-DATABASE",
    domain: "Database connections",
    sectionId: "database-performance",
    currentCapacity: 200,
    expectedCapacity: 400,
    projectedGrowthPercent: 80,
    remainingHeadroomPercent: 38,
    recommendation: "Plan read replica before 50k MAU",
    status: "strained"
  },
  {
    id: "cap_004",
    planRef: "CAP-QUEUE",
    domain: "Queue workers",
    sectionId: "queue-performance",
    currentCapacity: 8,
    expectedCapacity: 16,
    projectedGrowthPercent: 100,
    remainingHeadroomPercent: 50,
    recommendation: "Scale workers when queue depth exceeds 500 for 5 minutes",
    status: "healthy"
  },
  {
    id: "cap_005",
    planRef: "CAP-STORAGE",
    domain: "Photo storage",
    sectionId: "storage",
    currentCapacity: 500,
    expectedCapacity: 2000,
    projectedGrowthPercent: 140,
    remainingHeadroomPercent: 72,
    recommendation: "Lifecycle policy for moderated photo variants",
    status: "healthy"
  }
];

export const PERFORMANCE_OPTIMIZATION_SEED: PerformanceOptimizationItem[] = [
  {
    id: "opt_001",
    itemRef: "OPT-QUERY-001",
    categoryId: "largest-queries",
    sectionId: "database-performance",
    title: "Discover feed join exceeds 2s on peak",
    detail: "member_profiles × preferences × city_filters — missing composite index",
    impact: "high",
    status: "open",
    ownerEmail: "ops@bamsignal.com",
    openedAt: "2026-06-24T09:00:00.000Z"
  },
  {
    id: "opt_002",
    itemRef: "OPT-PAGE-001",
    categoryId: "slowest-pages",
    sectionId: "system-performance",
    title: "/discover initial load — 3.2s LCP",
    detail: "Admin bundle not affected; member discover shell loads full photo grid eagerly",
    impact: "high",
    status: "open",
    ownerEmail: "ops@bamsignal.com",
    openedAt: "2026-06-23T11:00:00.000Z"
  },
  {
    id: "opt_003",
    itemRef: "OPT-IDX-001",
    categoryId: "unused-indexes",
    sectionId: "database-performance",
    title: "idx_journey_archive_legacy_status unused 90 days",
    detail: "Safe to drop after migration 0014 verification",
    impact: "low",
    status: "open",
    ownerEmail: "ops@bamsignal.com",
    openedAt: "2026-06-22T08:00:00.000Z"
  },
  {
    id: "opt_004",
    itemRef: "OPT-API-001",
    categoryId: "heavy-apis",
    sectionId: "api-performance",
    title: "POST /api/payments/verify — 1.4s P99",
    detail: "Paystack round-trip dominates; add idempotent cache for duplicate references",
    impact: "medium",
    status: "open",
    ownerEmail: "ops@bamsignal.com",
    openedAt: "2026-06-21T14:00:00.000Z"
  },
  {
    id: "opt_005",
    itemRef: "OPT-PAYLOAD-001",
    categoryId: "large-payloads",
    sectionId: "api-performance",
    title: "Consultant CRM bundle — 480KB response",
    detail: "Paginate relationship timeline; defer archived journeys",
    impact: "medium",
    status: "open",
    ownerEmail: "ops@bamsignal.com",
    openedAt: "2026-06-20T10:00:00.000Z"
  },
  {
    id: "opt_006",
    itemRef: "OPT-DUP-001",
    categoryId: "duplicate-requests",
    sectionId: "api-performance",
    title: "Duplicate /api/chats/threads on tab focus",
    detail: "Client refetch storm on visibility change — dedupe with 30s stale window",
    impact: "medium",
    status: "open",
    ownerEmail: "ops@bamsignal.com",
    openedAt: "2026-06-19T16:00:00.000Z"
  },
  {
    id: "opt_007",
    itemRef: "OPT-JOB-001",
    categoryId: "background-jobs",
    sectionId: "queue-performance",
    title: "Photo moderation queue backlog peaks at 180",
    detail: "Worker concurrency 2 — increase to 4 during signup spikes",
    impact: "high",
    status: "open",
    ownerEmail: "ops@bamsignal.com",
    openedAt: "2026-06-18T12:00:00.000Z"
  }
];

export const PERFORMANCE_GROWTH_FORECAST_SEED: PerformanceGrowthForecast[] = [
  {
    id: "gf_030",
    forecastRef: "GF-30D",
    periodLabel: "30 days",
    memberCount: 8500,
    concurrentSessions: 1800,
    apiThroughput: 6200,
    storageGb: 420,
    bandwidthTb: 3.2,
    headroomPercent: 58,
    status: "healthy"
  },
  {
    id: "gf_090",
    forecastRef: "GF-90D",
    periodLabel: "90 days",
    memberCount: 28000,
    concurrentSessions: 5200,
    apiThroughput: 14800,
    storageGb: 980,
    bandwidthTb: 8.4,
    headroomPercent: 42,
    status: "watch"
  },
  {
    id: "gf_180",
    forecastRef: "GF-180D",
    periodLabel: "180 days",
    memberCount: 75000,
    concurrentSessions: 12000,
    apiThroughput: 32000,
    storageGb: 2400,
    bandwidthTb: 18.0,
    headroomPercent: 28,
    status: "strained"
  },
  {
    id: "gf_365",
    forecastRef: "GF-365D",
    periodLabel: "365 days",
    memberCount: 250000,
    concurrentSessions: 38000,
    apiThroughput: 95000,
    storageGb: 8200,
    bandwidthTb: 52.0,
    headroomPercent: 12,
    status: "critical"
  }
];

export const PERFORMANCE_SCALING_RECOMMENDATIONS_SEED = [
  "Enable horizontal app scaling before 10k concurrent sessions",
  "Add PostgreSQL read replica before 50k MAU",
  "Introduce Redis cache layer for discover feed at 25k DAU",
  "Shard photo storage by region before 5TB total",
  "Plan CDN edge for static assets before Nigeria + diaspora launch waves"
];
