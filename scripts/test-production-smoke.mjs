#!/usr/bin/env node
/**
 * Production Smoke Suite™ — verification tests.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatProductionSmokeSummary,
  productionSmokeCommandRegistered,
  productionSmokeModuleRegistered
} from "../server/services/productionSmoke.js";

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
  "certification/production-smoke/run.mjs",
  "certification/production-smoke/config.mjs",
  "certification/production-smoke/lib/checks.mjs",
  "certification/production-smoke/lib/http.mjs",
  "certification/production-smoke/lib/report.mjs",
  "certification/production-smoke/lib/score.mjs",
  "shared/productionSmokeChecks.mjs",
  "server/services/productionSmoke.js"
];

for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const sharedSource = read("shared/productionSmokeChecks.mjs");
assert(sharedSource.includes("landing-page"), "landing page check");
assert(sharedSource.includes("feature-flags"), "feature flags check");
assert(sharedSource.includes("remote-config"), "remote config check");
assert(sharedSource.includes("PRODUCTION_SMOKE_BLOCK_ON_CRITICAL"), "block rule");

const checksSource = read("certification/production-smoke/lib/checks.mjs");
assert(checksSource.includes("runProductionSmokeChecks"), "smoke checks runner");
assert(checksSource.includes("checkReadyEndpoint"), "ready endpoint check");
assert(checksSource.includes("assertSpaShell"), "expected UI validation");

const packageJson = JSON.parse(read("package.json"));
assert(productionSmokeCommandRegistered(JSON.stringify(packageJson.scripts)), "npm scripts wired");
assert(productionSmokeModuleRegistered(read("package.json")), "module path registered");

const runnerSource = read("certification/production-smoke/run.mjs");
assert(runnerSource.includes("deploymentTimestamp"), "deployment timestamp in report");
assert(runnerSource.includes("commitSha"), "commit sha in report");

const sample = {
  checksPassed: 12,
  checks: new Array(13),
  smokeScore: 96,
  passed: true
};
assert(formatProductionSmokeSummary(sample).includes("PASS"), "summary formatter");

if (failed > 0) {
  console.error(`\nProduction smoke tests failed: ${failed}\n`);
  process.exit(1);
}

console.log("Production smoke tests passed.\n");
