#!/usr/bin/env node
/**
 * Founder Launch Certification™ — verification tests.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canAccessFounderCertification,
  formatFounderCertificationSummary,
  founderCertificationRouteRegistered
} from "../server/services/founderCertification.js";

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

const requiredFiles = [
  "src/constants/founderCertificationAdmin.ts",
  "src/constants/founderCertification.ts",
  "src/types/founderCertification.ts",
  "src/utils/founderCertificationLogic.ts",
  "src/utils/founderCertificationEngine.ts",
  "src/utils/founderCertificationStore.ts",
  "server/services/founderCertification.js",
  "shared/founderCertificationSubsystems.mjs",
  "certification/founder/run.mjs",
  "certification/founder/lib/collect.mjs",
  "certification/founder/lib/report.mjs",
  "src/components/admin/founderCertification/FounderCertificationDashboard.tsx"
];

for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const adminSource = read("src/constants/founderCertificationAdmin.ts");
assert(adminSource.includes("/hard/founder-certification"), "founder certification route");
assert(adminSource.includes("Founder Launch Certification"), "founder certification brand");

const constantsSource = read("src/constants/founderCertification.ts");
assert(constantsSource.includes("FOUNDER_CERTIFICATION_SUBSYSTEMS"), "subsystem registry");
assert(constantsSource.includes("remote-config"), "remote config subsystem");
assert(constantsSource.includes("GO WITH CONDITIONS"), "launch decisions");

const reportSource = read("certification/founder/lib/report.mjs");
assert(reportSource.includes("founder.pdf.html"), "founder pdf export");
assert(reportSource.includes("board.pdf.html"), "board pdf export");

const sharedSource = read("shared/founderCertificationSubsystems.mjs");
assert(sharedSource.includes("FOUNDER_CERT_SUBSYSTEMS"), "shared subsystem list");
assert(sharedSource.length > 100, "subsystem registry populated");

const packageJson = JSON.parse(read("package.json"));
assert(packageJson.scripts["certify:founder"], "certify:founder script");
assert(packageJson.scripts["test:founder-certification"], "test:founder-certification script");

const permissionsSource = read("src/constants/permissions.ts");
assert(founderCertificationRouteRegistered(permissionsSource), "permissions route registered");
assert(permissionsSource.includes("foundercertification"), "foundercertification tab");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('foundercertification: "founder-certification"'), "hard route slug");

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyFounderCertificationDashboard"), "lazy dashboard");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "foundercertification"'), "AdminHub mounts dashboard");

assert(canAccessFounderCertification(["ViewExecutiveDashboard"]), "executive can access");
assert(!canAccessFounderCertification(["ViewFinance"]), "finance alone cannot access");

const sampleReport = {
  releaseDecisionLabel: "GO",
  overallScore: 92,
  criticalIssues: []
};
assert(formatFounderCertificationSummary(sampleReport).includes("GO"), "summary formatted");

if (failed > 0) {
  console.error(`\n${failed} founder certification test(s) failed.`);
  process.exit(1);
}

console.log("All founder certification tests passed.");
