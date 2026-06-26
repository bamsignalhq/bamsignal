#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SESSION_RESTORE_INLINE_MS,
  SESSION_RESTORE_INSTANT_MS,
  resolveSessionRestorePhase
} from "../shared/sessionRestoreUi.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

assert.equal(resolveSessionRestorePhase(100, true), "instant");
assert.equal(resolveSessionRestorePhase(SESSION_RESTORE_INSTANT_MS, true), "inline");
assert.equal(resolveSessionRestorePhase(SESSION_RESTORE_INLINE_MS, true), "minimal");
console.log("✓ Startup UI timing thresholds");

const appSource = read("src/App.tsx");
const memberDataSource = read("src/services/memberData.ts");
const goToAppSource = read("src/services/goToApp.ts");
const memberApiSource = read("src/utils/memberApiAuth.ts");

assert(appSource.includes("markStartupFirstPaint"), "App records first paint");
assert(appSource.includes("skipOnboardingStatus: true"), "App skips duplicate onboarding fetch after goToApp");
assert(!appSource.includes("clearMemberSessionReady();\n      setMemberHydrating(true);") || appSource.includes("scheduleMemberBundleHydration"), "Bundle hydration no longer clears session ready by default");
assert(memberDataSource.includes("skipOnboardingStatus"), "Member bootstrap supports skipping duplicate onboarding status");
assert(memberDataSource.includes("Promise.all"), "Member register and pull run in parallel");
assert(memberDataSource.includes("MEMBER_API_TIMEOUT_MS"), "Member API calls have timeout");
assert(goToAppSource.includes("markStartupPhase"), "goToApp is instrumented");
assert(memberApiSource.includes("HEADER_CACHE_MS"), "Member API headers are cached");
assert(memberApiSource.includes("REFRESH_TIMEOUT_MS"), "Session refresh has timeout");
console.log("✓ Startup performance wiring");

console.log("\nStartup performance tests passed.");
