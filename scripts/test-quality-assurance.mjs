#!/usr/bin/env node
/**
 * Enterprise QA & Certification Center™ — route, permission, and engine verification.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  QA_AUTOMATED_TESTS,
  QA_CERTIFICATION_CENTER_DB_TABLES,
  QA_CERTIFICATION_SECTIONS,
  QA_RELEASE_GATE_STATUSES,
  buildCertificationSummary,
  canAccessQACertificationCenter,
  computeOverallCertificationScore,
  formatCertificationSummaryLine,
  gateStatusBlocksRelease,
  getQACertificationCenterDatabaseTableManifest,
  qaCertificationRouteRegistered
} from "../server/services/qualityAssuranceCenter.js";

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

const adminSource = read("src/constants/qualityAssuranceCenterAdmin.ts");
assert(adminSource.includes('QA_CERTIFICATION_CENTER_ADMIN_PATH = "/hard/quality-assurance"'), "qa route");
assert(adminSource.includes("Enterprise QA & Certification Center™"), "qa brand");

const constantsSource = read("src/constants/qualityAssuranceCenter.ts");
assert(constantsSource.includes("automated-tests"), "automated tests section");
assert(constantsSource.includes("server-import"), "server import test");
assert(constantsSource.includes("abuse-protection"), "abuse protection test");
assert(constantsSource.includes("dark-mode"), "dark mode manual check");
assert(constantsSource.includes("release-certification-pdf"), "release certification pdf report");
assert(constantsSource.includes("QA_CERTIFICATION_REFRESH_INTERVAL_MS = 30_000"), "30s refresh");

const typesSource = read("src/types/qualityAssuranceCenter.ts");
assert(typesSource.includes("QACertificationCenterBundle"), "bundle type");
assert(typesSource.includes("QAReleaseGate"), "release gate type");

const logicSource = read("src/utils/qualityAssuranceCenterLogic.ts");
assert(logicSource.includes("buildQACertificationCenterBundle"), "bundle builder");
assert(logicSource.includes("gateStatusBlocksRelease"), "gate blocks release");

const engineSource = read("src/utils/qualityAssuranceCenterEngine.ts");
assert(engineSource.includes("buildLiveQACertificationCenterBundle"), "live bundle builder");

const storeSource = read("src/utils/qualityAssuranceCenterStore.ts");
assert(storeSource.includes("bamsignal.qualityAssuranceCenter.v1"), "localStorage key");
assert(storeSource.includes("generateQAReport"), "generate report");

const seedSource = read("src/data/qualityAssuranceCenterSeed.ts");
assert(seedSource.includes("QA_AUTOMATED_TEST_SEED"), "automated test seed");
assert(seedSource.includes("QA_MANUAL_CHECK_SEED"), "manual check seed");
assert(seedSource.includes("QA_CERTIFICATION_HISTORY_SEED"), "history seed");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes("QA_CERTIFICATION_CENTER_ADMIN_PATH"), "hard routes include qa path");
assert(hardRoutesSource.includes('qualityassurance: "quality-assurance"'), "qa tab slug");

const permissionsSource = read("src/constants/permissions.ts");
assert(qaCertificationRouteRegistered(permissionsSource), "qa permissions wired");
assert(permissionsSource.includes("qualityassurance"), "qualityassurance tab permission");

const adminComponents = [
  "QualityAssuranceCenterPage.tsx",
  "QACertificationSummaryCard.tsx",
  "QAReleaseGatesCard.tsx",
  "QAAutomatedTestsCard.tsx",
  "QAManualQACard.tsx",
  "QACertificationPanelCard.tsx",
  "QAReportsCard.tsx"
];

for (const file of adminComponents) {
  try {
    read(`src/components/admin/qualityAssurance/${file}`);
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = read("src/pages/AdminHubPage.tsx");
assert(hubSource.includes("QualityAssuranceCenterPage"), "admin hub mounts qa page");

const navSource = read("src/components/admin/adminConsoleNav.ts");
assert(navSource.includes('"qualityassurance"'), "qa nav tab");

const packageSource = read("package.json");
assert(packageSource.includes("test:quality-assurance"), "package.json defines test:quality-assurance");

const mainSource = read("src/main.tsx");
assert(mainSource.includes("quality-assurance-center.css"), "qa styles imported");

const migrationSource = read("supabase/migrations/202606261600_quality_assurance_center.sql");
assert(migrationSource.includes("qa_release_gates"), "release gates migration");

assert(QA_CERTIFICATION_CENTER_DB_TABLES.length === 5, "five qa tables");
assert(getQACertificationCenterDatabaseTableManifest().length === 5, "database manifest");
assert(QA_CERTIFICATION_SECTIONS.length === 10, "ten sections");
assert(QA_AUTOMATED_TESTS.length === 16, "sixteen automated tests");
assert(QA_RELEASE_GATE_STATUSES.length === 3, "three gate statuses");

assert(canAccessQACertificationCenter(["ManageOperations"]), "operations can access");
assert(!canAccessQACertificationCenter(["ViewMembers"]), "members cannot access");

assert(gateStatusBlocksRelease("failed"), "failed blocks release");
assert(!gateStatusBlocksRelease("warning"), "warning does not block");

const subsystems = [{ score: 90 }, { score: 80 }, { score: 100 }];
assert(computeOverallCertificationScore(subsystems) === 90, "overall score average");

const summary = buildCertificationSummary(
  [
    { status: "pass", blocksRelease: false },
    { status: "warning", blocksRelease: false },
    { status: "failed", blocksRelease: true }
  ],
  [{ status: "pass" }, { status: "pass" }],
  [{ status: "pass" }, { status: "warning" }],
  subsystems
);
assert(summary.releaseBlocked === true, "failed gate blocks release");
assert(summary.passCount === 1, "pass count");
assert(formatCertificationSummaryLine(summary).includes("RELEASE BLOCKED"), "summary line");

if (failed) {
  console.error(`\n${failed} quality assurance test(s) failed.`);
  process.exit(1);
}

console.log("Enterprise QA & Certification Center checks passed.");
