#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const constantsSource = readFileSync(join(rootPath, "src/constants/permissionsAudit.ts"), "utf8");
assert(constantsSource.includes("Permissions Audit™"), "permissions audit brand");
assert(constantsSource.includes('PERMISSIONS_AUDIT_ADMIN_PATH = "/hard/audit/security"'), "permissions audit path");
assert(constantsSource.includes("senior-matchmaker"), "senior matchmaker role");
assert(constantsSource.includes("super-admin"), "super admin role");
assert(constantsSource.includes("audit-access"), "audit access area");

const permissionsAuditSource = readFileSync(join(rootPath, "src/utils/permissionsAudit.ts"), "utf8");
assert(permissionsAuditSource.includes("buildPermissionMatrix"), "permission matrix builder");
assert(permissionsAuditSource.includes("buildRouteAccessRecords"), "route access records");
assert(permissionsAuditSource.includes("CONSULTANT_ROUTES"), "consultant routes in audit");

const securityReportSource = readFileSync(join(rootPath, "src/utils/securityAuditReport.ts"), "utf8");
assert(securityReportSource.includes("buildPermissionsAuditReport"), "permissions audit report");
assert(securityReportSource.includes("privilege-escalation"), "privilege escalation detection");
assert(securityReportSource.includes("unprotected-route"), "unprotected route detection");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes('"security"'), "audit security view in hard routes");
assert(hardRoutesSource.includes("PERMISSIONS_AUDIT_ADMIN_PATH"), "permissions path wired in hard routes");

const adminComponents = [
  "PermissionHealthCard.tsx",
  "PermissionMatrixCard.tsx",
  "RoleAccessCard.tsx",
  "RouteAccessCard.tsx",
  "SecurityIssueCard.tsx",
  "PermissionsAuditPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/permissionsAudit", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("PermissionsAuditPage"), "admin hub mounts permissions audit");
assert(adminHubSource.includes('auditView === "security"'), "audit security view wired");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:permissions-audit"), "package.json defines test:permissions-audit");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
const entryAdminSource = readFileSync(join(rootPath, "src/styles/entry-admin.css"), "utf8");
assert((entryAdminSource.includes("permissions-audit.css") || mainSource.includes("permissions-audit.css")), "permissions audit styles imported");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Permissions Audit checks passed.");
