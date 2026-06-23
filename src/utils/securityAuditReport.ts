import {
  PERMISSION_SECURITY_STATUSES,
  type PermissionRoleId,
  type PermissionSecurityStatusId
} from "../constants/permissionsAudit";
import type {
  PermissionHealthMetric,
  PermissionsAuditReport,
  SecurityIssue
} from "../types/permissionsAudit";
import {
  buildPermissionMatrix,
  buildRoleAccessRecords,
  buildRouteAccessRecords
} from "./permissionsAudit";
import { listEnforcedHardRoutes } from "../constants/permissions";

function buildSecurityIssues(): SecurityIssue[] {
  return [
    {
      id: "issue-cron-secret-bypass",
      kind: "privilege-escalation",
      title: "CRON_SECRET bypasses admin auth",
      summary:
        "server/adminAuth.js requireAdmin accepts x-bamsignal-secret matching CRON_SECRET — grants full admin API access without operator session.",
      status: "critical",
      affectedRoles: ["super-admin"],
      affectedPaths: ["/api/concierge/persistence"]
    },
    {
      id: "issue-flat-admin-tabs",
      kind: "unprotected-route",
      title: "Per-route permission enforcement active",
      summary:
        "RequirePermission gates every /hard workspace route using RolePermissions from permissions.ts. Verify server APIs still enforce operator role independently.",
      status: "warning",
      affectedRoles: ["admin", "operations", "support", "research", "executive"],
      affectedPaths: listEnforcedHardRoutes()
    },
    {
      id: "issue-consultant-local-pin",
      kind: "privilege-escalation",
      title: "Consultant portal uses shared local PIN",
      summary:
        "consultantSession.ts authenticates with a fixed demo PIN and localStorage — not per-consultant Supabase credentials.",
      status: "critical",
      affectedRoles: ["consultant", "senior-matchmaker", "compatibility-specialist", "family-values-advisor", "diaspora-consultant"],
      affectedPaths: ["/consultant/login", "/consultant/portfolio"]
    },
    {
      id: "issue-consultant-capability-ui",
      kind: "access-inconsistency",
      title: "Consultant capabilities not enforced on all routes",
      summary:
        "consultantPermissions.ts defines capabilities but consultant workspace routes do not uniformly gate by roleHasCapability.",
      status: "warning",
      affectedRoles: ["senior-matchmaker", "diaspora-consultant", "family-values-advisor"],
      affectedPaths: ["/consultant/members", "/consultant/regions"]
    },
    {
      id: "issue-role-overlap-legacy-global",
      kind: "role-overlap",
      title: "Senior Matchmaker and Diaspora Consultant overlap",
      summary:
        "Both roles reach global/legacy member surfaces — capability matrix does not isolate diaspora-only vs legacy-only paths.",
      status: "warning",
      affectedRoles: ["senior-matchmaker", "diaspora-consultant"],
      affectedPaths: ["/consultant/members"]
    },
    {
      id: "issue-no-super-admin-rbac",
      kind: "access-inconsistency",
      title: "admin_users.role drives client RBAC",
      summary:
        "admin-session returns operator role from admin_users; RequirePermission enforces RolePermissions on sensitive /hard routes.",
      status: "warning",
      affectedRoles: ["admin", "super-admin"],
      affectedPaths: ["/hard/audit/security", "/hard/audit/database"]
    },
    {
      id: "issue-public-hard-auth",
      kind: "unprotected-route",
      title: "/hard/auth is public",
      summary: "Expected — login surface must remain public; ensure rate limiting and allowlist checks remain server-side.",
      status: "secure",
      affectedRoles: ["admin"],
      affectedPaths: ["/hard/auth"]
    },
    {
      id: "issue-executive-finance-overlap",
      kind: "role-overlap",
      title: "Executive and Finance dashboards overlap",
      summary:
        "Executive Dashboard and Finance Operations both expose revenue — no permission boundary between executive and finance operators.",
      status: "warning",
      affectedRoles: ["executive", "admin", "operations"],
      affectedPaths: ["/hard/executive", "/hard/finance"]
    }
  ];
}

function buildMetrics(
  matrix: ReturnType<typeof buildPermissionMatrix>,
  routes: ReturnType<typeof buildRouteAccessRecords>,
  issues: SecurityIssue[]
): PermissionHealthMetric[] {
  const statusCounts: Record<PermissionSecurityStatusId, number> = {
    secure: 0,
    warning: 0,
    critical: 0
  };

  for (const cell of matrix) {
    statusCounts[cell.status] += 1;
  }
  for (const route of routes) {
    statusCounts[route.status] += 1;
  }
  for (const issue of issues) {
    statusCounts[issue.status] += 1;
  }

  return PERMISSION_SECURITY_STATUSES.map((status) => ({
    status: status.id,
    count: statusCounts[status.id]
  }));
}

export function buildPermissionsAuditReport(): PermissionsAuditReport {
  const matrix = buildPermissionMatrix();
  const roles = buildRoleAccessRecords();
  const routes = buildRouteAccessRecords();
  const issues = buildSecurityIssues();

  return {
    generatedAt: new Date().toISOString(),
    matrix,
    roles,
    routes,
    issues,
    metrics: buildMetrics(matrix, routes, issues),
    totalChecks: matrix.length + routes.length + issues.length
  };
}

export function issuesForRole(issues: SecurityIssue[], roleId: PermissionRoleId): SecurityIssue[] {
  return issues.filter((issue) => issue.affectedRoles.includes(roleId));
}
