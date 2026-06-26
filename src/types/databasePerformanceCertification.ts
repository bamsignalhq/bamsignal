export type DatabasePerfCertAreaId =
  | "slow-queries"
  | "missing-indexes"
  | "unused-indexes"
  | "duplicate-indexes"
  | "sequential-scans"
  | "connection-pool"
  | "query-plans"
  | "table-growth"
  | "storage-growth";

export type DatabasePerfCertIssue = {
  id: string;
  areaId: string;
  title: string;
  detail: string;
  severity: "critical" | "warning";
  count?: number;
  areaLabel?: string;
};

export type DatabasePerfCertAreaResult = {
  id: DatabasePerfCertAreaId | string;
  label: string;
  objectsScanned: number;
  criticalIssues: DatabasePerfCertIssue[];
  warnings: DatabasePerfCertIssue[];
  passed: boolean;
};

export type DatabasePerfCertMetrics = {
  avgQueryMs: number;
  p95Ms: number;
  p99Ms: number;
  slowQueryCount: number;
  cacheHitPercent: number;
  connectionPoolUsedPercent: number;
  connectionPoolWaiting: number;
  databaseSizeBytes: number;
  largestTables: Array<{
    name: string;
    totalBytes: number;
    liveRows: number;
    seqScan: number;
    idxScan: number;
  }>;
  largestIndexes: Array<{
    name: string;
    tableName: string;
    indexBytes: number;
    idxScan: number;
  }>;
  expensiveEndpoints: Array<{
    path: string;
    method: string;
    avgResponseMs: number;
    p95Ms: number;
    p99Ms: number;
    throughputPerMin: number;
    errorRate: number;
  }>;
  queryPlanSamples: Array<{
    query: string;
    calls: number;
    avgMs: number;
    maxMs: number;
  }>;
};

export type DatabasePerfCertOpportunity = {
  id: string;
  title: string;
  detail: string;
  impact: "high" | "medium" | "low";
};

export type DatabasePerfCertificationSnapshot = {
  runId: string;
  generatedAt: string;
  mode: "database" | "static";
  riskScore: number;
  passed: boolean;
  objectsScanned: number;
  areasPassed: number;
  areas: DatabasePerfCertAreaResult[];
  metrics: DatabasePerfCertMetrics;
  criticalRegressions: DatabasePerfCertIssue[];
  criticalIssues: DatabasePerfCertIssue[];
  warnings: DatabasePerfCertIssue[];
  optimizationOpportunities: DatabasePerfCertOpportunity[];
  recommendations: Array<{ priority: string; title: string; detail: string }>;
};

export type DatabasePerfCertificationReport = DatabasePerfCertificationSnapshot & {
  summaryLine: string;
  source: "store" | "cli";
};
