#!/usr/bin/env node
/**
 * Platform Load Certification™ — verification tests.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PLATFORM_LOAD_CERT_BRAND,
  PLATFORM_LOAD_DEFAULT_VIRTUAL_MEMBERS,
  PLATFORM_LOAD_FULL_SESSION_PHASES,
  PLATFORM_LOAD_JOURNEY_TYPES
} from "../shared/platformLoadCertification.mjs";
import {
  formatPlatformLoadCertificationSummary,
  platformLoadCertificationCommandRegistered,
  platformLoadCertificationModuleRegistered
} from "../server/services/platformLoadCertification.js";

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
  "certification/platform-load/run.mjs",
  "certification/platform-load/config.mjs",
  "certification/platform-load/lib/simulate.mjs",
  "certification/platform-load/lib/metrics.mjs",
  "certification/platform-load/lib/journeys.mjs",
  "certification/platform-load/lib/score.mjs",
  "certification/platform-load/lib/report.mjs",
  "certification/platform-load/lib/server.mjs",
  "shared/platformLoadCertification.mjs",
  "server/services/platformLoadCertification.js"
];

for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const sharedSource = read("shared/platformLoadCertification.mjs");
assert(sharedSource.includes(PLATFORM_LOAD_CERT_BRAND), "platform load brand");
assert(sharedSource.includes("pin-login"), "login journey");
assert(sharedSource.includes("discover-api"), "discover journey");
assert(sharedSource.includes("paystack-verify"), "payments journey");
assert(sharedSource.includes("otp-math-challenge"), "otp journey");
assert(String(PLATFORM_LOAD_DEFAULT_VIRTUAL_MEMBERS) === "1000", "1000 virtual members default");
assert(PLATFORM_LOAD_JOURNEY_TYPES.length >= 4, "journey types registered");
assert(PLATFORM_LOAD_FULL_SESSION_PHASES.includes("login"), "full session includes login");
assert(PLATFORM_LOAD_FULL_SESSION_PHASES.includes("chats"), "full session includes chats");

const simulateSource = read("certification/platform-load/lib/simulate.mjs");
assert(simulateSource.includes("simulatePlatformLoad"), "load simulator");
assert(simulateSource.includes("thinkDelayMs"), "think times between steps");

const scoreSource = read("certification/platform-load/lib/score.mjs");
assert(scoreSource.includes("identifyBottlenecks"), "bottleneck detection");
assert(scoreSource.includes("buildLoadRecommendations"), "recommendations");

const reportSource = read("certification/platform-load/lib/report.mjs");
assert(reportSource.includes("Load test report"), "load test report section");
assert(reportSource.includes("Bottlenecks"), "bottlenecks section");

const packageJson = JSON.parse(read("package.json"));
assert(platformLoadCertificationCommandRegistered(JSON.stringify(packageJson.scripts)), "npm scripts wired");
assert(platformLoadCertificationModuleRegistered(read("package.json")), "module path registered");

const sample = {
  loadScore: 92,
  virtualMembers: 1000,
  journeysPassed: 995,
  measurement: { api: { p95: 420 } },
  bottlenecks: [],
  passed: true
};
assert(formatPlatformLoadCertificationSummary(sample).includes("PASS"), "summary formatter");

if (failed > 0) {
  console.error(`\nPlatform load certification tests failed: ${failed}\n`);
  process.exit(1);
}

console.log("Platform load certification tests passed.\n");
