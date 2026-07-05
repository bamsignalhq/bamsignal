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

const trust = read("src/constants/communityTrust.ts");
assert(trust.includes("COMMUNITY_TRUST_MISSION"), "mission");
assert(trust.includes("fake_account"), "fake account report");
assert(trust.includes("impersonation"), "impersonation report");
assert(trust.includes("NIGERIA_EMERGENCY_CONTACTS"), "emergency help");
assert(trust.includes("trust_score"), "trust education");

const interactions = read("src/utils/safetyInteractions.ts");
assert(interactions.includes("muteUser"), "mute");
assert(interactions.includes("hideUser"), "hide");
assert(interactions.includes("restrictUser"), "restrict");
assert(interactions.includes("unblockUser"), "unblock");

const safetyCenter = read("src/pages/SafetyCenterPage.tsx");
assert(safetyCenter.includes("Safety Tips"), "safety tips section");
assert(safetyCenter.includes("Blocked Users"), "blocked users");
assert(safetyCenter.includes("Emergency Help"), "emergency help");
assert(safetyCenter.includes("CommunityTrustEducation"), "trust education");

const education = read("src/utils/trustEducation.ts");
assert(education.includes("getTrustEducationView"), "trust education view");

const launchSeed = read("src/utils/launchSeed.ts");
assert(launchSeed.includes("filterHiddenProfiles"), "hidden profiles in discovery");

const hqDoc = join(hqRoot, "docs/bamsignal/community-trust/PROGRAM-002-COMMUNITY-TRUST.md");
if (existsSync(hqDoc)) {
  assert(readFileSync(hqDoc, "utf8").includes("Safety Center"), "HQ doc synced");
} else {
  console.log("SKIP: HQ community trust doc not at sibling path");
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("PASS: PROGRAM 002 Milestone 9 community trust (BamSignal)");
