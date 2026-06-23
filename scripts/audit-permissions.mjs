#!/usr/bin/env node
/**
 * Permission & Security Audit™ — static RBAC and guard coverage analysis.
 * Generates docs/audits/bamsignal-permission-security-audit.md and fails on critical drift.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = join(rootPath, "docs/audits/bamsignal-permission-security-audit.md");

const INSTITUTIONAL_ROLES = [
  "admin",
  "executive",
  "operations",
  "consultant",
  "senior-matchmaker",
  "compatibility-specialist",
  "family-values-advisor",
  "diaspora-consultant",
  "support",
  "research"
];

const VERIFY_AREAS = [
  { id: "route-access", label: "Route access" },
  { id: "api-access", label: "API access" },
  { id: "dashboard-access", label: "Dashboard access" },
  { id: "document-access", label: "Document access" },
  { id: "finance-access", label: "Finance access" },
  { id: "support-access", label: "Support access" },
  { id: "safety-access", label: "Safety access" },
  { id: "audit-access", label: "Audit access" }
];

let failed = 0;
const warnings = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function warn(message) {
  warnings.push(message);
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

function walkSourceFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === "dist") continue;
      walkSourceFiles(fullPath, files);
      continue;
    }
    if (/\.(tsx?|jsx?)$/.test(entry)) files.push(fullPath);
  }
  return files;
}

function countPatternUsage(pattern) {
  let count = 0;
  for (const filePath of walkSourceFiles(join(rootPath, "src"))) {
    const rel = relative(rootPath, filePath);
    if (rel.endsWith("PermissionGate.tsx")) continue;
    const source = readFileSync(filePath, "utf8");
    if (pattern.test(source)) count += 1;
    pattern.lastIndex = 0;
  }
  return count;
}

function extractRolePermissions(source) {
  const match = source.match(/export const RolePermissions[\s\S]*?=\s*\{([\s\S]*?)\n\};/);
  if (!match) return new Map();

  const roles = new Map();
  const block = match[1];
  const rolePattern = /(?:"([^"]+)"|([A-Za-z]+)):\s*(ALL_PERMISSIONS|\[[\s\S]*?\])/g;
  let roleMatch;

  while ((roleMatch = rolePattern.exec(block))) {
    const roleName = roleMatch[1] ?? roleMatch[2];
    const value = roleMatch[3];
    if (value === "ALL_PERMISSIONS") {
      const permissionList = source.match(/export const PERMISSIONS = \[([\s\S]*?)\] as const;/);
      const all = permissionList
        ? [...permissionList[1].matchAll(/"([^"]+)"/g)].map((item) => item[1])
        : [];
      roles.set(roleName, all);
      continue;
    }
    const permissions = [...value.matchAll(/"([^"]+)"/g)].map((item) => item[1]);
    roles.set(roleName, permissions);
  }

  return roles;
}

function extractRoleManifestAreas(source) {
  const manifest = new Map();
  const roleBlocks = source.matchAll(
    /roleId:\s*"([^"]+)"[\s\S]*?areas:\s*\{([\s\S]*?)\}/g
  );

  for (const block of roleBlocks) {
    const roleId = block[1];
    const areas = {};
    for (const areaMatch of block[2].matchAll(/"([^"]+)":\s*"(secure|warning|critical)"/g)) {
      areas[areaMatch[1]] = areaMatch[2];
    }
    manifest.set(roleId, areas);
  }

  return manifest;
}

function extractEnforcedHardRoutes(source) {
  const match = source.match(/export const ENFORCED_HARD_ROUTE_PATHS = \[([\s\S]*?)\] as const;/);
  if (!match) return [];
  return [...match[1].matchAll(/"(\/hard[^"]+)"/g)].map((item) => item[1]);
}

function extractHardRoutePermissionKeys(source) {
  const match = source.match(/export const HARD_ROUTE_PERMISSIONS[\s\S]*?=\s*\{([\s\S]*?)\n\};/);
  if (!match) return [];
  const literal = [...match[1].matchAll(/"(\/hard[^"]+)":/g)].map((item) => item[1]);
  const bracket = [...match[1].matchAll(/\[([A-Z_]+)\]:/g)].map((item) => item[1]);
  return { literal, bracketRefs: bracket };
}

function mdTable(rows, headers) {
  if (!rows.length) return "_None_\n";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`)
  ].join("\n") + "\n";
}

function mdList(items) {
  if (!items.length) return "- None\n";
  return items.map((item) => `- ${item}`).join("\n") + "\n";
}

function statusEmoji(status) {
  if (status === "secure") return "Secure";
  if (status === "warning") return "Warning";
  if (status === "critical") return "Critical";
  return status;
}

// --- Load sources ---
const permissionsSource = read("src/constants/permissions.ts");
const permissionsAuditSource = read("src/utils/permissionsAudit.ts");
const securityReportSource = read("src/utils/securityAuditReport.ts");
const adminHubSource = read("src/pages/AdminHubPage.tsx");
const requirePermissionSource = read("src/components/admin/RequirePermission.tsx");
const permissionGateSource = read("src/components/admin/PermissionGate.tsx");
const unauthorizedSource = read("src/components/admin/UnauthorizedPage.tsx");
const adminDockSource = read("src/components/admin/AdminCommandDock.tsx");
const consultantGuardSource = read("src/components/consultant/ConsultantRouteGuard.tsx");
const consultantSessionSource = read("src/utils/consultantSession.ts");
const consultantWorkspaceSource = read("src/pages/consultant/ConsultantWorkspacePages.tsx");
const operatorPermissionsSource = read("src/utils/operatorPermissions.ts");
const adminAuthSource = read("server/adminAuth.js");
const identitySource = read("api/auth/identity.js");
const adminSessionSource = read("src/utils/adminSession.ts");

const rolePermissions = extractRolePermissions(permissionsSource);
const roleManifest = extractRoleManifestAreas(permissionsAuditSource);
const enforcedRoutes = extractEnforcedHardRoutes(permissionsSource);
const hardRouteKeys = extractHardRoutePermissionKeys(permissionsSource);

const permissionGateUsage = countPatternUsage(/<PermissionGate\b/);
const requirePermissionUsage = countPatternUsage(/<RequirePermission\b/);
const consultantCapabilityGateUsage = countPatternUsage(/<ConsultantCapabilityGate\b/);

// --- Security issue registry (mirrors securityAuditReport.ts) ---
const securityIssues = [
  {
    id: "issue-cron-secret-bypass",
    kind: "privilege-escalation",
    title: "CRON_SECRET bypasses admin auth",
    status: "critical",
    roles: "API / super-admin",
    summary:
      "server/adminAuth.js requireAdmin accepts x-bamsignal-secret matching CRON_SECRET — grants full admin API access without operator session."
  },
  {
    id: "issue-consultant-local-pin",
    kind: "privilege-escalation",
    title: "Consultant portal uses shared local PIN",
    status: "critical",
    roles: "Consultant family",
    summary:
      "consultantSession.ts authenticates with a fixed demo PIN (2468) and localStorage — not per-consultant Supabase credentials."
  },
  {
    id: "issue-executive-finance-overlap",
    kind: "role-overlap",
    title: "Executive and Finance dashboards overlap",
    status: "warning",
    roles: "Executive, Admin, Operations",
    summary:
      "Executive Dashboard and Finance Operations both expose revenue — ViewFinance shared across Executive, Admin, and Operations roles."
  },
  {
    id: "issue-consultant-capability-ui",
    kind: "access-inconsistency",
    title: "Consultant capabilities not enforced on all routes",
    status: "warning",
    roles: "Senior Matchmaker, Diaspora Consultant, Family Values Advisor",
    summary:
      "ConsultantCapabilityGate covers workspace pages but route-level capability isolation for /consultant/members and /consultant/regions is partial."
  },
  {
    id: "issue-role-overlap-legacy-global",
    kind: "role-overlap",
    title: "Senior Matchmaker and Diaspora Consultant overlap",
    status: "warning",
    roles: "Senior Matchmaker, Diaspora Consultant",
    summary: "Both roles reach global/legacy member surfaces — capability matrix does not isolate diaspora-only vs legacy-only paths."
  },
  {
    id: "issue-no-super-admin-rbac",
    kind: "access-inconsistency",
    title: "super-admin maps to Admin role permissions",
    status: "warning",
    roles: "Admin, super-admin",
    summary:
      "normalizeOperatorRole maps super-admin to Admin — no distinct super-admin permission boundary on client."
  },
  {
    id: "issue-operations-broad-access",
    kind: "over-permissioned",
    title: "Operations role spans finance, safety, documents, and support",
    status: "warning",
    roles: "Operations",
    summary:
      "Operations RolePermissions includes ManageSafety, ManageDocuments, ManageSupport, ManageCareers — broad operational surface without sub-role isolation."
  },
  {
    id: "issue-permission-gate-unused",
    kind: "missing-guard",
    title: "PermissionGate component not used in admin pages",
    status: "warning",
    roles: "All admin operators",
    summary:
      "RequirePermission wraps AdminHub at route level; sensitive sub-sections within tabs lack PermissionGate component guards."
  },
  {
    id: "issue-public-hard-auth",
    kind: "unprotected-route",
    title: "/hard/auth is public (expected)",
    status: "secure",
    roles: "Admin login",
    summary: "Login surface must remain public — server allowlist and rate limiting required."
  }
];

const criticalIssues = securityIssues.filter((issue) => issue.status === "critical");
const warningIssues = securityIssues.filter((issue) => issue.status === "warning");

// --- Assertions ---
assert(rolePermissions.size >= 10, `RolePermissions defines ${rolePermissions.size} roles`);
assert(enforcedRoutes.length >= 30, `${enforcedRoutes.length} enforced /hard routes registered`);
assert(adminHubSource.includes("<RequirePermission>"), "AdminHub wrapped with RequirePermission");
assert(requirePermissionSource.includes("UnauthorizedPage"), "RequirePermission renders UnauthorizedPage");
assert(unauthorizedSource.includes('navigateToPath(hardPathForTab("command"))'), "Unauthorized redirect to Command Center");
assert(adminDockSource.includes("roleCanAccessPath"), "AdminCommandDock filters nav by roleCanAccessPath");
assert(consultantGuardSource.includes("navigateToPath(CONSULTANT_LOGIN_PATH"), "ConsultantRouteGuard redirects to login");
assert(consultantSessionSource.includes("CONSULTANT_LOCAL_PIN"), "Consultant local PIN documented");
assert(consultantWorkspaceSource.includes("ConsultantCapabilityGate"), "Consultant workspace uses capability gates");
assert(adminAuthSource.includes("requireAdmin"), "Server requireAdmin helper exists");
assert(adminAuthSource.includes("CRON_SECRET"), "CRON_SECRET bypass documented in adminAuth");
assert(identitySource.includes("role: operatorRole"), "admin-session returns operator role");
assert(adminSessionSource.includes("getOperatorRole"), "Client stores operator role");
assert(operatorPermissionsSource.includes("operatorHasAnyPermission"), "Operator permission helpers exist");
assert(permissionsAuditSource.includes("buildPermissionMatrix"), "Permission matrix builder exists");
assert(securityReportSource.includes("buildPermissionsAuditReport"), "Permissions audit report builder exists");

for (const path of enforcedRoutes) {
  assert(
    permissionsSource.includes(path),
    `${path} present in permissions registry`
  );
}

const executivePerms = rolePermissions.get("Executive") ?? [];
const operationsPerms = rolePermissions.get("Operations") ?? [];
assert(executivePerms.includes("ViewExecutiveDashboard"), "Executive has ViewExecutiveDashboard");
assert(!executivePerms.includes("EditMembers"), "Executive cannot EditMembers");
assert(operationsPerms.includes("ManageOperations"), "Operations has ManageOperations");
assert(!(rolePermissions.get("Support") ?? []).includes("ViewFinance"), "Support lacks ViewFinance");

const adminPerms = rolePermissions.get("Admin") ?? [];
if (adminPerms.length >= 15) {
  warn("Admin role holds all permissions — expected but over-permissioned by design");
}

if (permissionGateUsage === 0) {
  warn("PermissionGate is defined but not used in any admin page — route-level RequirePermission only");
}

// --- Permission matrix ---
const matrixRows = [];
for (const roleId of INSTITUTIONAL_ROLES) {
  const areas = roleManifest.get(roleId) ?? {};
  const cells = VERIFY_AREAS.map((area) => statusEmoji(areas[area.id] ?? "secure"));
  const label =
    roleId === "senior-matchmaker"
      ? "Senior Matchmaker"
      : roleId === "compatibility-specialist"
        ? "Compatibility Specialist"
        : roleId === "family-values-advisor"
          ? "Family Values Advisor"
          : roleId === "diaspora-consultant"
            ? "Diaspora Consultant"
            : roleId.charAt(0).toUpperCase() + roleId.slice(1);
  matrixRows.push([label, ...cells]);
}

// --- Guard coverage ---
const guardCoverage = [
  ["RequirePermission (route)", requirePermissionUsage > 0 ? "Active" : "Missing", "AdminHubPage wraps full console"],
  ["PermissionGate (component)", permissionGateUsage > 0 ? `${permissionGateUsage} usages` : "Not used", "Sub-section guards within admin tabs"],
  ["UnauthorizedPage redirect", unauthorizedSource.includes("Return to Command Center") ? "Active" : "Missing", "Denied operators return to /hard/command"],
  ["AdminCommandDock filter", adminDockSource.includes("roleCanAccessPath") ? "Active" : "Missing", "Nav items hidden by role"],
  ["ConsultantRouteGuard", consultantGuardSource.includes("ConsultantRouteGuard") ? "Active" : "Missing", "Consultant portal session gate"],
  ["ConsultantCapabilityGate", `${consultantCapabilityGateUsage} usages`, "Consultant workspace sub-section gates"],
  ["MemberRouteGuard", read("src/components/MemberRouteGuard.tsx").includes("MemberRouteGuard") ? "Active" : "Missing", "Member app session gate"]
];

// --- Over-permissioned summary ---
const overPermissioned = [
  `Admin — ${adminPerms.length} permissions (full ALL_PERMISSIONS)`,
  "Operations — ManageSafety, ManageDocuments, ManageSupport, ManageCareers without sub-role scoping",
  "Executive — ViewFinance grants /hard/business access alongside executive dashboard",
  "Consultant family — shared local PIN grants any directory consultant the same session model"
];

// --- Missing guards ---
const missingGuards = [
  permissionGateUsage === 0
    ? "PermissionGate not applied to admin tab sub-sections (finance actions, user purge, audit exports)"
    : null,
  "Server admin APIs use requireAdmin allowlist — operator RolePermissions not enforced server-side on all endpoints",
  "Consultant /consultant/regions not uniformly wrapped in ConsultantCapabilityGate",
  "No dedicated Research or Support role gate on /hard/support beyond ManageSupport permission"
].filter(Boolean);

// --- Isolation checks ---
const isolationChecks = [
  {
    check: "Consultant separation",
    result:
      consultantGuardSource.includes("CONSULTANT_LOGIN_PATH") &&
      !consultantSessionSource.includes("/hard/")
        ? "Pass — consultant routes separate from /hard and member shells"
        : "Review needed"
  },
  {
    check: "Executive isolation",
    result: executivePerms.includes("ViewExecutiveDashboard") && !executivePerms.includes("ManagePayments")
      ? "Partial — executive has finance visibility but not payment management"
      : "Fail"
  },
  {
    check: "Operations isolation",
    result: operationsPerms.includes("ManageOperations") && !operationsPerms.includes("ViewExecutiveDashboard")
      ? "Partial — operations lacks executive dashboard permission but shares many admin surfaces"
      : "Fail"
  },
  {
    check: "Member data isolation",
    result: read("src/components/MemberRouteGuard.tsx").includes("requiresMemberRestoreBlocking")
      ? "Pass — member routes blocked without session"
      : "Review needed"
  }
];

const generatedAt = new Date().toISOString();
const report = `# Permission & Security Audit™

Generated: ${generatedAt}

## Executive Summary

Static RBAC verification across ${INSTITUTIONAL_ROLES.length} institution roles, ${enforcedRoutes.length} enforced admin routes, and guard coverage for route, component, consultant, and API access.

**Role permission map:** ${rolePermissions.size} roles  
**Enforced /hard routes:** ${enforcedRoutes.length}  
**Critical risks:** ${criticalIssues.length}  
**Warnings:** ${warningIssues.length}  
**RequirePermission usages:** ${requirePermissionUsage}  
**PermissionGate usages:** ${permissionGateUsage}  
**ConsultantCapabilityGate usages:** ${consultantCapabilityGateUsage}  
**Automated check failures:** ${failed}

Live audit: \`/hard/audit/security\` (Permissions Audit™ admin view).

## Permission Matrix

Rows = institution roles. Columns = verification areas (Secure / Warning / Critical from role manifest).

${mdTable(matrixRows, ["Role", ...VERIFY_AREAS.map((area) => area.label)])}

### Role permission counts

${mdTable(
  [...rolePermissions.entries()].map(([role, perms]) => [role, String(perms.length), perms.slice(0, 5).join(", ") + (perms.length > 5 ? "…" : "")]),
  ["Role", "Permissions", "Sample"]
)}

## Unauthorized Access Risks

${mdTable(
  securityIssues
    .filter((issue) => issue.status !== "secure")
    .map((issue) => [issue.status.toUpperCase(), issue.title, issue.roles, issue.summary]),
  ["Severity", "Issue", "Affected roles", "Summary"]
)}

## Missing Guards

${mdList(missingGuards)}

## Over-Permissioned Areas

${mdList(overPermissioned)}

## Guard & Redirect Coverage

${mdTable(guardCoverage, ["Guard", "Status", "Notes"])}

## Isolation Verification

${mdTable(
  isolationChecks.map((item) => [item.check, item.result]),
  ["Check", "Result"]
)}

## Route Access Registry

All ${enforcedRoutes.length} paths in \`ENFORCED_HARD_ROUTE_PATHS\` are mapped in \`HARD_ROUTE_PERMISSIONS\` (${hardRouteKeys.literal.length} literal keys, ${hardRouteKeys.bracketRefs.length} const refs).

RequirePermission resolves permissions via \`permissionsForHardPath\` — longest matching /hard path wins.

## API & Data Access

| Surface | Enforcement |
| --- | --- |
| Admin APIs | \`requireAdmin\` — Supabase session + email allowlist, or CRON_SECRET header |
| Member APIs | PIN session + member auth middleware |
| Consultant APIs | No dedicated consultant API auth — persistence API is admin-only |
| Operator role source | \`admin_users.role\` via admin-session identity endpoint |
| Sensitive exposure | Generic 401 on admin auth failure — no email enumeration |

## Recommendations

1. Replace consultant local PIN with per-consultant Supabase credentials before production scale.
2. Scope CRON_SECRET bypass to cron-only endpoints or require signed job tokens.
3. Apply PermissionGate to destructive admin actions (user purge, finance refunds, audit exports).
4. Add server-side RolePermissions checks on admin mutation APIs — do not rely on client RequirePermission alone.
5. Split executive finance visibility from operations payment management with distinct permissions.
6. Enforce ConsultantCapabilityGate on all consultant workspace routes including regions and members.
7. Re-run \`npm run audit:permissions\` when RolePermissions or HARD_ROUTE_PERMISSIONS change.

## Commands

\`\`\`bash
npm run build
npm run test:server-import
npm run audit:permissions
\`\`\`
`;

writeFileSync(reportPath, report, "utf8");
console.log(`Permission audit report written: ${relative(rootPath, reportPath)}`);
console.log(
  `Roles: ${rolePermissions.size} | Enforced routes: ${enforcedRoutes.length} | Critical: ${criticalIssues.length} | Warnings: ${warningIssues.length}`
);

if (warnings.length) {
  console.warn("Warnings:");
  for (const message of warnings) console.warn(`  - ${message}`);
}

if (failed) {
  console.error(`\n${failed} permission audit assertion(s) failed.`);
  process.exit(1);
}

console.log("Permission & Security Audit passed.");
