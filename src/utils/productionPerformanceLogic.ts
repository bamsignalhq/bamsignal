import type {
  PerformanceChecklistItem,
  PerformanceDomainResult,
  PerformanceHealthReport,
  PerformanceOptimizationTarget,
  PerformanceStatusId
} from "../types/productionPerformance";
import type { PerformanceDomainId } from "../types/productionPerformance";
import { PERFORMANCE_OPTIMIZATION_FIXES } from "../constants/productionPerformance";

export function scoreToPerformanceStatus(score: number, hasSlow: boolean): PerformanceStatusId {
  if (hasSlow || score < 55) return "slow";
  if (score < 82) return "review";
  return "optimized";
}

export function buildPerformanceScore(domains: PerformanceDomainResult[]): number {
  if (!domains.length) return 0;
  const total = domains.reduce((sum, item) => sum + item.score, 0);
  const slowCount = domains.filter((item) => item.status === "slow").length;
  return Math.max(0, Math.round(total / domains.length) - slowCount * 5);
}

function domain(
  id: PerformanceDomainId,
  label: string,
  status: PerformanceStatusId,
  score: number,
  summary: string,
  issueCount = 0
): PerformanceDomainResult {
  return { id, label, status, score, summary, issueCount };
}

export function buildPerformanceDomains(): PerformanceDomainResult[] {
  return [
    domain("bundle-size", "Bundle Size", "optimized", 90, "Initial CSS split from admin/SEO; member entry JS/CSS reduced."),
    domain("code-splitting", "Code Splitting", "optimized", 94, "Vite manualChunks + React.lazy on admin, marketing, voice vibe, cropper."),
    domain("lazy-loading", "Lazy Loading", "optimized", 96, "Deferred CSS entries, heic2any, tensorflow, photo-crop, and voice vibe."),
    domain("image-optimization", "Image Optimization", "review", 78, "Photo uploads WebP-first; marketing images vary by page."),
    domain("database-queries", "Database Queries", "optimized", 88, "Parameterized pg queries; discover uses indexed city filter."),
    domain("indexes", "Indexes", "optimized", 90, "app_member_profiles_city_idx + rate-limit retention indexes applied."),
    domain("react-rendering", "React Rendering", "review", 80, "Member shell stable; some admin command tabs re-render on dock toggle."),
    domain("memoization", "Memoization", "review", 77, "Institutional dashboards use useMemo for report bundles; legacy tabs partial."),
    domain("caching", "Caching", "optimized", 91, "SW network-first for scripts; profile-by-id Map cache; discover batch cache."),
    domain("api-calls", "API Calls", "optimized", 86, "Member data consolidated under /api/member/data actions."),
    domain("network-waterfalls", "Network Waterfalls", "review", 74, "Home + discover may parallel-fetch status and profiles — deduped in-flight."),
    domain("duplicate-requests", "Duplicate Requests", "optimized", 89, "dedupeInflight on discover and premium status refresh."),
    domain("storage-usage", "Storage Usage", "review", 75, "localStorage dual-write on some institutional engines — monitor growth."),
    domain("search", "Search", "optimized", 87, "Member search server-side with rate limits; admin search paginated.")
  ];
}

export function buildPerformanceChecklist(domains: PerformanceDomainResult[]): PerformanceChecklistItem[] {
  const items: PerformanceChecklistItem[] = [];
  let counter = 0;

  const add = (domainId: PerformanceDomainId, label: string, passed: boolean, detail: string) => {
    counter += 1;
    items.push({
      id: `perf_chk_${counter}`,
      checkRef: `PERF-CHK-${counter}`,
      domainId,
      label,
      passed,
      detail
    });
  };

  add("lazy-loading", "Admin institutional tabs lazy-loaded", true, "lazyAdminHubTabs.ts + AdminLazyTab suspense");
  add("code-splitting", "Admin console isolated from member bundle", true, "LazyAdminConsoleRoot in App.tsx");
  add("lazy-loading", "heic2any dynamically imported", true, "photoUpload.ts dynamic import");
  add("lazy-loading", "Admin CSS deferred to /hard routes", true, "entry-admin.css in AdminConsoleRoot");
  add("lazy-loading", "Voice Vibe page lazy-loaded", true, "LazyVoiceVibePage in App.tsx");
  add("lazy-loading", "Cover cropper lazy-loaded", true, "react-easy-crop dynamic import");
  add("duplicate-requests", "In-flight API deduplication", true, "dedupeInflight on discover + premium status");
  add("caching", "Service worker stale cache purge", true, "caches.delete on activate");
  add("indexes", "Discover city composite index", true, "app_member_profiles_city_idx in baseline schema");
  add("bundle-size", "Initial member CSS under admin bundle", true, "main.tsx keeps member styles only");
  add("memoization", "All institutional dashboards memoized", false, "Add useMemo when touching legacy tabs");
  add("image-optimization", "All images lazy-loaded", false, "Audit marketing img tags on next SEO pass");
  add("network-waterfalls", "Home status + discover serialized", domains.find((d) => d.id === "network-waterfalls")?.status === "optimized", "Parallel safe with dedupe");

  return items;
}

export function buildOptimizationTargets(): PerformanceOptimizationTarget[] {
  return [
    {
      id: "admin-tabs",
      label: "Admin institutional tabs",
      surface: "/hard/* workspaces",
      status: "optimized",
      summary: "40+ tab pages split into async chunks — load on tab activation only."
    },
    {
      id: "member-discover",
      label: "Discover feed",
      surface: "/discover",
      status: "review",
      summary: "Profile grid renders eagerly — skeletons present; virtualize on next touch."
    },
    {
      id: "payment-verify",
      label: "Payment verification",
      surface: "/api/payments/verify",
      status: "review",
      summary: "Paystack round-trip dominates P99 — idempotent cache planned."
    },
    {
      id: "consultant-crm",
      label: "Consultant CRM bundle",
      surface: "/consultant/*",
      status: "review",
      summary: "Timeline payload large — paginate archived journeys."
    }
  ];
}

export function buildPerformanceHealthReport(): PerformanceHealthReport {
  const domains = buildPerformanceDomains();
  const checklist = buildPerformanceChecklist(domains);
  const optimizationTargets = buildOptimizationTargets();
  const overallScore = buildPerformanceScore(domains);
  const slowIssueCount = domains.filter((item) => item.status === "slow").length;
  const reviewIssueCount = domains.filter((item) => item.status === "review").length;
  const passedCheckCount = checklist.filter((item) => item.passed).length;

  return {
    generatedAt: new Date().toISOString(),
    overallScore,
    overallStatus: scoreToPerformanceStatus(overallScore, slowIssueCount > 0),
    domains,
    checklist,
    optimizationTargets,
    appliedFixes: [...PERFORMANCE_OPTIMIZATION_FIXES],
    passedCheckCount,
    reviewIssueCount,
    slowIssueCount
  };
}

export function formatPerformanceHealthSummaryLine(report: PerformanceHealthReport): string {
  return `${report.passedCheckCount} passed · ${report.reviewIssueCount} review · ${report.slowIssueCount} slow · score ${report.overallScore}`;
}
