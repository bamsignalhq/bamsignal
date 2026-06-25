#!/usr/bin/env node
/**
 * Enterprise Codebase Cleanup™ — verification tests.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildEngineeringHealthScore,
  canAccessEnterpriseCodebaseCleanup,
  enterpriseCleanupRouteRegistered,
  formatEngineeringHealthSummary
} from "../server/services/enterpriseCodebaseCleanup.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const adminSource = read("src/constants/enterpriseCodebaseCleanupAdmin.ts");
assert(adminSource.includes("/hard/enterprise-cleanup"), "enterprise cleanup route");
assert(adminSource.includes("Enterprise Codebase Cleanup"), "enterprise cleanup brand");

const constantsSource = read("src/constants/enterpriseCodebaseCleanup.ts");
assert(constantsSource.includes("ENGINEERING_AUDIT_DOMAINS"), "engineering audit domains");
assert(constantsSource.includes("duplicate-tests"), "duplicate tests domain");
assert(constantsSource.includes("ENGINEERING_REMOVED_FILES"), "removed files inventory");
assert(constantsSource.includes("WorkloadCard.tsx"), "workload card removal documented");

const typesSource = read("src/types/enterpriseCodebaseCleanup.ts");
assert(typesSource.includes("EngineeringHealthReport"), "engineering health report type");
assert(typesSource.includes("removedFiles"), "removed files field");

const logicSource = read("src/utils/enterpriseCodebaseCleanupLogic.ts");
assert(logicSource.includes("buildEngineeringHealthReport"), "engineering health report builder");
assert(logicSource.includes("formatEngineeringHealthSummary"), "summary formatter");

const engineSource = read("src/utils/enterpriseCodebaseCleanupEngine.ts");
assert(engineSource.includes("buildEnterpriseCodebaseCleanup"), "cleanup engine");

const permissionsSource = read("src/constants/permissions.ts");
assert(enterpriseCleanupRouteRegistered(permissionsSource), "enterprise cleanup permissions");
assert(permissionsSource.includes("enterprisecleanup"), "enterprisecleanup tab permission");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('enterprisecleanup: "enterprise-cleanup"'), "enterprise cleanup slug");

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyEnterpriseCodebaseCleanupDashboard"), "lazy cleanup dashboard");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "enterprisecleanup"'), "AdminHub mounts cleanup dashboard");

const dashboardSource = read(
  "src/components/admin/enterpriseCodebaseCleanup/EnterpriseCodebaseCleanupDashboard.tsx"
);
assert(dashboardSource.includes("EngineeringHealthReportCard"), "dashboard mounts report card");
assert(dashboardSource.includes("Re-audit"), "re-audit action");

const packageSource = read("package.json");
assert(packageSource.includes('"lint"'), "lint script");
assert(packageSource.includes('"test"'), "test script");
assert(!packageSource.includes("test-bundle-performance.mjs"), "duplicate bundle test removed from scripts");

assert(!existsSync(join(rootPath, "scripts/test-bundle-performance.mjs")), "test-bundle-performance.mjs deleted");
assert(!existsSync(join(rootPath, "src/components/admin/concierge/WorkloadCard.tsx")), "WorkloadCard deleted");
assert(!existsSync(join(rootPath, "src/components/InterestPicker.tsx")), "InterestPicker deleted");
assert(!existsSync(join(rootPath, "src/components/profile/InterestPickerSheet.tsx")), "InterestPickerSheet deleted");

assert(canAccessEnterpriseCodebaseCleanup(["ManageOperations"]), "operations can access cleanup");
assert(canAccessEnterpriseCodebaseCleanup(["SystemAdministration"]), "admin can access cleanup");
assert(!canAccessEnterpriseCodebaseCleanup(["ViewFinance"]), "finance alone cannot access");

const sampleDomains = [
  { status: "healthy", score: 90 },
  { status: "review", score: 75 },
  { status: "healthy", score: 88 }
];
const score = buildEngineeringHealthScore(sampleDomains);
assert(score > 0 && score <= 100, "engineering health score in range");

const sampleReport = {
  passedCheckCount: 8,
  reviewIssueCount: 6,
  overallScore: 82
};
assert(formatEngineeringHealthSummary(sampleReport).includes("82"), "summary includes score");

if (failed > 0) {
  console.error(`\n${failed} enterprise cleanup test(s) failed.`);
  process.exit(1);
}

console.log("enterprise cleanup checks passed");
