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

const constants = read("src/constants/userLifecycle.ts");
assert(constants.includes("USER_LIFECYCLE_MISSION"), "mission");
assert(constants.includes("visitor"), "visitor stage");
assert(constants.includes("ambassador"), "ambassador stage");
assert(constants.includes("reactivated"), "reactivated stage");
assert(constants.includes("RECOMMENDED_ACTIONS"), "recommended actions");
assert((constants.match(/id: "/g) || []).length >= 10, "ten lifecycle stages");

const engine = read("src/utils/userLifecycle.ts");
assert(engine.includes("export function getLifecycle"), "getLifecycle API");
assert(engine.includes("export function updateLifecycle"), "updateLifecycle API");
assert(engine.includes("export function recommendNextStep"), "recommendNextStep API");
assert(engine.includes("everActive"), "dormant guard for new users");
assert(engine.includes("lifecycle_milestone"), "milestone notifications");

const card = read("src/components/dashboard/LifecycleJourneyCard.tsx");
assert(card.includes("Your journey"), "journey card");
assert(card.includes("recommendNextStep"), "next step CTA");

const profile = read("src/pages/ProfilePage.tsx");
assert(profile.includes("LifecycleJourneyCard"), "profile wired");

const notifications = read("src/utils/notifications.ts");
assert(notifications.includes("lifecycle_milestone"), "notification type");
assert(notifications.includes("lifecycle_next_step"), "next step notification");

const analytics = read("src/utils/analytics.ts");
assert(analytics.includes("lifecycle_stage_changed"), "analytics stage event");

const hqDoc = join(hqRoot, "docs/bamsignal/user-lifecycle/PROGRAM-002-USER-LIFECYCLE.md");
if (existsSync(hqDoc)) {
  assert(readFileSync(hqDoc, "utf8").includes("User Lifecycle"), "HQ doc synced");
} else {
  console.log("SKIP: HQ user lifecycle doc not at sibling path");
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("PASS: PROGRAM 002 Milestone 11 user lifecycle (BamSignal)");
