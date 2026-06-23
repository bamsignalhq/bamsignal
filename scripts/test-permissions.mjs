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

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("export type Role"), "Role type exported");
assert(permissionsSource.includes("export type Permission"), "Permission type exported");
assert(permissionsSource.includes("export const RolePermissions"), "RolePermissions map exported");
assert(permissionsSource.includes('"Senior Matchmaker"'), "senior matchmaker role");
assert(permissionsSource.includes("ViewExecutiveDashboard"), "executive dashboard permission");
assert(permissionsSource.includes("HARD_ROUTE_PERMISSIONS"), "hard route permission map");
assert(permissionsSource.includes("ENFORCED_HARD_ROUTE_PATHS"), "enforced hard route list");
assert(permissionsSource.includes("permissionsForHardPath"), "path resolver helper");
assert(permissionsSource.includes("/hard/finance"), "finance route mapped");
assert(permissionsSource.includes("PERMISSIONS_AUDIT_ADMIN_PATH"), "permissions audit route mapped");
assert(permissionsSource.includes("OPERATIONS_CENTER_PATH"), "operations center route mapped");

const componentFiles = [
  "RequirePermission.tsx",
  "PermissionGate.tsx",
  "UnauthorizedPage.tsx"
];

for (const file of componentFiles) {
  const source = readFileSync(join(rootPath, "src/components/admin", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const requirePermissionSource = readFileSync(
  join(rootPath, "src/components/admin/RequirePermission.tsx"),
  "utf8"
);
assert(requirePermissionSource.includes("UnauthorizedPage"), "RequirePermission renders UnauthorizedPage");

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("RequirePermission"), "admin hub wrapped with RequirePermission");

const adminDockSource = readFileSync(join(rootPath, "src/components/admin/AdminCommandDock.tsx"), "utf8");
assert(adminDockSource.includes("roleCanAccessPath"), "command dock filters by permission");

const adminSessionSource = readFileSync(join(rootPath, "src/utils/adminSession.ts"), "utf8");
assert(adminSessionSource.includes("getOperatorRole"), "operator role stored in session");
assert(adminSessionSource.includes("validatedOperatorRole"), "validated operator role state");

const identitySource = readFileSync(join(rootPath, "api/auth/identity.js"), "utf8");
assert(identitySource.includes("role: operatorRole"), "admin-session returns operator role");

const dbSource = readFileSync(join(rootPath, "server/db.js"), "utf8");
assert(dbSource.includes("getPlatformAdminByEmail"), "platform admin role lookup");

const hardRoutes = [
  "/hard/command",
  "/hard/metrics",
  "/hard/business",
  "/hard/users",
  "/hard/reports",
  "/hard/cities",
  "/hard/discover",
  "/hard/city-home",
  "/hard/pricing",
  "/hard/verify",
  "/hard/content",
  "/hard/email",
  "/hard/home-ads",
  "/hard/leads",
  "/hard/concierge",
  "/hard/concierge/operations",
  "/hard/concierge/intelligence",
  "/hard/talent",
  "/hard/support",
  "/hard/audit",
  "/hard/audit/routes",
  "/hard/audit/database",
  "/hard/audit/security",
  "/hard/audit/journeys",
  "/hard/compliance",
  "/hard/system-health",
  "/hard/notifications",
  "/hard/documents",
  "/hard/safety",
  "/hard/academy",
  "/hard/quality",
  "/hard/finance",
  "/hard/messages",
  "/hard/executive",
  "/hard/launch",
  "/hard/remediation"
];

for (const path of hardRoutes) {
  assert(permissionsSource.includes(path), `${path} listed in enforced route registry`);
}

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:permissions"), "package.json defines test:permissions");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Enterprise permission enforcement checks passed.");
