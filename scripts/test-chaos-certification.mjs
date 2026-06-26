#!/usr/bin/env node
/**
 * Chaos Engineering Certification™ — verification tests.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CHAOS_CERT_ATTACKS,
  CHAOS_CERT_BRAND,
  CHAOS_CERT_VERIFY_DIMENSIONS
} from "../shared/chaosCertificationAttacks.mjs";
import {
  chaosCertificationCommandRegistered,
  chaosCertificationModuleRegistered,
  formatChaosCertificationSummary
} from "../server/services/chaosCertification.js";

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
  "certification/chaos/run.mjs",
  "certification/chaos/lib/attacks.mjs",
  "certification/chaos/lib/score.mjs",
  "certification/chaos/lib/report.mjs",
  "shared/chaosCertificationAttacks.mjs",
  "server/services/chaosCertification.js"
];

for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const sharedSource = read("shared/chaosCertificationAttacks.mjs");
assert(sharedSource.includes(CHAOS_CERT_BRAND), "chaos brand");
assert(sharedSource.includes("kill-supabase"), "supabase attack");
assert(sharedSource.includes("kill-remote-config-endpoint"), "remote config attack");
assert(sharedSource.includes("CHAOS_CERT_BLOCK_ON_CRITICAL"), "block rule");
assert(CHAOS_CERT_ATTACKS.length === 15, "15 attacks registered");
assert(CHAOS_CERT_VERIFY_DIMENSIONS.includes("noWhiteScreen"), "white screen dimension");

const attacksSource = read("certification/chaos/lib/attacks.mjs");
assert(attacksSource.includes("runAllChaosAttacks"), "chaos attack runner");
assert(attacksSource.includes("attackKillFeatureFlagEndpoint"), "feature flag attack");
assert(attacksSource.includes("noInfiniteSpinner"), "spinner check");

const reportSource = read("certification/chaos/lib/report.mjs");
assert(reportSource.includes("Critical weaknesses"), "chaos report weaknesses");

const packageJson = JSON.parse(read("package.json"));
assert(chaosCertificationCommandRegistered(JSON.stringify(packageJson.scripts)), "npm scripts wired");
assert(chaosCertificationModuleRegistered(read("package.json")), "module path registered");

const sample = {
  chaosScore: 93,
  recoverySuccess: 14,
  attacks: new Array(15),
  criticalWeaknesses: [],
  passed: true
};
assert(formatChaosCertificationSummary(sample).includes("PASS"), "summary formatter");

if (failed > 0) {
  console.error(`\nChaos certification tests failed: ${failed}\n`);
  process.exit(1);
}

console.log("Chaos certification tests passed.\n");
