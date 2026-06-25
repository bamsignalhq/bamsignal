#!/usr/bin/env node
/**
 * Founder Acceptance Test™ — full launch verification.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  canAccessFounderAcceptance,
  founderAcceptanceRouteRegistered,
  formatFounderAcceptanceSummary
} from "../server/services/founderAcceptance.js";

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

function runNpm(script) {
  const result = spawnSync("npm", ["run", script], {
    cwd: rootPath,
    stdio: "pipe",
    env: process.env
  });
  return result.status === 0;
}

assert(existsSync(join(rootPath, "FOUNDER_ACCEPTANCE_REPORT.md")), "FOUNDER_ACCEPTANCE_REPORT.md exists");

const constantsSource = read("src/constants/founderAcceptance.ts");
assert(constantsSource.includes("FAT_PERSONAS"), "FAT personas registry");
assert(constantsSource.includes('"guest"'), "guest persona");
assert(constantsSource.includes("super-admin"), "super-admin persona");
assert(constantsSource.includes("FAT_WORKFLOWS"), "FAT workflows registry");
assert(constantsSource.includes("test:payments"), "payments workflow test ref");

const typesSource = read("src/types/founderAcceptance.ts");
assert(typesSource.includes("FounderAcceptanceReport"), "FAT report type");
assert(typesSource.includes("goDecision"), "go decision field");

const logicSource = read("src/utils/founderAcceptanceLogic.ts");
assert(logicSource.includes("buildFounderAcceptanceReport"), "FAT report builder");
assert(logicSource.includes("buildFatGoDecision"), "go/no-go builder");

const adminSource = read("src/constants/founderAcceptanceAdmin.ts");
assert(adminSource.includes("/hard/founder-acceptance"), "FAT admin route");

const permissionsSource = read("src/constants/permissions.ts");
assert(founderAcceptanceRouteRegistered(permissionsSource), "FAT permissions wired");
assert(permissionsSource.includes("founderacceptance"), "founderacceptance tab permission");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('founderacceptance: "founder-acceptance"'), "FAT slug");

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyFounderAcceptanceDashboard"), "lazy FAT dashboard");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "founderacceptance"'), "AdminHub mounts FAT dashboard");

const dashboardSource = read("src/components/admin/founderAcceptance/FounderAcceptanceDashboard.tsx");
assert(dashboardSource.includes("FounderAcceptanceReportCard"), "dashboard mounts report card");
assert(dashboardSource.includes("Re-run FAT"), "re-run action");

assert(canAccessFounderAcceptance(["ManageOperations"]), "ops can access FAT");
assert(canAccessFounderAcceptance(["ViewExecutiveDashboard"]), "executive can access FAT");
assert(!canAccessFounderAcceptance(["ViewFinance"]), "finance alone cannot access FAT");

const sample = { goDecision: "go-with-conditions", passedCount: 22, warningCount: 4, overallScore: 89 };
assert(formatFounderAcceptanceSummary(sample).includes("GO WITH CONDITIONS"), "summary formatter");

const reportDoc = read("FOUNDER_ACCEPTANCE_REPORT.md");
assert(reportDoc.includes("## Go / No-Go"), "report go/no-go section");
assert(reportDoc.includes("## Passed"), "report passed section");
assert(reportDoc.includes("## Warnings"), "report warnings section");

console.log("Running certification suite...");
assert(runNpm("test:certification-suite"), "certification suite passes");

console.log("Running route audit...");
assert(runNpm("audit:routes"), "route audit passes");

console.log("Running permissions audit...");
assert(runNpm("audit:permissions"), "permissions audit passes");

console.log("Running launch audit...");
assert(runNpm("audit:launch"), "launch audit passes");

if (failed > 0) {
  console.error(`\n${failed} founder acceptance test(s) failed.`);
  process.exit(1);
}

console.log("founder acceptance checks passed");
