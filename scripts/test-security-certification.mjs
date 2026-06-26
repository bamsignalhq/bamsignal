#!/usr/bin/env node
/**
 * Security Certification™ — verification tests.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canAccessSecurityCertification,
  formatSecurityCertificationSummary,
  securityCertificationRouteRegistered
} from "../server/services/securityCertification.js";

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
  "src/constants/securityCertificationAdmin.ts",
  "src/constants/securityCertification.ts",
  "src/types/securityCertification.ts",
  "src/utils/securityCertificationLogic.ts",
  "src/utils/securityCertificationEngine.ts",
  "src/utils/securityCertificationStore.ts",
  "server/services/securityCertification.js",
  "shared/securityCertificationChecks.mjs",
  "certification/security/run.mjs",
  "certification/security/lib/checks.mjs",
  "certification/security/lib/score.mjs",
  "src/components/admin/securityCertification/SecurityCertificationDashboard.tsx"
];

for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const adminSource = read("src/constants/securityCertificationAdmin.ts");
assert(adminSource.includes("/hard/security-certification"), "security certification route");
assert(adminSource.includes("Security Certification"), "security certification brand");

const constantsSource = read("src/constants/securityCertification.ts");
assert(constantsSource.includes("SECURITY_CERTIFICATION_CHECKS"), "certification checks");
assert(constantsSource.includes("dependency-audit"), "dependency audit check");
assert(constantsSource.includes("SECURITY_CERTIFICATION_RELEASE_BLOCKERS"), "release blockers");

const logicSource = read("src/utils/securityCertificationLogic.ts");
assert(logicSource.includes("buildSecurityCertificationReport"), "report builder");
assert(logicSource.includes("buildSecurityRecommendations"), "recommendations builder");

const sharedSource = read("shared/securityCertificationChecks.mjs");
assert(sharedSource.includes("SECURITY_CERT_BLOCK_ON"), "block rules");
assert(sharedSource.includes("SECURITY_CERT_CHECK_IDS"), "check ids");

const packageJson = JSON.parse(read("package.json"));
assert(packageJson.scripts["certify:security"], "certify:security script");
assert(packageJson.scripts["test:security-certification"], "test:security-certification script");

const permissionsSource = read("src/constants/permissions.ts");
assert(securityCertificationRouteRegistered(permissionsSource), "permissions route registered");
assert(permissionsSource.includes("securitycertification"), "securitycertification tab");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('securitycertification: "security-certification"'), "hard route slug");

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazySecurityCertificationDashboard"), "lazy dashboard");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "securitycertification"'), "AdminHub mounts dashboard");

assert(canAccessSecurityCertification(["ManageOperations"]), "operations can access");
assert(canAccessSecurityCertification(["ManageSafety"]), "safety can access");
assert(!canAccessSecurityCertification(["ViewFinance"]), "finance alone cannot access");

const sampleReport = {
  securityScore: 95,
  passed: true,
  counts: { critical: 0, high: 0, medium: 1, low: 2 }
};
assert(formatSecurityCertificationSummary(sampleReport).includes("95"), "summary formatted");

if (failed > 0) {
  console.error(`\n${failed} security certification test(s) failed.`);
  process.exit(1);
}

console.log("All security certification tests passed.");
