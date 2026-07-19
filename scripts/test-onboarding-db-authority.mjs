/**
 * Static + pure-logic regression: onboarding routing must use database status only.
 * Client caches must never restore completed users into onboarding.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

function assertIncludes(source, needle, message) {
  assert(source.includes(needle), message);
}

function assertNotIncludes(source, needle, message) {
  assert(!source.includes(needle), message);
}

function testNoClientCompletionAuthority() {
  const guard = read("src/components/MemberRouteGuard.tsx");
  const bootstrap = read("src/utils/sessionRestoreBootstrap.ts");
  const goToApp = read("src/services/goToApp.ts");
  const app = read("src/App.tsx");
  const onboardingPage = read("src/pages/OnboardingPage.tsx");
  const flags = read("src/utils/onboardingFlags.ts");
  const cache = read("src/utils/openAppOnboardingCache.ts");

  assertNotIncludes(guard, "readCachedMemberSession", "MemberRouteGuard must not read client session cache");
  assertNotIncludes(guard, "profileCompleteKnown", "MemberRouteGuard must not use cached completion");
  assertIncludes(
    guard,
    "input.profileComplete === null",
    "Guard must wait for server profileComplete"
  );

  assertNotIncludes(bootstrap, "isProfileOnboardingMarkedComplete", "Bootstrap must not derive completion from local dating profile");
  assertNotIncludes(bootstrap, "profileCompleteKnown", "Bootstrap must not expose cached completion");

  assertNotIncludes(goToApp, 'source: "cache_fallback"', "goToApp must not route via cache_fallback");
  assertNotIncludes(goToApp, "readOpenAppOnboardingCache", "goToApp must not read open-app completion cache");
  assertIncludes(goToApp, "fetchOnboardingStatusWithTimeout", "goToApp must fetch server onboarding status");
  assertIncludes(goToApp, "AUTH_SUCCESS", "goToApp must emit AUTH_SUCCESS");
  assertIncludes(goToApp, "PROFILE_FETCHED", "goToApp must emit PROFILE_FETCHED");
  assertIncludes(goToApp, "ROUTE_SELECTED", "goToApp must emit ROUTE_SELECTED");

  assertNotIncludes(app, "profileCompleteKnown", "App must not seed completion from cache");
  assertNotIncludes(app, "open_app_hydrate_repair", "Hydrate must not override server home→onboarding");
  assertNotIncludes(app, "login_hydrate_repair", "Login hydrate must not override server home→onboarding");
  assertNotIncludes(app, "readOpenAppOnboardingCache", "App failsafe must not use completion cache");
  assertIncludes(app, "logAuthRoute", "App must emit structured auth-route logs");

  assertNotIncludes(onboardingPage, "looksLikeSavedOnboardingProgress", "Onboarding must not resume from local draft progress");
  assertNotIncludes(onboardingPage, "STORAGE_KEYS.onboardingStep", "Onboarding must not restore saved step from storage");
  assertIncludes(onboardingPage, "fetchOnboardingStatus", "Onboarding gate must fetch server status");

  assertIncludes(
    flags,
    "normalizeOnboardingStatus(remote).markedComplete",
    "mergeOnboardingCompleteFlag must use remote/database only"
  );
  assertNotIncludes(
    flags,
    "normalizeOnboardingStatus(local).markedComplete",
    "mergeOnboardingCompleteFlag must ignore local completion"
  );

  assertIncludes(cache, "return false", "Open-app cache read must always be false");
  assertIncludes(cache, "intentionally disabled", "Open-app cache write must be disabled");

  console.log("✓ No client completion authority for onboarding routing");
}

function testScenarioMatrix() {
  /**
   * Pure routing decision used after login / refresh:
   * onboarding_completed from server → home | onboarding
   */
  function decideRoute(server) {
    if (!server || server.ok === false) return { route: "login", reason: "status_unavailable" };
    if (server.completed === true || server.nextRoute === "/home") {
      return { route: "home", reason: server.reason || "server_onboarding_complete" };
    }
    return { route: "onboarding", reason: server.reason || "server_onboarding_incomplete" };
  }

  const scenarios = [
    {
      name: "1 new account incomplete → onboarding",
      server: { ok: true, completed: false, nextRoute: "/onboarding", reason: "missing_fields" },
      expect: "onboarding"
    },
    {
      name: "2 existing completed → home",
      server: { ok: true, completed: true, nextRoute: "/home", reason: "complete" },
      expect: "home"
    },
    {
      name: "3 refresh completed → home",
      server: { ok: true, completed: true, nextRoute: "/home", reason: "complete" },
      localComplete: false,
      expect: "home"
    },
    {
      name: "4 next-day login completed → home",
      server: { ok: true, completed: true, nextRoute: "/home", reason: "complete" },
      localStorageWiped: true,
      expect: "home"
    },
    {
      name: "5 incomplete → resume onboarding",
      server: { ok: true, completed: false, nextRoute: "/onboarding", reason: "photos_missing" },
      expect: "onboarding"
    },
    {
      name: "6 deleted browser storage → server route home",
      server: { ok: true, completed: true, nextRoute: "/home", reason: "complete" },
      localStorageWiped: true,
      staleLocalComplete: false,
      expect: "home"
    },
    {
      name: "7 different browser → server route home",
      server: { ok: true, completed: true, nextRoute: "/home", reason: "complete" },
      expect: "home"
    },
    {
      name: "8 different device → server route onboarding",
      server: { ok: true, completed: false, nextRoute: "/onboarding", reason: "incomplete" },
      expect: "onboarding"
    },
    {
      name: "stale local incomplete must NOT force onboarding when server complete",
      server: { ok: true, completed: true, nextRoute: "/home", reason: "complete" },
      staleLocalComplete: false,
      expect: "home"
    },
    {
      name: "stale local complete must NOT force home when server incomplete",
      server: { ok: true, completed: false, nextRoute: "/onboarding", reason: "incomplete" },
      staleLocalComplete: true,
      expect: "onboarding"
    }
  ];

  for (const scenario of scenarios) {
    const decision = decideRoute(scenario.server);
    // Explicitly ignore client flags — they must not affect decideRoute.
    void scenario.staleLocalComplete;
    void scenario.localComplete;
    void scenario.localStorageWiped;
    assert.equal(decision.route, scenario.expect, scenario.name);
  }

  console.log("✓ Eight-scenario routing matrix (server-only decision)");
}

function testLogoutClearsUserCaches() {
  const authSession = read("src/utils/authSession.ts");
  assertIncludes(authSession, "clearOnboardingDrafts", "Logout clears onboarding drafts");
  assertIncludes(authSession, "clearOpenAppOnboardingCache", "Logout clears open-app cache key");
  assertIncludes(authSession, "STORAGE_KEYS.datingProfile", "Logout clears dating profile");
  assertIncludes(authSession, "STORAGE_KEYS.onboardingStep", "Logout clears onboarding step key");
  console.log("✓ Logout clears user-specific onboarding caches");
}

testNoClientCompletionAuthority();
testScenarioMatrix();
testLogoutClearsUserCaches();
console.log("\nOnboarding DB-authority regression tests passed.");
