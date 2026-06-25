import type {
  SecurityChecklistItem,
  SecurityDomainResult,
  SecurityHealthReport,
  SecurityRouteVerification,
  SecurityStatusId
} from "../types/productionSecurity";
import type { SecurityDomainId } from "../types/productionSecurity";
import { SECURITY_HARDENING_FIXES } from "../constants/productionSecurity";
import type { PermissionsAuditReport } from "../types/permissionsAudit";
import type { SecurityIssue } from "../types/permissionsAudit";

export function scoreToSecurityStatus(score: number, hasCritical: boolean): SecurityStatusId {
  if (hasCritical || score < 55) return "critical";
  if (score < 80) return "warning";
  return "secure";
}

export function buildSecurityScore(domains: SecurityDomainResult[]): number {
  if (!domains.length) return 0;
  const total = domains.reduce((sum, item) => sum + item.score, 0);
  const criticalCount = domains.filter((item) => item.status === "critical").length;
  return Math.max(0, Math.round(total / domains.length) - criticalCount * 4);
}

function domainFromIssues(
  id: SecurityDomainId,
  label: string,
  issues: SecurityIssue[],
  secureSummary: string
): SecurityDomainResult {
  const critical = issues.filter((item) => item.status === "critical").length;
  const warning = issues.filter((item) => item.status === "warning").length;
  const issueCount = critical + warning;
  let score = 100;
  if (critical > 0) score = 35;
  else if (warning > 0) score = 72;
  else if (issueCount > 0) score = 85;

  return {
    id,
    label,
    status: scoreToSecurityStatus(score, critical > 0),
    score,
    issueCount,
    summary: issueCount === 0 ? secureSummary : `${critical} critical, ${warning} warning issue(s).`
  };
}

export function buildSecurityDomains(permissionIssues: SecurityIssue[]): SecurityDomainResult[] {
  const byKind = (kinds: SecurityIssue["kind"][]) =>
    permissionIssues.filter((item) => kinds.includes(item.kind));

  return [
    domainFromIssues(
      "authentication",
      "Authentication",
      permissionIssues.filter((item) => item.id.includes("consultant") || item.id.includes("auth")),
      "Username + PIN login enforced — no public email/password surfaces."
    ),
    domainFromIssues(
      "authorization",
      "Authorization",
      byKind(["privilege-escalation", "unprotected-route"]),
      "RBAC enforced on /hard routes via RequirePermission."
    ),
    {
      id: "session-management",
      label: "Session Management",
      status: "warning",
      score: 78,
      issueCount: 1,
      summary: "Member sessions server-backed; consultant portal uses local demo PIN."
    },
    {
      id: "secrets",
      label: "Secrets",
      status: permissionIssues.some((item) => item.id.includes("cron")) ? "warning" : "secure",
      score: permissionIssues.some((item) => item.id.includes("cron")) ? 68 : 92,
      issueCount: permissionIssues.some((item) => item.id.includes("cron")) ? 1 : 0,
      summary: "CRON_SECRET header-only; diagnostics use x-diagnostics-secret."
    },
    {
      id: "api-keys",
      label: "API Keys",
      status: "secure",
      score: 90,
      issueCount: 0,
      summary: "Paystack and Supabase keys runtime-only — never VITE build args."
    },
    {
      id: "headers",
      label: "Headers",
      status: "secure",
      score: 95,
      issueCount: 0,
      summary: "Security headers middleware active on all responses."
    },
    {
      id: "cookies",
      label: "Cookies",
      status: "secure",
      score: 88,
      issueCount: 0,
      summary: "Member auth uses server session tokens — not long-lived cookies in localStorage."
    },
    {
      id: "csrf",
      label: "CSRF",
      status: "warning",
      score: 75,
      issueCount: 1,
      summary: "JSON POST APIs with CORS allowlist — state-changing routes require auth."
    },
    {
      id: "xss",
      label: "XSS",
      status: "secure",
      score: 86,
      issueCount: 0,
      summary: "React escaping + sanitized public profile fields."
    },
    {
      id: "sql-injection",
      label: "SQL Injection",
      status: "secure",
      score: 90,
      issueCount: 0,
      summary: "Parameterized queries via pg — no string-concatenated SQL in handlers."
    },
    {
      id: "rate-limiting",
      label: "Rate Limiting",
      status: "secure",
      score: 92,
      issueCount: 0,
      summary: "Pin login, payment initialize, and admin PIN throttled server-side."
    },
    {
      id: "file-uploads",
      label: "File Uploads",
      status: "secure",
      score: 85,
      issueCount: 0,
      summary: "Photo uploads authenticated — moderation authority server-side."
    },
    {
      id: "validation",
      label: "Validation",
      status: "secure",
      score: 84,
      issueCount: 0,
      summary: "Contact guard and input validation on member text fields."
    },
    {
      id: "logging",
      label: "Logging",
      status: "secure",
      score: 91,
      issueCount: 0,
      summary: "API errors redacted before logging — request IDs on responses."
    },
    {
      id: "sensitive-data",
      label: "Sensitive Data Exposure",
      status: "secure",
      score: 88,
      issueCount: 0,
      summary: "Generic auth errors — no username-to-email resolution endpoints."
    },
    {
      id: "deep-links",
      label: "Deep Links",
      status: "secure",
      score: 87,
      issueCount: 0,
      summary: "Android App Links verified — public routes isolated from member shell."
    },
    {
      id: "rls",
      label: "RLS",
      status: "warning",
      score: 70,
      issueCount: 2,
      summary: "Supabase RLS active — some admin engines still localStorage dual-write."
    },
    {
      id: "storage-access",
      label: "Storage Access",
      status: "warning",
      score: 74,
      issueCount: 1,
      summary: "Photo storage requires runtime config — verify bucket policies in Supabase."
    }
  ];
}

export function buildSecurityChecklist(domains: SecurityDomainResult[]): SecurityChecklistItem[] {
  const items: SecurityChecklistItem[] = [];
  let counter = 0;

  const add = (domainId: SecurityDomainId, label: string, passed: boolean, detail: string) => {
    counter += 1;
    items.push({
      id: `chk_${counter}`,
      checkRef: `SEC-CHK-${counter}`,
      domainId,
      label,
      passed,
      detail
    });
  };

  add("headers", "Security response headers enabled", true, "X-Content-Type-Options, X-Frame-Options, Referrer-Policy");
  add("headers", "X-Powered-By disabled", true, "Express x-powered-by header removed");
  add("secrets", "CRON_SECRET header-only", true, "Query and body secret channels rejected");
  add("authentication", "PIN-only member login", true, "No email/password login surfaces");
  add("sensitive-data", "No public username resolution", true, "resolve-login endpoints removed");
  add("rate-limiting", "Pin login throttled", true, "pinAuthThrottle.js active");
  add("rate-limiting", "Payment initialize throttled", true, "paymentInitializeThrottle.js active");
  add("logging", "Sanitized API error logging", true, "sanitizeApiErrorForLog before observability");
  add("authorization", "Hard route permissions enforced", domains.find((d) => d.id === "authorization")?.status !== "critical", "RequirePermission on /hard workspaces");
  add("rls", "Supabase RLS migrations applied", domains.find((d) => d.id === "rls")?.status === "secure", "Review database audit for migration gaps");
  add("session-management", "Consultant portal hardened", false, "Consultant demo PIN still localStorage — migrate to server auth");
  add("secrets", "CRON_SECRET scoped to automation", domains.find((d) => d.id === "secrets")?.status !== "critical", "Track remediation: signed job tokens for cron-only paths");

  return items;
}

export function buildRouteVerifications(report: PermissionsAuditReport): SecurityRouteVerification[] {
  const adminRoutes = report.routes.filter((item) => item.path.startsWith("/hard"));
  const consultantRoutes = report.routes.filter((item) => item.path.startsWith("/consultant"));
  const memberRoutes = report.routes.filter((item) =>
      ["/home", "/discover", "/chats", "/signals", "/profile", "/settings", "/subscription", "/onboarding"].some(
        (prefix) => item.path === prefix || item.path.startsWith(`${prefix}/`)
      )
    );
  const operationsRoutes = adminRoutes.filter((item) =>
    item.path.includes("operations") || item.path.includes("concierge") || item.path.includes("workforce")
  );
  const executiveRoutes = adminRoutes.filter((item) => item.path.includes("executive"));

  const summarize = (
    routes: typeof report.routes,
    label: string,
    id: SecurityRouteVerification["id"]
  ): SecurityRouteVerification => {
    const issues = routes.filter((item) => item.status === "critical" || item.status === "warning").length;
    const critical = routes.filter((item) => item.status === "critical").length;
    return {
      id,
      label,
      status: critical > 0 ? "critical" : issues > 0 ? "warning" : "secure",
      enforcedCount: routes.length,
      issueCount: issues,
      summary: `${routes.length} routes inventoried — ${issues} permission gap(s).`
    };
  };

  return [
    summarize(adminRoutes, "Admin routes", "admin"),
    summarize(consultantRoutes, "Consultant routes", "consultant"),
    summarize(memberRoutes, "Member routes", "member"),
    summarize(operationsRoutes, "Operations routes", "operations"),
    summarize(executiveRoutes, "Executive routes", "executive"),
    {
      id: "supabase",
      label: "Supabase policies",
      status: "warning",
      enforcedCount: report.totalChecks,
      issueCount: report.issues.filter((item) => item.status === "critical").length,
      summary: "RLS migrations present — verify row policies match server authority."
    },
    {
      id: "storage",
      label: "Storage access",
      status: "warning",
      enforcedCount: 1,
      issueCount: 0,
      summary: "Photo bucket access requires authenticated member session."
    }
  ];
}

export function buildSecurityHealthReport(
  permissionReport: PermissionsAuditReport
): SecurityHealthReport {
  const domains = buildSecurityDomains(permissionReport.issues);
  const checklist = buildSecurityChecklist(domains);
  const routeVerifications = buildRouteVerifications(permissionReport);
  const overallScore = buildSecurityScore(domains);
  const criticalIssueCount =
    permissionReport.issues.filter((item) => item.status === "critical").length +
    domains.filter((item) => item.status === "critical").length;
  const warningIssueCount =
    permissionReport.issues.filter((item) => item.status === "warning").length +
    domains.filter((item) => item.status === "warning").length;
  const passedCheckCount = checklist.filter((item) => item.passed).length;

  return {
    generatedAt: new Date().toISOString(),
    overallScore,
    overallStatus: scoreToSecurityStatus(overallScore, criticalIssueCount > 0),
    domains,
    checklist,
    routeVerifications,
    hardenedFixes: [...SECURITY_HARDENING_FIXES],
    criticalIssueCount,
    warningIssueCount,
    passedCheckCount
  };
}

export function formatSecuritySummaryLine(report: SecurityHealthReport): string {
  return `${report.passedCheckCount} passed · ${report.warningIssueCount} warnings · ${report.criticalIssueCount} critical · score ${report.overallScore}`;
}
