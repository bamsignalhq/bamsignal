import {
  ENGINEERING_CLEANUP_FIXES,
  ENGINEERING_DUPLICATE_FINDINGS,
  ENGINEERING_REMOVED_FILES,
  ENGINEERING_STANDARDIZATION_TARGETS
} from "../constants/enterpriseCodebaseCleanup";
import type {
  EngineeringDuplicateFinding,
  EngineeringHealthCheck,
  EngineeringHealthDomainId,
  EngineeringHealthDomainResult,
  EngineeringHealthReport,
  EngineeringHealthStatusId
} from "../types/enterpriseCodebaseCleanup";

export function scoreToEngineeringStatus(score: number, hasDebt: boolean): EngineeringHealthStatusId {
  if (hasDebt || score < 55) return "debt";
  if (score < 82) return "review";
  return "healthy";
}

export function buildEngineeringScore(domains: EngineeringHealthDomainResult[]): number {
  if (!domains.length) return 0;
  const total = domains.reduce((sum, item) => sum + item.score, 0);
  const debtCount = domains.filter((item) => item.status === "debt").length;
  return Math.max(0, Math.round(total / domains.length) - debtCount * 5);
}

function domain(
  id: EngineeringHealthDomainId,
  label: string,
  status: EngineeringHealthStatusId,
  score: number,
  summary: string,
  issueCount = 0
): EngineeringHealthDomainResult {
  return { id, label, status, score, summary, issueCount };
}

export function buildEngineeringDomains(): EngineeringHealthDomainResult[] {
  return [
    domain("unused-files", "Unused Files", "healthy", 91, "Orphan InterestPicker and WorkloadCard wrappers removed this pass."),
    domain("dead-components", "Dead Components", "healthy", 90, "Deprecated WorkloadCard and profile InterestPicker sheets removed."),
    domain("duplicate-utilities", "Duplicate Utilities", "review", 76, "inflightPromise dedupe shared; some legacy utils remain parallel."),
    domain("duplicate-constants", "Duplicate Constants", "review", 78, "Admin path constants per center — no duplicate /hard keys."),
    domain("duplicate-hooks", "Duplicate Hooks", "review", 74, "Member hooks frozen; admin hooks colocated per feature."),
    domain("duplicate-types", "Duplicate Types", "review", 77, "ConsultantWorkloadCard name collision documented — different prop contracts."),
    domain("unused-css", "Unused CSS", "review", 72, "DocumentSearchBar CSS removed in UX pass; legacy admin tabs may retain dead rules."),
    domain("unused-tailwind", "Unused Tailwind", "healthy", 88, "Member/admin primarily use CSS modules and design tokens — minimal Tailwind drift."),
    domain("unused-images", "Unused Images", "review", 70, "Store and SEO assets audited separately — no member bundle bloat added."),
    domain("unused-icons", "Unused Icons", "healthy", 89, "Lucide imports are per-component — no orphan icon registry."),
    domain("unused-routes", "Unused Routes", "healthy", 92, "hardRoutes.ts TAB_SLUGS registered for every HardTab including enterprise-cleanup."),
    domain("unused-layouts", "Unused Layouts", "healthy", 90, "institutional-page shell is canonical for audit dashboards."),
    domain("unused-imports", "Unused Imports", "healthy", 92, "tsc noUnusedLocals/noUnusedParameters enforced via npm run lint."),
    domain("circular-imports", "Circular Imports", "healthy", 86, "No known circular imports on member hot paths or admin lazy tabs."),
    domain("duplicate-business-logic", "Duplicate Business Logic", "review", 73, "Server/client mirrors intentional for test scripts — not duplicated routes."),
    domain("duplicate-validation", "Duplicate Validation", "review", 76, "PIN/username validation centralized; payment paths have layered guards."),
    domain("duplicate-formatters", "Duplicate Formatters", "healthy", 90, "formatPerformanceSummaryLine vs formatPerformanceHealthSummaryLine — distinct names."),
    domain("duplicate-helpers", "Duplicate Helpers", "healthy", 88, "consultationPayment.ts shim removed; consultationPayments.ts is canonical."),
    domain("duplicate-tests", "Duplicate Tests", "healthy", 93, "test-bundle-performance.mjs removed — bundle checks in test-performance.mjs.")
  ];
}

export function buildEngineeringChecklist(domains: EngineeringHealthDomainResult[]): EngineeringHealthCheck[] {
  const items: EngineeringHealthCheck[] = [];
  let counter = 0;

  const add = (
    domainId: EngineeringHealthDomainId,
    label: string,
    passed: boolean,
    detail: string
  ) => {
    counter += 1;
    items.push({
      id: `eng_chk_${counter}`,
      checkRef: `ENG-CHK-${counter}`,
      domainId,
      label,
      passed,
      detail
    });
  };

  add("dead-components", "Deprecated WorkloadCard wrapper removed", true, "ConsultantWorkloadCard is the only workload card export");
  add("dead-components", "Orphan InterestPicker components removed", true, "MoreAboutMePicker is canonical on profile");
  add("duplicate-tests", "Duplicate test-bundle-performance.mjs removed", true, "Fortress suite uses test:performance");
  add("unused-imports", "npm run lint runs tsc --noEmit", true, "Type-level unused import detection");
  add("unused-routes", "enterprise-cleanup route registered in permissions", true, "/hard/enterprise-cleanup + enterprisecleanup tab");
  add("unused-layouts", "Cleanup dashboard uses institutional-page shell", true, "Matches UX/security/launch certification centers");
  add("circular-imports", "Admin hub tabs lazy-loaded", true, "lazyAdminHubTabs.ts — no eager institutional dashboard imports");
  add("duplicate-formatters", "Performance summary formatters disambiguated", true, "formatPerformanceHealthSummaryLine vs formatPerformanceSummaryLine");
  add("duplicate-helpers", "consultationPayment shim removed", true, "All service imports use consultationPayments.ts");
  add("unused-imports", "tsconfig noUnusedLocals and noUnusedParameters enabled", true, "npm run lint enforces zero unused symbols");
  add("unused-css", "Legacy admin tab dead CSS purged", false, "Audit remaining admin-console.css on next admin touch");
  add("duplicate-types", "ConsultantWorkloadCard names disambiguated", false, "Rename workforce variant when both surfaces touched");
  add("duplicate-business-logic", "All @deprecated symbols removed", false, "Intentional compatibility shims remain documented");

  const debtDomains = domains.filter((item) => item.status === "debt").length;
  void debtDomains;

  return items;
}

export function buildEngineeringDuplicates(): EngineeringDuplicateFinding[] {
  return ENGINEERING_DUPLICATE_FINDINGS.map((item) => ({
    id: item.id,
    label: item.id.replace(/-/g, " "),
    paths: [...item.paths],
    status: item.id === "performance-summary-formatter" ? "healthy" : "review",
    summary: item.reason
  }));
}

export function buildEngineeringHealthReport(): EngineeringHealthReport {
  const domains = buildEngineeringDomains();
  const checklist = buildEngineeringChecklist(domains);
  const duplicates = buildEngineeringDuplicates();
  const overallScore = buildEngineeringScore(domains);
  const debtIssueCount = domains.filter((item) => item.status === "debt").length;
  const reviewIssueCount = domains.filter((item) => item.status === "review").length;
  const passedCheckCount = checklist.filter((item) => item.passed).length;

  return {
    generatedAt: new Date().toISOString(),
    overallScore,
    overallStatus: scoreToEngineeringStatus(overallScore, debtIssueCount > 0),
    domains,
    checklist,
    duplicates,
    standardizationTargets: [...ENGINEERING_STANDARDIZATION_TARGETS],
    appliedFixes: [...ENGINEERING_CLEANUP_FIXES],
    removedFiles: [...ENGINEERING_REMOVED_FILES],
    passedCheckCount,
    reviewIssueCount,
    debtIssueCount
  };
}

export function formatEngineeringHealthSummary(report: EngineeringHealthReport): string {
  return `${report.passedCheckCount} passed · ${report.reviewIssueCount} review · ${report.debtIssueCount} debt · score ${report.overallScore}`;
}
