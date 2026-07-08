#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hqRoot = join(dirname(root), "stankings");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const constants = read("src/constants/personalization.ts");
assert(constants.includes("PERSONALIZATION_MISSION"), "mission");
assert(constants.includes("PERSONALIZATION_ETHICS"), "ethics");
assert(constants.includes("No manipulation"), "no manipulation");
assert(constants.includes("DISCOVER_PREMIUM_WEIGHT_CAP"), "premium weight cap");

const registry = read("src/constants/recommendationRegistry.ts");
assert(registry.includes("COMPLETE_PROFILE"), "complete profile rule");
assert(registry.includes("BUY_BAYGOLD"), "buy baygold rule");
assert(registry.includes("VERIFY_PHONE"), "verify phone rule");
assert(registry.includes("RECOMMENDATION_REGISTRY"), "registry export");

const engine = read("src/utils/personalizationEngine.ts");
assert(engine.includes("getPersonalizationProfile"), "getPersonalizationProfile");
assert(engine.includes("updatePersonalization"), "updatePersonalization");
assert(engine.includes("recommendHome"), "recommendHome");
assert(engine.includes("recommendDiscover"), "recommendDiscover");
assert(engine.includes("recommendWallet"), "recommendWallet");
assert(engine.includes("recommendPremium"), "recommendPremium");
assert(engine.includes("fallbackRecommendations"), "deterministic fallback");
assert(engine.includes("Macrista") === false, "engine stays surface-focused");

const matchQuality = read("src/utils/matchQualityEngine.ts");
assert(matchQuality.includes("discoverPremiumWeightCap"), "premium cap in discover");

const home = read("src/pages/HomePage.tsx");
assert(home.includes("PersonalizedHomeCard"), "home wired");

const analytics = read("src/utils/analytics.ts");
assert(analytics.includes("recommendation_impression"), "impression analytics");
assert(analytics.includes("recommendation_accept"), "accept analytics");

const hqDoc = join(
  hqRoot,
  "docs/bamsignal/personalization/PROGRAM-002-PERSONALIZATION.md",
);
if (existsSync(hqDoc)) {
  assert(readFileSync(hqDoc, "utf8").includes("Personalization"), "HQ doc synced");
} else {
  console.log("SKIP: HQ personalization doc not at sibling path");
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("PASS: PROGRAM 002 Milestone 12 personalization (BamSignal)");
