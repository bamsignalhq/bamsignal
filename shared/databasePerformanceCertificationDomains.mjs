/** Database Performance Certification™ — verified area registry. */

export const DATABASE_PERF_CERT_AREAS = [
  { id: "slow-queries", label: "Slow queries" },
  { id: "missing-indexes", label: "Missing indexes" },
  { id: "unused-indexes", label: "Unused indexes" },
  { id: "duplicate-indexes", label: "Duplicate indexes" },
  { id: "sequential-scans", label: "Sequential scans" },
  { id: "connection-pool", label: "Connection pool" },
  { id: "query-plans", label: "Query plans" },
  { id: "table-growth", label: "Table growth" },
  { id: "storage-growth", label: "Storage growth" }
];

export const DATABASE_PERF_THRESHOLDS = {
  slowQueryMs: 300,
  p95CriticalMs: 1000,
  p99CriticalMs: 2000,
  cacheHitWarningPercent: 90,
  poolUsageCriticalPercent: 90,
  seqScanRowThreshold: 1000,
  tableSizeWarningMb: 512,
  storageWarningGb: 8,
  regressionP95IncreasePercent: 50
};

export const DATABASE_PERF_BLOCK_ON_CRITICAL_REGRESSIONS = true;
