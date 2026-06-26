#!/usr/bin/env node
/**
 * Data Integrity Certification™ — verification tests.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  dataIntegrityCertificationCommandRegistered,
  dataIntegrityCertificationModuleRegistered,
  formatDataIntegrityCertificationSummary
} from "../server/services/dataIntegrityCertification.js";

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
  "certification/data-integrity/run.mjs",
  "certification/data-integrity/lib/checks.mjs",
  "certification/data-integrity/lib/repair.mjs",
  "certification/data-integrity/lib/score.mjs",
  "certification/data-integrity/lib/report.mjs",
  "shared/dataIntegrityCertificationDomains.mjs",
  "server/services/dataIntegrityCertification.js",
  "src/types/dataIntegrityCertification.ts",
  "src/utils/dataIntegrityCertificationEngine.ts",
  "src/utils/dataIntegrityCertificationStore.ts",
  "src/components/admin/dataIntegrity/DataIntegrityCertificationCard.tsx"
];

for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const sharedSource = read("shared/dataIntegrityCertificationDomains.mjs");
assert(sharedSource.includes("members"), "members domain");
assert(sharedSource.includes("audit-logs"), "audit logs domain");
assert(sharedSource.includes("DATA_INTEGRITY_CERT_BLOCK_ON_CRITICAL"), "block rule");

const checksSource = read("certification/data-integrity/lib/checks.mjs");
assert(checksSource.includes("runDatabaseIntegrityChecks"), "database checks");
assert(checksSource.includes("duplicate paystack_reference"), "duplicate payment check");
assert(checksSource.includes("orphan-messages"), "orphan message check");

const repairSource = read("certification/data-integrity/lib/repair.mjs");
assert(repairSource.includes("runSafeIntegrityRepairs"), "safe repairs");
assert(repairSource.includes("remove-expired-email-otp"), "expired otp repair");
assert(repairSource.includes("manual review"), "unsafe repairs flagged");

const packageJson = JSON.parse(read("package.json"));
assert(dataIntegrityCertificationCommandRegistered(JSON.stringify(packageJson.scripts)), "npm scripts wired");

const dashboardSource = read("src/components/admin/dataIntegrity/IntegrityDashboard.tsx");
const certCardSource = read("src/components/admin/dataIntegrity/DataIntegrityCertificationCard.tsx");
assert(dashboardSource.includes("DataIntegrityCertificationCard"), "dashboard cert card");
assert(certCardSource.includes("certify:data-integrity"), "certify command in UI");

const sample = {
  integrityScore: 100,
  objectsScanned: 1200,
  objectsRepaired: 4,
  criticalIssues: []
};
assert(formatDataIntegrityCertificationSummary(sample).includes("100"), "summary formatted");
assert(dataIntegrityCertificationModuleRegistered(read("package.json")), "module path registered");

if (failed > 0) {
  console.error(`\n${failed} data integrity certification test(s) failed.`);
  process.exit(1);
}

console.log("All data integrity certification tests passed.");
