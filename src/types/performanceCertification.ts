export type PerformanceCertificationMetricId =
  | "warm-startup"
  | "cold-startup"
  | "lcp"
  | "cls"
  | "fid"
  | "ttfb"
  | "api-latency"
  | "slowest-endpoint"
  | "bundle-size"
  | "memory"
  | "cpu"
  | "database-response"
  | "largest-image"
  | "largest-js-chunk";

export type PerformanceCertificationCompareWindowId =
  | "previous-release"
  | "30-days"
  | "90-days"
  | "lifetime";

export type PerformanceCertificationTrendId = "improving" | "stable" | "regressing";

export type PerformanceCertificationMetric = {
  id: PerformanceCertificationMetricId;
  label: string;
  value: number;
  unit: string;
  passed: boolean;
  thresholdLabel: string;
  detail?: string;
};

export type PerformanceCertificationComparison = {
  windowId: PerformanceCertificationCompareWindowId;
  windowLabel: string;
  baselineAt: string | null;
  deltaPercent: number | null;
  score: number | null;
};

export type PerformanceCertificationRegression = {
  id: string;
  metricId: PerformanceCertificationMetricId;
  title: string;
  deltaPercent: number;
  compareWindow: PerformanceCertificationCompareWindowId;
  detail: string;
  severity: "critical" | "warning";
};

export type PerformanceCertificationRecommendation = {
  id: string;
  title: string;
  detail: string;
  priority: "critical" | "high" | "medium";
};

export type PerformanceCertificationSnapshot = {
  runId: string;
  generatedAt: string;
  baseUrl: string;
  performanceScore: number;
  passed: boolean;
  metrics: PerformanceCertificationMetric[];
  buildId?: string;
};

export type PerformanceCertificationReport = {
  generatedAt: string;
  runId: string;
  performanceScore: number;
  passed: boolean;
  trend: PerformanceCertificationTrendId;
  summaryLine: string;
  metrics: PerformanceCertificationMetric[];
  comparisons: PerformanceCertificationComparison[];
  regressions: PerformanceCertificationRegression[];
  recommendations: PerformanceCertificationRecommendation[];
  failures: string[];
  source: "store" | "live-import";
};
