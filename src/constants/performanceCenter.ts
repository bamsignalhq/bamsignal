/** Performance, Capacity & Scalability Center™ — institutional capacity planning layer. */

import { PERFORMANCE_CENTER_ADMIN_BRAND } from "./performanceCenterAdmin";

export const PERFORMANCE_CENTER_BRAND = PERFORMANCE_CENTER_ADMIN_BRAND;

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
  "performance_growth_forecasts"
] as const;

export const PERFORMANCE_AUDIT_ACTIONS = [
  "metric-refreshed",
  "capacity-updated",
  "optimization-flagged",
  "optimization-resolved",
  "forecast-updated"
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
