import type {
  UxChecklistItem,
  UxConsistencyReport,
  UxDomainResult,
  UxDuplicateFinding,
  UxStatusId
} from "../types/uxConsistency";
import type { UxDomainId } from "../types/uxConsistency";
import {
  UX_DUPLICATE_COMPONENTS,
  UX_PARALLEL_STATUS_BADGES,
  UX_STANDARDIZATION_TARGETS
} from "../constants/uxDesignSystem";
import { UX_STANDARDIZATION_FIXES } from "../constants/uxConsistency";

export function scoreToUxStatus(score: number, hasInconsistent: boolean): UxStatusId {
  if (hasInconsistent || score < 55) return "inconsistent";
  if (score < 82) return "review";
  return "consistent";
}

export function buildUxScore(domains: UxDomainResult[]): number {
  if (!domains.length) return 0;
  const total = domains.reduce((sum, item) => sum + item.score, 0);
  const inconsistentCount = domains.filter((item) => item.status === "inconsistent").length;
  return Math.max(0, Math.round(total / domains.length) - inconsistentCount * 5);
}

function domain(
  id: UxDomainId,
  label: string,
  status: UxStatusId,
  score: number,
  summary: string,
  issueCount = 0
): UxDomainResult {
  return { id, label, status, score, summary, issueCount };
}

export function buildUxDomains(): UxDomainResult[] {
  return [
    domain(
      "typography",
      "Typography",
      "consistent",
      92,
      "Admin: Inter + JetBrains Mono. Member: --bs-* tokens in member-fintech.css."
    ),
    domain(
      "spacing",
      "Spacing",
      "review",
      78,
      "Institutional pages use 14–18px gaps; legacy admin tabs use alternate padding."
    ),
    domain(
      "buttons",
      "Buttons",
      "review",
      74,
      "Institutional centers use concierge-consultant-btn; legacy command tabs still use btn-primary."
    ),
    domain(
      "cards",
      "Cards",
      "consistent",
      88,
      "Glass concierge-consultant-card--glass cc-reveal is canonical on institutional centers."
    ),
    domain("tables", "Tables", "review", 76, "Finance and users tables use admin-console grids; concierge lists use card rows."),
    domain(
      "forms",
      "Forms",
      "consistent",
      85,
      "Institutional filter forms share finance-search-field / document-search-field patterns."
    ),
    domain("icons", "Icons", "consistent", 90, "Lucide icons with consistent 16–20px sizing in admin dock and centers."),
    domain("animations", "Animations", "consistent", 86, "cc-reveal entrance on institutional cards; member swipe uses discover-v2 transitions."),
    domain("loading-states", "Loading States", "review", 72, "Some admin tabs lack skeletons — spinners or blank states appear."),
    domain("skeletons", "Skeletons", "review", 68, "Member discover has skeletons; not all institutional dashboards do."),
    domain("error-states", "Error States", "consistent", 84, "UnauthorizedPage and toast patterns cover admin errors."),
    domain("success-states", "Success States", "consistent", 83, "Concierge toasts and inline confirmations on institutional actions."),
    domain("dialogs", "Dialogs", "review", 75, "Admin consent modal uses btn-primary; institutional centers use concierge buttons."),
    domain("modals", "Modals", "consistent", 87, "Member pricing/paywall modals share sheet pattern; admin modals use admin-console overlay."),
    domain("mobile-layout", "Mobile Layout", "review", 74, "Member shell safe-area aware; admin dock scrolls horizontally on 320px."),
    domain("desktop-layout", "Desktop Layout", "consistent", 88, "Admin dock + main grid; member max-width shell at 768px+."),
    domain(
      "accessibility",
      "Accessibility",
      "review",
      79,
      "sr-only in admin-console; aria-labels on search bars — not uniform on all tables."
    ),
    domain("dark-theme", "Dark Theme", "consistent", 94, "Admin console and institutional centers are dark-first."),
    domain("light-theme", "Light Theme", "review", 70, "Member light theme via --bs-* tokens; admin has no light variant."),
    domain("navigation", "Navigation", "consistent", 91, "AdminCommandDock + hard route permissions; member bottom nav frozen."),
    domain("breadcrumbs", "Breadcrumbs", "review", 65, "Institutional centers use page titles; few breadcrumb trails."),
    domain("page-titles", "Page Titles", "consistent", 89, "Each institutional center exposes h2 brand + subtitle pattern."),
    domain(
      "consistency",
      "Consistency",
      "review",
      77,
      `${UX_PARALLEL_STATUS_BADGES.length} parallel status-badge CSS families — consolidating to institutional-status-badge.`
    )
  ];
}

export function buildUxChecklist(domains: UxDomainResult[]): UxChecklistItem[] {
  const items: UxChecklistItem[] = [];
  let counter = 0;

  const add = (domainId: UxDomainId, label: string, passed: boolean, detail: string) => {
    counter += 1;
    items.push({
      id: `ux_chk_${counter}`,
      checkRef: `UX-CHK-${counter}`,
      domainId,
      label,
      passed,
      detail
    });
  };

  add("buttons", "Institutional primary buttons use concierge-consultant-btn", true, "Canonical on audit/security/readiness centers");
  add("cards", "Institutional cards use glass + cc-reveal", true, "concierge-consultant-card--glass cc-reveal");
  add("typography", "Member typography locked to member-fintech.css", true, "No redesign — compact fintech preserved");
  add("spacing", "Institutional page shell spacing 14–18px", true, "institutional-page.css shared layout");
  add("consistency", "Unused DocumentSearchBar removed", true, "SearchCard is canonical document filter");
  add("consistency", "Security dashboard uses institutional-page shell", true, "Shared layout with UX audit center");
  add("consistency", "Status chips consolidating", false, "Migrate domain badges to InstitutionalStatusBadge");
  add("buttons", "Legacy admin tabs use btn-primary", false, "Command center seeding tools — migrate when touched");
  add("skeletons", "All institutional dashboards have loading skeletons", false, "Add skeletons on next touch per center");
  add("breadcrumbs", "Audit centers link to related audits", true, "Cross-links on permissions, route, journey audits");
  add("accessibility", "Search inputs have aria-label or associated label", true, "Document and compliance search bars");
  add("mobile-layout", "Admin dock scrolls on narrow viewports", true, "admin-tabs horizontal scroll at 320px");
  add("dark-theme", "Admin console dark tokens consistent", domains.find((d) => d.id === "dark-theme")?.status === "consistent", "admin-console.css variables");

  return items;
}

export function buildUxDuplicates(): UxDuplicateFinding[] {
  return UX_DUPLICATE_COMPONENTS.map((item) => ({
    id: item.id,
    label: item.id.replace(/-/g, " "),
    paths: [...item.paths],
    status: item.id === "document-search" ? "consistent" : "review",
    summary: item.reason
  }));
}

export function buildUxConsistencyReport(): UxConsistencyReport {
  const domains = buildUxDomains();
  const checklist = buildUxChecklist(domains);
  const duplicates = buildUxDuplicates();
  const overallScore = buildUxScore(domains);
  const inconsistentIssueCount = domains.filter((item) => item.status === "inconsistent").length;
  const reviewIssueCount = domains.filter((item) => item.status === "review").length;
  const passedCheckCount = checklist.filter((item) => item.passed).length;

  return {
    generatedAt: new Date().toISOString(),
    overallScore,
    overallStatus: scoreToUxStatus(overallScore, inconsistentIssueCount > 0),
    domains,
    checklist,
    duplicates,
    standardizationTargets: UX_STANDARDIZATION_TARGETS.map(
      (item) => `${item.surface}: ${item.button} + ${item.card}${"locked" in item && item.locked ? " (locked)" : ""}`
    ),
    appliedFixes: [...UX_STANDARDIZATION_FIXES],
    passedCheckCount,
    reviewIssueCount,
    inconsistentIssueCount
  };
}

export function formatUxSummaryLine(report: UxConsistencyReport): string {
  return `${report.passedCheckCount} passed · ${report.reviewIssueCount} review · ${report.inconsistentIssueCount} inconsistent · score ${report.overallScore}`;
}
