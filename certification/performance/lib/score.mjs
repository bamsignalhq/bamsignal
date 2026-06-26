import { PERFORMANCE_CERT_THRESHOLDS } from "../../../shared/performanceCertificationThresholds.mjs";

export function evaluateMetrics(raw, context = {}) {
  const checks = [
    { id: "warm-startup", label: "Warm startup", value: raw.warmStartupMs, unit: "ms", passed: raw.warmStartupMs <= PERFORMANCE_CERT_THRESHOLDS.warmStartupMs, thresholdLabel: `≤ ${PERFORMANCE_CERT_THRESHOLDS.warmStartupMs}ms` },
    { id: "cold-startup", label: "Cold startup", value: raw.coldStartupMs, unit: "ms", passed: raw.coldStartupMs <= PERFORMANCE_CERT_THRESHOLDS.coldStartupMs, thresholdLabel: `≤ ${PERFORMANCE_CERT_THRESHOLDS.coldStartupMs}ms` },
    { id: "lcp", label: "LCP", value: raw.lcpMs, unit: "ms", passed: raw.lcpMs <= PERFORMANCE_CERT_THRESHOLDS.lcpMs, thresholdLabel: `≤ ${PERFORMANCE_CERT_THRESHOLDS.lcpMs}ms` },
    { id: "cls", label: "CLS", value: raw.cls, unit: "", passed: raw.cls <= PERFORMANCE_CERT_THRESHOLDS.cls, thresholdLabel: `≤ ${PERFORMANCE_CERT_THRESHOLDS.cls}` },
    { id: "fid", label: "FID", value: raw.fidMs, unit: "ms", passed: raw.fidMs <= PERFORMANCE_CERT_THRESHOLDS.fidMs, thresholdLabel: `≤ ${PERFORMANCE_CERT_THRESHOLDS.fidMs}ms` },
    { id: "ttfb", label: "TTFB", value: raw.ttfbMs, unit: "ms", passed: raw.ttfbMs <= PERFORMANCE_CERT_THRESHOLDS.ttfbMs, thresholdLabel: `≤ ${PERFORMANCE_CERT_THRESHOLDS.ttfbMs}ms` },
    { id: "api-latency", label: "API latency (P95)", value: raw.apiP95Ms, unit: "ms", passed: raw.apiP95Ms <= PERFORMANCE_CERT_THRESHOLDS.apiP95Ms, thresholdLabel: `P95 ≤ ${PERFORMANCE_CERT_THRESHOLDS.apiP95Ms}ms` },
    { id: "slowest-endpoint", label: "Slowest endpoint", value: raw.slowestEndpointMs, unit: "ms", passed: raw.slowestEndpointMs <= PERFORMANCE_CERT_THRESHOLDS.apiP95Ms, thresholdLabel: `≤ ${PERFORMANCE_CERT_THRESHOLDS.apiP95Ms}ms`, detail: raw.slowestEndpoint },
    { id: "bundle-size", label: "Bundle size", value: raw.bundleSizeKb, unit: "KB", passed: context.bundleGrowthPercent == null || context.bundleGrowthPercent <= PERFORMANCE_CERT_THRESHOLDS.bundleGrowthPercent, thresholdLabel: context.bundleGrowthPercent != null ? `growth ≤ ${PERFORMANCE_CERT_THRESHOLDS.bundleGrowthPercent}%` : "baseline", detail: context.bundleGrowthPercent != null ? `Δ ${context.bundleGrowthPercent.toFixed(1)}%` : undefined },
    { id: "memory", label: "Memory", value: raw.memoryMb, unit: "MB", passed: raw.memoryGrowthPercent <= PERFORMANCE_CERT_THRESHOLDS.memoryLeakGrowthPercent, thresholdLabel: `leak ≤ ${PERFORMANCE_CERT_THRESHOLDS.memoryLeakGrowthPercent}%`, detail: `growth ${raw.memoryGrowthPercent}%` },
    { id: "cpu", label: "CPU proxy", value: raw.cpuProxyMs, unit: "ms", passed: true, thresholdLabel: "informational" },
    { id: "database-response", label: "Database response", value: raw.databaseResponseMs, unit: "ms", passed: raw.databaseResponseMs <= PERFORMANCE_CERT_THRESHOLDS.apiP95Ms, thresholdLabel: `≤ ${PERFORMANCE_CERT_THRESHOLDS.apiP95Ms}ms` },
    { id: "largest-image", label: "Largest image", value: raw.largestImageKb, unit: "KB", passed: true, thresholdLabel: "informational", detail: raw.largestImageName },
    { id: "largest-js-chunk", label: "Largest JS chunk", value: raw.largestJsChunkKb, unit: "KB", passed: true, thresholdLabel: "informational", detail: raw.largestJsChunkName }
  ];

  const score = Math.round((checks.filter((item) => item.passed).length / checks.length) * 100);
  const passed = checks.every((item) => item.passed);

  return { metrics: checks, score, passed };
}

export function bundleGrowthPercent(currentKb, previousKb) {
  if (!previousKb) return null;
  return Math.round(((currentKb - previousKb) / previousKb) * 1000) / 10;
}
