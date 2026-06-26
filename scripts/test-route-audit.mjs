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

const constantsSource = readFileSync(join(rootPath, "src/constants/routeAudit.ts"), "utf8");
assert(constantsSource.includes("Route & Navigation Audit™"), "route audit brand");
assert(constantsSource.includes('ROUTE_AUDIT_ADMIN_PATH = "/hard/audit/routes"'), "route audit admin path");
assert(constantsSource.includes("needs-redirect"), "needs redirect status");
assert(constantsSource.includes("institute"), "institute area");

const routeAuditSource = readFileSync(join(rootPath, "src/utils/routeAudit.ts"), "utf8");
assert(routeAuditSource.includes("buildRouteInventory"), "route inventory builder");
assert(routeAuditSource.includes("SIGNAL_CONCIERGE_ROUTES"), "concierge routes inventoried");
assert(routeAuditSource.includes("BAMSIGNAL_INSTITUTE_ROUTES"), "institute routes inventoried");

const navigationAuditSource = readFileSync(join(rootPath, "src/utils/navigationAudit.ts"), "utf8");
assert(navigationAuditSource.includes("buildNavigationMap"), "navigation map builder");
assert(navigationAuditSource.includes("buildNavigationSimplificationOpportunities"), "simplification opportunities");

const reportSource = readFileSync(join(rootPath, "src/utils/routeHealthReport.ts"), "utf8");
assert(reportSource.includes("buildRouteHealthReport"), "route health report builder");
assert(reportSource.includes("applyDuplicateDetection"), "duplicate detection");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("parseAuditAdminViewFromPath"), "audit sub-view parsing");
assert(hardRoutesSource.includes("hardPathForAuditView"), "audit sub-view paths");

const adminComponents = [
  "RouteHealthCard.tsx",
  "NavigationMapCard.tsx",
  "OrphanRouteCard.tsx",
  "RedirectRecommendationCard.tsx",
  "RouteAuditPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/routeAudit", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("RouteAuditPage"), "admin hub mounts route audit");
assert(adminHubSource.includes('auditView === "routes"'), "audit routes view wired");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:route-audit"), "package.json defines test:route-audit");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
const entryAdminSource = readFileSync(join(rootPath, "src/styles/entry-admin.css"), "utf8");
assert((entryAdminSource.includes("route-audit.css") || mainSource.includes("route-audit.css")), "route audit styles imported");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Route & Navigation Audit checks passed.");
