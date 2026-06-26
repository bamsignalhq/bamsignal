#!/usr/bin/env node
/**
 * Production Penetration Certification™ — verification tests.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PENETRATION_CERT_ATTACKS,
  PENETRATION_CERT_BRAND
} from "../shared/productionPenetrationCertification.mjs";
import {
  formatProductionPenetrationCertificationSummary,
  productionPenetrationCertificationCommandRegistered,
  productionPenetrationCertificationModuleRegistered
} from "../server/services/productionPenetrationCertification.js";

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
  "certification/penetration/run.mjs",
  "certification/penetration/config.mjs",
  "certification/penetration/lib/attacks.mjs",
  "certification/penetration/lib/score.mjs",
  "certification/penetration/lib/report.mjs",
  "certification/penetration/lib/server.mjs",
  "shared/productionPenetrationCertification.mjs",
  "server/services/productionPenetrationCertification.js"
];

for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const sharedSource = read("shared/productionPenetrationCertification.mjs");
assert(sharedSource.includes(PENETRATION_CERT_BRAND), "penetration brand");
assert(sharedSource.includes("broken-authorization"), "authz attack");
assert(sharedSource.includes("webhook-spoofing"), "webhook attack");
assert(sharedSource.includes("PENETRATION_CERT_BLOCK_ON_EXPLOIT"), "block rule");
assert(PENETRATION_CERT_ATTACKS.length === 13, "13 attacks registered");

const attacksSource = read("certification/penetration/lib/attacks.mjs");
assert(attacksSource.includes("runAllPenetrationAttacks"), "attack runner");
assert(attacksSource.includes("attackSqlInjection"), "sql injection attack");
assert(attacksSource.includes("handlePaystackWebhookRequest"), "webhook spoof probe");

const reportSource = read("certification/penetration/lib/report.mjs");
assert(reportSource.includes("Residual risk"), "residual risk section");
assert(reportSource.includes("Penetration report"), "penetration report section");

const packageJson = JSON.parse(read("package.json"));
assert(
  productionPenetrationCertificationCommandRegistered(JSON.stringify(packageJson.scripts)),
  "npm scripts wired"
);
assert(
  productionPenetrationCertificationModuleRegistered(read("package.json")),
  "module path registered"
);

const sample = {
  penetrationScore: 100,
  passed: true,
  counts: { blocked: 13, exploited: 0 },
  attacks: new Array(13)
};
assert(formatProductionPenetrationCertificationSummary(sample).includes("PASS"), "summary formatter");

if (failed > 0) {
  console.error(`\nProduction penetration certification tests failed: ${failed}\n`);
  process.exit(1);
}

console.log("Production penetration certification tests passed.\n");
