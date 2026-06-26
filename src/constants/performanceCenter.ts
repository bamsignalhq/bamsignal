/** Performance Engineering Center — application performance intelligence layer. */

import { PERFORMANCE_CENTER_ADMIN_BRAND } from "./performanceCenterAdmin";

export const PERFORMANCE_CENTER_BRAND = PERFORMANCE_CENTER_ADMIN_BRAND;

export const PERFORMANCE_CENTER_REFRESH_INTERVAL_MS = 30_000;

/** Core application performance tracks. */
export const PERFORMANCE_ENGINEERING_TRACKS = [
  { id: "startup", label: "Startup", unit: "ms", lowerIsBetter: true },
  { id: "api-latency", label: "API latency", unit: "ms", lowerIsBetter: true },
  { id: "bundle-size", label: "Bundle size", unit: "KB", lowerIsBetter: true },
  { id: "lcp", label: "LCP", unit: "s", lowerIsBetter: true },
  { id: "cls", label: "CLS", unit: "", lowerIsBetter: true },
  { id: "fid", label: "FID", unit: "ms", lowerIsBetter: true },
  { id: "ttfb", label: "TTFB", unit: "ms", lowerIsBetter: true },
  { id: "memory", label: "Memory", unit: "MB", lowerIsBetter: true },
  { id: "cpu", label: "CPU", unit: "%", lowerIsBetter: true },
  { id: "database", label: "Database", unit: "qps", lowerIsBetter: false },
  { id: "slow-queries", label: "Slow queries", unit: "count", lowerIsBetter: true },
  { id: "slow-endpoints", label: "Slow endpoints", unit: "count", lowerIsBetter: true }
] as const;

export type PerformanceTrackId = (typeof PERFORMANCE_ENGINEERING_TRACKS)[number]["id"];

export const PERFORMANCE_TRACK_LABELS: Record<PerformanceTrackId, string> =
  Object.fromEntries(PERFORMANCE_ENGINEERING_TRACKS.map((item) => [item.id, item.label])) as Record<
    PerformanceTrackId,
    string
  >;

export const PERFORMANCE_COMPARE_WINDOWS = [
  { id: "current", label: "Current" },
  { id: "previous-release", label: "Previous release" },
  { id: "30-days", label: "30 days" },
  { id: "90-days", label: "90 days" }
] as const;

export type PerformanceCompareWindowId = (typeof PERFORMANCE_COMPARE_WINDOWS)[number]["id"];

export const PERFORMANCE_REPORT_TYPES = [
  { id: "largest-regressions", label: "Largest regressions" },
  { id: "largest-improvements", label: "Largest improvements" },
  { id: "recommendations", label: "Recommendations" }
] as const;

export type PerformanceReportTypeId = (typeof PERFORMANCE_REPORT_TYPES)[number]["id"];

export const PERFORMANCE_ENGINEERING_TOOLS = [
  {
    id: "bundle-analysis",
    label: "Bundle analysis",
    description: "Inspect chunk sizes, duplicate modules, and largest dependencies."
  },
  {
    id: "image-audit",
    label: "Image audit",
    description: "Find oversized or unoptimized images across member and public surfaces."
  },
  {
    id: "unused-code",
    label: "Unused code",
    description: "Surface dead exports and unreachable admin modules for cleanup."
  },
  {
    id: "code-splitting",
    label: "Code splitting",
    description: "Validate lazy routes and admin tab chunks load on demand."
  },
  {
    id: "caching",
    label: "Caching",
    description: "Review service worker, CDN, and API cache hit patterns."
  }
] as const;

export type PerformanceEngineeringToolId = (typeof PERFORMANCE_ENGINEERING_TOOLS)[number]["id"];

export const PERFORMANCE_SECTIONS = [
  { id: "system-performance", label: "System Performance" },
  { id: "api-performance", label: "API Performance" },
  { id: "database-performance", label: "Database Performance" },
  { id: "queue-performance", label: "Queue Performance" },
  { id: "search-performance", label: "Search Performance" },
  { id: "storage", label: "Storage" },
  { id: "bandwidth", label: "Bandwidth" },
  { id: "capacity-planning", label: "Capacity Planning" },
  { id: "growth-forecast", label: "Growth Forecast" },
  { id: "optimization", label: "Optimization" }
] as const;

export type PerformanceSectionId = (typeof PERFORMANCE_SECTIONS)[number]["id"];

export const PERFORMANCE_METRICS = [
  { id: "avg-response-time", label: "Average Response Time", unit: "ms" },
  { id: "p95", label: "P95", unit: "ms" },
  { id: "p99", label: "P99", unit: "ms" },
  { id: "database-queries", label: "Database Queries", unit: "qps" },
  { id: "slow-queries", label: "Slow Queries", unit: "count" },
  { id: "index-usage", label: "Index Usage", unit: "%" },
  { id: "cache-hit-rate", label: "Cache Hit Rate", unit: "%" },
  { id: "queue-times", label: "Queue Times", unit: "ms" },
  { id: "worker-utilization", label: "Worker Utilization", unit: "%" },
  { id: "storage-growth", label: "Storage Growth", unit: "GB/mo" },
  { id: "bandwidth-usage", label: "Bandwidth Usage", unit: "TB/mo" },
  { id: "api-throughput", label: "API Throughput", unit: "rpm" },
  { id: "concurrent-sessions", label: "Concurrent Sessions", unit: "sessions" }
] as const;

export type PerformanceMetricId = (typeof PERFORMANCE_METRICS)[number]["id"];

export const PERFORMANCE_METRIC_LABELS: Record<PerformanceMetricId, string> =
  Object.fromEntries(PERFORMANCE_METRICS.map((item) => [item.id, item.label])) as Record<
    PerformanceMetricId,
    string
  >;

export const PERFORMANCE_HEALTH_STATUSES = [
  "healthy",
  "watch",
  "strained",
  "critical"
] as const;

export type PerformanceHealthStatusId = (typeof PERFORMANCE_HEALTH_STATUSES)[number];

export const PERFORMANCE_HEALTH_STATUS_LABELS: Record<PerformanceHealthStatusId, string> = {
  healthy: "Healthy",
  watch: "Watch",
  strained: "Strained",
  critical: "Critical"
};

export const OPTIMIZATION_CATEGORIES = [
  { id: "largest-queries", label: "Largest Queries" },
  { id: "slowest-pages", label: "Slowest Pages" },
  { id: "unused-indexes", label: "Unused Indexes" },
  { id: "heavy-apis", label: "Heavy APIs" },
  { id: "large-payloads", label: "Large Payloads" },
  { id: "duplicate-requests", label: "Duplicate Requests" },
  { id: "background-jobs", label: "Background Jobs" }
] as const;

export type OptimizationCategoryId = (typeof OPTIMIZATION_CATEGORIES)[number]["id"];

export const OPTIMIZATION_CATEGORY_LABELS: Record<OptimizationCategoryId, string> =
  Object.fromEntries(OPTIMIZATION_CATEGORIES.map((item) => [item.id, item.label])) as Record<
    OptimizationCategoryId,
    string
  >;

export const PERFORMANCE_IMPACT_LEVELS = ["high", "medium", "low"] as const;
export type PerformanceImpactLevelId = (typeof PERFORMANCE_IMPACT_LEVELS)[number];

export const PERFORMANCE_CENTER_DB_TABLES = [
  "performance_metric_snapshots",
  "performance_api_profiles",
  "performance_database_profiles",
  "performance_capacity_plans",
  "performance_optimization_items",
  "performance_growth_forecasts",
  "performance_track_snapshots",
  "performance_engineering_reports",
  "performance_tool_runs"
] as const;

export const PERFORMANCE_AUDIT_ACTIONS = [
  "metric-refreshed",
  "capacity-updated",
  "optimization-flagged",
  "optimization-resolved",
  "forecast-updated",
  "track-refreshed",
  "compare-updated",
  "tool-executed",
  "report-generated"
] as const;

export type PerformanceAuditActionId = (typeof PERFORMANCE_AUDIT_ACTIONS)[number];

/** Future-ready — documented only, not implemented. */
export const PERFORMANCE_FUTURE_ARCHITECTURE = [
  { id: "auto-scaling", label: "Auto Scaling" },
  { id: "horizontal-scaling", label: "Horizontal Scaling" },
  { id: "regional-clusters", label: "Regional Clusters" },
  { id: "read-replicas", label: "Read Replicas" },
  { id: "edge-infrastructure", label: "Edge Infrastructure" },
  { id: "cdn-optimization", label: "CDN Optimization" }
] as const;
