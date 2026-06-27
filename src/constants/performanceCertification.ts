/** Performance Certification™ — release performance gates. */

import type {
  PerformanceCertificationCompareWindowId,
  PerformanceCertificationMetricId
} from "../types/performanceCertification";

export const PERFORMANCE_CERTIFICATION_METRICS: Array<{
  id: PerformanceCertificationMetricId;
  label: string;
  unit: string;
}> = [
  { id: "warm-startup", label: "Warm startup", unit: "ms" },
  { id: "cold-startup", label: "Cold startup", unit: "ms" },
  { id: "lcp", label: "LCP", unit: "ms" },
  { id: "cls", label: "CLS", unit: "" },
  { id: "fid", label: "FID", unit: "ms" },
  { id: "ttfb", label: "TTFB", unit: "ms" },
  { id: "api-latency", label: "API latency (P95)", unit: "ms" },
  { id: "slowest-endpoint", label: "Slowest endpoint", unit: "ms" },
  { id: "bundle-size", label: "Bundle size", unit: "KB" },
  { id: "memory", label: "Memory", unit: "MB" },
  { id: "cpu", label: "CPU proxy", unit: "ms" },
  { id: "database-response", label: "Database response", unit: "ms" },
  { id: "largest-image", label: "Largest image", unit: "KB" },
  { id: "largest-js-chunk", label: "Largest JS chunk", unit: "KB" }
];

export const PERFORMANCE_CERTIFICATION_COMPARE_WINDOWS: Array<{
  id: PerformanceCertificationCompareWindowId;
  label: string;
  days: number | null;
}> = [
  { id: "previous-release", label: "Previous release", days: null },
  { id: "30-days", label: "30 days", days: 30 },
  { id: "90-days", label: "90 days", days: 90 },
  { id: "lifetime", label: "Lifetime", days: null }
];

export const PERFORMANCE_CERTIFICATION_FAIL_RULES = [
  "Warm startup > 300ms",
  "Cold startup > 1.2 seconds",
  "LCP > 1.8 seconds",
  "CLS > 0.1",
  "TTFB > 300ms",
  "API P95 > 250ms",
  "Database response > 150ms",
  "Bundle grows > 10% vs previous release",
  "Memory leak detected (>15% heap growth across repeat navigation)"
] as const;
