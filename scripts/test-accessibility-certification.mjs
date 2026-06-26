#!/usr/bin/env node
/**
 * Accessibility Certification™ — verification tests.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canAccessAccessibilityCertification,
  accessibilityCertificationCommandRegistered,
  accessibilityCertificationModuleRegistered,
  accessibilityCertificationRouteRegistered,
  formatAccessibilityCertificationSummary
} from "../server/services/accessibilityCertification.js";

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
  "certification/accessibility/run.mjs",
  "certification/accessibility/lib/checks.mjs",
  "certification/accessibility/lib/score.mjs",
  "certification/accessibility/lib/report.mjs",
  "shared/accessibilityCertificationDomains.mjs",
  "server/services/accessibilityCertification.js",
  "src/constants/accessibilityCertificationAdmin.ts",
  "src/constants/accessibilityCertification.ts",
  "src/types/accessibilityCertification.ts",
  "src/utils/accessibilityCertificationEngine.ts",
  "src/utils/accessibilityCertificationStore.ts",
  "src/components/admin/accessibilityCertification/AccessibilityCertificationDashboard.tsx"
];

for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const sharedSource = read("shared/accessibilityCertificationDomains.mjs");
assert(sharedSource.includes("keyboard-navigation"), "keyboard navigation domain");
assert(sharedSource.includes("modal-focus-trapping"), "modal focus trapping domain");
assert(sharedSource.includes("ACCESSIBILITY_CERT_BLOCK_ON_CRITICAL"), "block rule");

const checksSource = read("certification/accessibility/lib/checks.mjs");
assert(checksSource.includes("runAllAccessibilityChecks"), "accessibility checks");
assert(checksSource.includes("buildViolations"), "violations builder");
assert(checksSource.includes("prefers-reduced-motion"), "reduced motion check");

const packageJson = JSON.parse(read("package.json"));
assert(accessibilityCertificationCommandRegistered(JSON.stringify(packageJson.scripts)), "npm scripts wired");

const permissionsSource = read("src/constants/permissions.ts");
assert(accessibilityCertificationRouteRegistered(permissionsSource), "permissions route registered");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(
  hardRoutesSource.includes('accessibilitycertification: "accessibility-certification"'),
  "hard route slug"
);

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyAccessibilityCertificationDashboard"), "lazy dashboard");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "accessibilitycertification"'), "AdminHub mounts dashboard");

const dashboardSource = read(
  "src/components/admin/accessibilityCertification/AccessibilityCertificationDashboard.tsx"
);
assert(dashboardSource.includes("certify:accessibility"), "certify command in UI");

const sample = {
  accessibilityScore: 92,
  violations: [],
  passed: true,
  counts: { critical: 0, high: 0, medium: 0, low: 0, warning: 1 }
};
assert(
  formatAccessibilityCertificationSummary(sample).includes("PASS"),
  "summary formatter"
);
assert(canAccessAccessibilityCertification(["ManageOperations"]), "access helper");
assert(
  accessibilityCertificationModuleRegistered(read("package.json")),
  "module path registered"
);

if (failed > 0) {
  console.error(`\nAccessibility certification tests failed: ${failed}\n`);
  process.exit(1);
}

console.log("Accessibility certification tests passed.\n");
