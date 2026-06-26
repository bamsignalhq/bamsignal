import {
  PERFORMANCE_CERTIFICATION_COMPARE_WINDOWS,
  PERFORMANCE_CERTIFICATION_METRICS
} from "../constants/performanceCertification";
import type {
  PerformanceCertificationComparison,
  PerformanceCertificationMetric,
  PerformanceCertificationMetricId,
  PerformanceCertificationRecommendation,
  PerformanceCertificationRegression,
  PerformanceCertificationReport,
  PerformanceCertificationSnapshot,
  PerformanceCertificationTrendId
} from "../types/performanceCertification";

const THRESHOLDS = {
  warmStartupMs: 2000,
  coldStartupMs: 2000,
  lcpMs: 2500,
  cls: 0.1,
  fidMs: 100,
  ttfbMs: 800,
  apiP95Ms: 500,
  bundleGrowthPercent: 10,
  memoryLeakGrowthPercent: 15
};

function metricLabel(id: PerformanceCertificationMetricId): string {
  return PERFORMANCE_CERTIFICATION_METRICS.find((item) => item.id === id)?.label ?? id;
}

function metricUnit(id: PerformanceCertificationMetricId): string {
  return PERFORMANCE_CERTIFICATION_METRICS.find((item) => item.id === id)?.unit ?? "";
}

export function evaluatePerformanceMetric(
  id: PerformanceCertificationMetricId,
  value: number,
  context: { bundleGrowthPercent?: number; memoryGrowthPercent?: number } = {}
): PerformanceCertificationMetric {
  let passed = true;
  let thresholdLabel = "—";
  let detail = "";

  switch (id) {
    case "warm-startup":
      passed = value <= THRESHOLDS.warmStartupMs;
      thresholdLabel = `≤ ${THRESHOLDS.warmStartupMs}ms`;
      break;
    case "cold-startup":
      passed = value <= THRESHOLDS.coldStartupMs;
      thresholdLabel = `≤ ${THRESHOLDS.coldStartupMs}ms`;
      break;
    case "lcp":
      passed = value <= THRESHOLDS.lcpMs;
      thresholdLabel = `≤ ${THRESHOLDS.lcpMs}ms`;
      break;
    case "cls":
      passed = value <= THRESHOLDS.cls;
      thresholdLabel = `≤ ${THRESHOLDS.cls}`;
      break;
    case "fid":
      passed = value <= THRESHOLDS.fidMs;
      thresholdLabel = `≤ ${THRESHOLDS.fidMs}ms`;
      break;
    case "ttfb":
      passed = value <= THRESHOLDS.ttfbMs;
      thresholdLabel = `≤ ${THRESHOLDS.ttfbMs}ms`;
      break;
    case "api-latency":
      passed = value <= THRESHOLDS.apiP95Ms;
      thresholdLabel = `P95 ≤ ${THRESHOLDS.apiP95Ms}ms`;
      break;
    case "slowest-endpoint":
      passed = value <= THRESHOLDS.apiP95Ms;
      thresholdLabel = `≤ ${THRESHOLDS.apiP95Ms}ms`;
      break;
    case "bundle-size":
      if (context.bundleGrowthPercent != null) {
        passed = context.bundleGrowthPercent <= THRESHOLDS.bundleGrowthPercent;
        thresholdLabel = `growth ≤ ${THRESHOLDS.bundleGrowthPercent}%`;
        detail = `Δ ${context.bundleGrowthPercent.toFixed(1)}% vs previous release`;
      } else {
        passed = true;
        thresholdLabel = "baseline";
      }
      break;
    case "memory":
      if (context.memoryGrowthPercent != null) {
        passed = context.memoryGrowthPercent <= THRESHOLDS.memoryLeakGrowthPercent;
        thresholdLabel = `leak ≤ ${THRESHOLDS.memoryLeakGrowthPercent}%`;
        detail =
          context.memoryGrowthPercent > THRESHOLDS.memoryLeakGrowthPercent
            ? "Possible memory leak across repeat navigation"
            : "Stable across repeat navigation";
      } else {
        passed = true;
        thresholdLabel = "stable";
      }
      break;
    default:
      passed = true;
      thresholdLabel = "informational";
      break;
  }

  return {
    id,
    label: metricLabel(id),
    value,
    unit: metricUnit(id),
    passed,
    thresholdLabel,
    detail: detail || undefined
  };
}

export function buildPerformanceScore(metrics: PerformanceCertificationMetric[]): number {
  if (!metrics.length) return 0;
  const passed = metrics.filter((item) => item.passed).length;
  return Math.round((passed / metrics.length) * 100);
}

function deltaPercent(current: number, baseline: number): number | null {
  if (!Number.isFinite(baseline) || baseline === 0) return null;
  return Math.round(((current - baseline) / baseline) * 1000) / 10;
}

function metricValue(snapshot: PerformanceCertificationSnapshot, id: PerformanceCertificationMetricId): number {
  return snapshot.metrics.find((item) => item.id === id)?.value ?? 0;
}

export function buildPerformanceComparisons(
  current: PerformanceCertificationSnapshot,
  history: PerformanceCertificationSnapshot[]
): PerformanceCertificationComparison[] {
  const sorted = [...history].sort(
    (a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt)
  );
  const previous = sorted.find((item) => item.runId !== current.runId) ?? null;

  return PERFORMANCE_CERTIFICATION_COMPARE_WINDOWS.map((window) => {
    let baseline: PerformanceCertificationSnapshot | null = null;
    if (window.id === "previous-release") {
      baseline = previous;
    } else if (window.id === "lifetime") {
      baseline = sorted[sorted.length - 1] ?? null;
    } else if (window.days) {
      const cutoff = Date.now() - window.days * 24 * 60 * 60 * 1000;
      baseline =
        sorted.find((item) => Date.parse(item.generatedAt) <= cutoff) ??
        sorted[sorted.length - 1] ??
        null;
    }

    const delta = baseline
      ? deltaPercent(current.performanceScore, baseline.performanceScore)
      : null;

    return {
      windowId: window.id,
      windowLabel: window.label,
      baselineAt: baseline?.generatedAt ?? null,
      deltaPercent: delta,
      score: baseline?.performanceScore ?? null
    };
  });
}

export function buildPerformanceRegressions(
  current: PerformanceCertificationSnapshot,
  history: PerformanceCertificationSnapshot[]
): PerformanceCertificationRegression[] {
  const previous = history
    .filter((item) => item.runId !== current.runId)
    .sort((a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt))[0];
  if (!previous) return [];

  const regressions: PerformanceCertificationRegression[] = [];
  let counter = 0;

  for (const metric of current.metrics) {
    const baselineValue = metricValue(previous, metric.id);
    const delta = deltaPercent(metric.value, baselineValue);
    if (delta == null || delta <= 5) continue;

    const worse =
      metric.id === "bundle-size" ||
      metric.id === "memory" ||
      metric.id === "api-latency" ||
      metric.id === "slowest-endpoint" ||
      metric.id.includes("startup") ||
      metric.id === "lcp" ||
      metric.id === "cls" ||
      metric.id === "fid" ||
      metric.id === "ttfb";

    if (!worse) continue;

    counter += 1;
    regressions.push({
      id: `perf_reg_${counter}`,
      metricId: metric.id,
      title: `${metric.label} regressed ${delta}%`,
      deltaPercent: delta,
      compareWindow: "previous-release",
      detail: `${metric.value}${metric.unit} vs ${baselineValue}${metric.unit} on previous release`,
      severity: delta >= 15 || !metric.passed ? "critical" : "warning"
    });
  }

  return regressions.sort((a, b) => b.deltaPercent - a.deltaPercent);
}

export function buildPerformanceRecommendations(
  metrics: PerformanceCertificationMetric[],
  regressions: PerformanceCertificationRegression[]
): PerformanceCertificationRecommendation[] {
  const items: PerformanceCertificationRecommendation[] = [];
  let counter = 0;

  const add = (title: string, detail: string, priority: "critical" | "high" | "medium") => {
    counter += 1;
    items.push({ id: `perf_rec_${counter}`, title, detail, priority });
  };

  const warm = metrics.find((item) => item.id === "warm-startup");
  const lcp = metrics.find((item) => item.id === "lcp");
  const api = metrics.find((item) => item.id === "api-latency");
  const bundle = metrics.find((item) => item.id === "bundle-size");
  const memory = metrics.find((item) => item.id === "memory");

  if (warm && !warm.passed) {
    add("Reduce warm startup", "Audit member shell hydration and duplicate onboarding fetches.", "critical");
  }
  if (lcp && !lcp.passed) {
    add("Improve LCP", "Prioritize hero image and defer non-critical chunks on landing routes.", "critical");
  }
  if (api && !api.passed) {
    add("Lower API P95", "Profile slowest endpoint and add caching or query indexes.", "high");
  }
  if (bundle && !bundle.passed) {
    add("Shrink bundle growth", "Split largest JS chunk and verify lazy admin tab imports.", "high");
  }
  if (memory && !memory.passed) {
    add("Investigate memory leak", "Repeat navigation heap grew beyond certification threshold.", "critical");
  }

  for (const regression of regressions.slice(0, 3)) {
    add(`Review ${regression.title}`, regression.detail, regression.severity === "critical" ? "critical" : "high");
  }

  if (!items.length) {
    add(
      "Maintain performance budget",
      "Re-run npm run certify:performance before each release candidate.",
      "medium"
    );
  }

  return items;
}

export function resolvePerformanceTrend(
  comparisons: PerformanceCertificationComparison[]
): PerformanceCertificationTrendId {
  const previous = comparisons.find((item) => item.windowId === "previous-release");
  const delta = previous?.deltaPercent;
  if (delta == null) return "stable";
  if (delta >= 3) return "regressing";
  if (delta <= -3) return "improving";
  return "stable";
}

export function formatPerformanceCertificationSummary(report: PerformanceCertificationReport): string {
  return `Score ${report.performanceScore}% · ${report.trend} · ${report.regressions.length} regressions · ${report.failures.length} failures`;
}

export function buildPerformanceCertificationReport(
  snapshot: PerformanceCertificationSnapshot,
  history: PerformanceCertificationSnapshot[]
): PerformanceCertificationReport {
  const comparisons = buildPerformanceComparisons(snapshot, history);
  const regressions = buildPerformanceRegressions(snapshot, history);
  const recommendations = buildPerformanceRecommendations(snapshot.metrics, regressions);
  const failures = snapshot.metrics.filter((item) => !item.passed).map((item) => `${item.label} failed (${item.value}${item.unit})`);
  const trend = resolvePerformanceTrend(comparisons);

  const report: PerformanceCertificationReport = {
    generatedAt: snapshot.generatedAt,
    runId: snapshot.runId,
    performanceScore: snapshot.performanceScore,
    passed: snapshot.passed && failures.length === 0,
    trend,
    summaryLine: "",
    metrics: snapshot.metrics,
    comparisons,
    regressions,
    recommendations,
    failures,
    source: "store"
  };
  report.summaryLine = formatPerformanceCertificationSummary(report);
  return report;
}
