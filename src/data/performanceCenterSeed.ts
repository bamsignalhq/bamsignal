import type {
  PerformanceApiProfile,
  PerformanceCapacityPlan,
  PerformanceDatabaseProfile,
  PerformanceEngineeringReport,
  PerformanceGrowthForecast,
  PerformanceMetricSnapshot,
  PerformanceOptimizationItem,
  PerformanceToolRun,
  PerformanceTrackSnapshot
} from "../types/performanceCenter";
import {
  PERFORMANCE_ENGINEERING_TRACKS,
  PERFORMANCE_METRICS,
  PERFORMANCE_SECTIONS
} from "../constants/performanceCenter";

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

const TRACK_VALUES: Record<
  string,
  { current: number; previousRelease: number; days30: number; days90: number }
> = {
  startup: { current: 1820, previousRelease: 1940, days30: 2100, days90: 2450 },
  "api-latency": { current: 142, previousRelease: 156, days30: 168, days90: 190 },
  "bundle-size": { current: 2840, previousRelease: 2910, days30: 3050, days90: 3180 },
  lcp: { current: 2.4, previousRelease: 2.8, days30: 3.1, days90: 3.4 },
  cls: { current: 0.08, previousRelease: 0.11, days30: 0.14, days90: 0.18 },
  fid: { current: 42, previousRelease: 48, days30: 55, days90: 62 },
  ttfb: { current: 380, previousRelease: 410, days30: 445, days90: 480 },
  memory: { current: 128, previousRelease: 132, days30: 138, days90: 145 },
  cpu: { current: 34, previousRelease: 38, days30: 42, days90: 48 },
  database: { current: 840, previousRelease: 920, days30: 980, days90: 1050 },
  "slow-queries": { current: 12, previousRelease: 18, days30: 22, days90: 28 },
  "slow-endpoints": { current: 4, previousRelease: 6, days30: 7, days90: 9 }
};

function trackStatus(trackId: string, current: number): "healthy" | "watch" | "strained" | "critical" {
  if (trackId === "lcp" && current > 2.5) return "watch";
  if (trackId === "cls" && current > 0.1) return "watch";
  if (trackId === "slow-queries" && current > 10) return "watch";
  if (trackId === "slow-endpoints" && current > 3) return "watch";
  if (trackId === "bundle-size" && current > 3000) return "watch";
  if (trackId === "cpu" && current > 40) return "watch";
  return "healthy";
}

export const PERFORMANCE_TRACK_SNAPSHOT_SEED: PerformanceTrackSnapshot[] =
  PERFORMANCE_ENGINEERING_TRACKS.map((track, index) => {
    const values = TRACK_VALUES[track.id];
    return {
      id: `pt_${index}`,
      trackRef: `PT-${track.id.toUpperCase().replace(/-/g, "_")}`,
      trackId: track.id,
      current: values.current,
      previousRelease: values.previousRelease,
      days30: values.days30,
      days90: values.days90,
      unit: track.unit,
      status: trackStatus(track.id, values.current),
      collectedAt: NOW
    };
  });

export const PERFORMANCE_ENGINEERING_REPORT_SEED: PerformanceEngineeringReport[] = [
  {
    id: "per_001",
    reportRef: "PER-REG-001",
    reportType: "largest-regressions",
    title: "LCP regressed on /discover mobile",
    metricRef: "lcp",
    deltaPercent: 18,
    detail: "Hero image preload removed in last release — restore priority hint on discover cards.",
    priority: "high",
    generatedAt: NOW
  },
  {
    id: "per_002",
    reportRef: "PER-REG-002",
    reportType: "largest-regressions",
    title: "Bundle size grew 4.2% week-over-week",
    metricRef: "bundle-size",
    deltaPercent: 4.2,
    detail: "Admin abuse protection center added without lazy tab split — defer to dynamic import.",
    priority: "medium",
    generatedAt: NOW
  },
  {
    id: "per_003",
    reportRef: "PER-REG-003",
    reportType: "largest-regressions",
    title: "Slow query count up on member_profiles",
    metricRef: "slow-queries",
    deltaPercent: 33,
    detail: "Missing composite index on (city_id, last_active_at) — add migration before next release.",
    priority: "high",
    generatedAt: NOW
  },
  {
    id: "per_004",
    reportRef: "PER-IMP-001",
    reportType: "largest-improvements",
    title: "Startup time improved 6.2%",
    metricRef: "startup",
    deltaPercent: -6.2,
    detail: "Service worker precache trimmed — member shell loads 120ms faster on 3G.",
    priority: "medium",
    generatedAt: NOW
  },
  {
    id: "per_005",
    reportRef: "PER-IMP-002",
    reportType: "largest-improvements",
    title: "API latency down on /api/chats/threads",
    metricRef: "api-latency",
    deltaPercent: -12,
    detail: "N+1 query eliminated — p95 dropped from 520ms to 458ms.",
    priority: "high",
    generatedAt: NOW
  },
  {
    id: "per_006",
    reportRef: "PER-IMP-003",
    reportType: "largest-improvements",
    title: "TTFB improved after CDN cache rule",
    metricRef: "ttfb",
    deltaPercent: -8.5,
    detail: "Static asset cache TTL extended — edge hit rate 78% → 91%.",
    priority: "low",
    generatedAt: NOW
  },
  {
    id: "per_007",
    reportRef: "PER-REC-001",
    reportType: "recommendations",
    title: "Split admin hub tabs above 200KB",
    metricRef: "bundle-size",
    deltaPercent: 0,
    detail: "Run code splitting tool — 14 admin tabs still in main chunk.",
    priority: "high",
    generatedAt: NOW
  },
  {
    id: "per_008",
    reportRef: "PER-REC-002",
    reportType: "recommendations",
    title: "Audit profile photos over 400KB",
    metricRef: "lcp",
    deltaPercent: 0,
    detail: "Image audit found 38 oversized uploads affecting LCP on profile views.",
    priority: "medium",
    generatedAt: NOW
  },
  {
    id: "per_009",
    reportRef: "PER-REC-003",
    reportType: "recommendations",
    title: "Enable stale-while-revalidate on discover feed",
    metricRef: "api-latency",
    deltaPercent: 0,
    detail: "Caching tool recommends 60s SWR — reduces repeat latency 40% on return visits.",
    priority: "medium",
    generatedAt: NOW
  }
];

export const PERFORMANCE_TOOL_RUN_SEED: PerformanceToolRun[] = [
  {
    id: "ptr_001",
    toolId: "bundle-analysis",
    status: "completed",
    summary: "Main chunk 1.2MB — admin tabs 420KB, vendor 380KB",
    ranAt: "2026-06-24T10:00:00.000Z",
    actor: "ops@bamsignal.com"
  },
  {
    id: "ptr_002",
    toolId: "image-audit",
    status: "completed",
    summary: "38 images over 400KB — profile uploads dominate",
    ranAt: "2026-06-23T14:30:00.000Z",
    actor: "ops@bamsignal.com"
  }
];
