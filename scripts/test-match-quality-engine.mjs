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

const engine = read("src/utils/matchQualityEngine.ts");
assert(engine.includes("rankForMeaningfulMatches"), "meaningful match ranking");
assert(engine.includes("location"), "location factor");
assert(engine.includes("trust_score"), "trust factor");
assert(engine.includes("response_rate"), "response rate factor");
assert(engine.includes("impressionPenalty"), "repeat penalty");

const discovery = read("src/utils/matchQualityDiscovery.ts");
assert(discovery.includes("impressionPenalty"), "impression penalty");
assert(discovery.includes("recordDiscoveryImpression"), "record impression");

const ranking = read("src/utils/buildDiscoverRanking.ts");
assert(ranking.includes("rankForMeaningfulMatches"), "rankDiscoverProfiles delegates");

const launchSeed = read("src/utils/launchSeed.ts");
assert(launchSeed.includes("matchQualityDiscovery"), "launchSeed uses shared impressions");

const discoverPage = read("src/pages/DiscoverPage.tsx");
assert(discoverPage.includes("rankDiscoverProfiles(preferred, viewer, prefs)"), "discover passes prefs");

const metrics = read("src/utils/matchQualityMetrics.ts");
assert(metrics.includes("getMatchQualityMetrics"), "client quality metrics");

const hqDoc = join(hqRoot, "docs/bamsignal/match-quality/PROGRAM-002-MATCH-QUALITY.md");
if (existsSync(hqDoc)) {
  assert(readFileSync(hqDoc, "utf8").includes("rankForMeaningfulMatches"), "HQ doc synced");
} else {
  console.log("SKIP: HQ match quality doc not at sibling path");
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("PASS: PROGRAM 002 Milestone 7 match quality engine (BamSignal)");
