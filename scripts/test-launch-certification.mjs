#!/usr/bin/env node
/**
 * Institutional Launch Certification™ — verification tests.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildLaunchReadinessScore,
  canAccessLaunchCertification,
  formatLaunchCertificationSummary,
  launchCertificationRouteRegistered,
  scoreToLaunchDecision
} from "../server/services/launchCertification.js";

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

const adminSource = read("src/constants/launchCertificationAdmin.ts");
assert(adminSource.includes("/hard/launch-certification"), "launch certification route");
assert(adminSource.includes("Institutional Launch Certification"), "launch certification brand");

const constantsSource = read("src/constants/launchCertification.ts");
assert(constantsSource.includes("LAUNCH_CERTIFICATION_DOMAINS"), "certification domains");
assert(constantsSource.includes('"routing"'), "routing domain");
assert(constantsSource.includes('"ios"'), "ios domain");
assert(constantsSource.includes("GO WITH CONDITIONS"), "launch decision labels");
assert(constantsSource.includes("LAUNCH_CONSOLIDATION_CHECKS"), "consolidation checks");

const typesSource = read("src/types/launchCertification.ts");
assert(typesSource.includes("LaunchCertificationReport"), "certification report type");
assert(typesSource.includes("launchDecision"), "launch decision field");
assert(typesSource.includes("criticalBlockers"), "critical blockers field");

const logicSource = read("src/utils/launchCertificationLogic.ts");
assert(logicSource.includes("buildLaunchCertificationReport"), "certification report builder");
assert(logicSource.includes("buildInstitutionalReadinessVerificationBundle"), "aggregates readiness");
assert(logicSource.includes("buildProductionSecurityReport"), "aggregates security");
assert(logicSource.includes("buildProductionPerformanceReport"), "aggregates performance");
assert(logicSource.includes("buildLaunchDecision"), "launch decision builder");

const engineSource = read("src/utils/launchCertificationEngine.ts");
assert(engineSource.includes("buildInstitutionalLaunchCertification"), "certification engine");

const permissionsSource = read("src/constants/permissions.ts");
assert(launchCertificationRouteRegistered(permissionsSource), "launch certification permissions");
assert(permissionsSource.includes("launchcertification"), "launchcertification tab permission");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('launchcertification: "launch-certification"'), "launch certification slug");

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyLaunchCertificationDashboard"), "lazy certification dashboard");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "launchcertification"'), "AdminHub mounts certification dashboard");

const dashboardSource = read("src/components/admin/launchCertification/LaunchCertificationDashboard.tsx");
assert(dashboardSource.includes("LaunchCertificationReportCard"), "dashboard mounts report card");
assert(dashboardSource.includes("LaunchCertificationChecklist"), "dashboard mounts checklist");
assert(dashboardSource.includes("Re-certify"), "re-certify action");

assert(canAccessLaunchCertification(["ManageOperations"]), "operations can access certification");
assert(canAccessLaunchCertification(["ViewExecutiveDashboard"]), "executive can access certification");
assert(!canAccessLaunchCertification(["ViewFinance"]), "finance alone cannot access");

const sampleSubsystems = [
  { status: "certified", score: 90 },
  { status: "conditional", score: 72 },
  { status: "blocked", score: 40 }
];
assert(buildLaunchReadinessScore(sampleSubsystems) > 0, "readiness score computed");
assert(scoreToLaunchDecision(90, 0, 1) === "go", "high score yields GO");
assert(scoreToLaunchDecision(70, 1, 2) === "go-with-conditions", "blockers yield conditional");
assert(scoreToLaunchDecision(40, 4, 5) === "no-go", "many critical yields NO GO");

const sampleReport = {
  launchDecision: "go-with-conditions",
  overallReadinessScore: 78,
  certifiedDomainCount: 22,
  subsystems: [{}, {}]
};
assert(formatLaunchCertificationSummary(sampleReport).includes("78"), "summary formatted");

const mainSource = read("src/main.tsx");
const entryAdminSource = read("src/styles/entry-admin.css");
assert((entryAdminSource.includes("launch-certification.css") || mainSource.includes("launch-certification.css")), "launch certification styles imported");

if (failed > 0) {
  console.error(`\n${failed} launch certification test(s) failed.`);
  process.exit(1);
}

console.log("All launch certification tests passed.");
