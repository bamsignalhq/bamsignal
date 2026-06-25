export type PerformanceDomainId =
  | "bundle-size"
  | "code-splitting"
  | "lazy-loading"
  | "image-optimization"
  | "database-queries"
  | "indexes"
  | "react-rendering"
  | "memoization"
  | "caching"
  | "api-calls"
  | "network-waterfalls"
  | "duplicate-requests"
  | "storage-usage"
  | "search";

export type PerformanceStatusId = "optimized" | "review" | "slow";

export type PerformanceDomainResult = {
  id: PerformanceDomainId;
  label: string;
  status: PerformanceStatusId;
  score: number;
  summary: string;
  issueCount: number;
};

export type PerformanceChecklistItem = {
  id: string;
  checkRef: string;
  domainId: PerformanceDomainId;
  label: string;
  passed: boolean;
  detail: string;
};

export type PerformanceOptimizationTarget = {
  id: string;
  label: string;
  surface: string;
  status: PerformanceStatusId;
  summary: string;
};

export type PerformanceHealthReport = {
  generatedAt: string;
  overallScore: number;
  overallStatus: PerformanceStatusId;
  domains: PerformanceDomainResult[];
  checklist: PerformanceChecklistItem[];
  optimizationTargets: PerformanceOptimizationTarget[];
  appliedFixes: string[];
  passedCheckCount: number;
  reviewIssueCount: number;
  slowIssueCount: number;
};
