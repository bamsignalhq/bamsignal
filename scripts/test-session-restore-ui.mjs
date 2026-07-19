#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SESSION_RESTORE_INLINE_MS,
  SESSION_RESTORE_INSTANT_MS,
  SESSION_RESTORE_STALLED_MS,
  resolveSessionRestorePhase
} from "../shared/sessionRestoreUi.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

function testRestorePhaseTiming() {
  assert.equal(resolveSessionRestorePhase(0, true), "instant");
  assert.equal(resolveSessionRestorePhase(SESSION_RESTORE_INSTANT_MS - 1, true), "instant");
  assert.equal(resolveSessionRestorePhase(SESSION_RESTORE_INSTANT_MS, true), "inline");
  assert.equal(resolveSessionRestorePhase(SESSION_RESTORE_INLINE_MS - 1, true), "inline");
  assert.equal(resolveSessionRestorePhase(SESSION_RESTORE_INLINE_MS, true), "minimal");
  assert.equal(resolveSessionRestorePhase(SESSION_RESTORE_STALLED_MS, true), "stalled");
  assert.equal(resolveSessionRestorePhase(500, false), "idle");
  console.log("✓ Session restore UI phase timing");
}

function testUiWiring() {
  const preloaderSource = read("src/components/Preloader.tsx");
  const guardSource = read("src/components/MemberRouteGuard.tsx");
  const appSource = read("src/App.tsx");

  assert(preloaderSource.includes('variant?: "boot" | "minimal"'), "Preloader supports minimal variant");
  assert(!preloaderSource.includes("preloader__tagline"), "Preloader removed marketing tagline");
  assert(guardSource.includes("SessionRestoreOverlay"), "MemberRouteGuard uses tiered restore overlay");
  assert(!guardSource.includes("Restoring your account"), "Removed account restore marketing copy");
  assert(appSource.includes("SessionRestoreOverlay"), "App mounts tiered session restore overlay");
  assert(appSource.includes("readCachedMemberSession"), "App may warm-launch identity from cache (not completion)");
  assert(!appSource.includes("profileCompleteKnown"), "App must not seed completion from client cache");
  assert(appSource.includes("validateServerSessionWithTimeout(OPEN_APP_FAILSAFE_MS)"), "Silent retry path preserved");
  console.log("✓ Session restore UI wiring");
}

testRestorePhaseTiming();
testUiWiring();
console.log("\nSession restore UX tests passed.");
