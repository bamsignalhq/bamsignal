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

const firstTime = read("src/constants/firstTimeUser.ts");
assert(firstTime.includes("NEW_USER_JOURNEY_STEPS"), "journey steps constant");
assert(firstTime.includes("MEMBER_EMPTY_STATES"), "empty states");
assert(firstTime.includes("WELCOME_REWARD_CAMPAIGNS"), "welcome rewards");

const milestones = read("src/utils/profileCompletionMilestones.ts");
assert(milestones.includes("20"), "20% milestone");
assert(milestones.includes("100"), "100% milestone");
assert(milestones.includes("trust_score"), "trust unlock");

const progress = read("src/components/member/ProfileCompletionProgress.tsx");
assert(progress.includes("profile-completion-progress"), "progress component");

const discover = read("src/pages/DiscoverPage.tsx");
assert(discover.includes("DiscoveryTutorialBanner"), "discovery tutorial");
assert(discover.includes("MEMBER_EMPTY_STATES"), "discover educated empty");

const wallet = read("src/components/wallet/WalletExperienceSheet.tsx");
assert(wallet.includes("MEMBER_EMPTY_STATES.wallet"), "wallet empty state");

const notifications = read("src/components/NotificationCenter.tsx");
assert(notifications.includes("MEMBER_EMPTY_STATES.notifications"), "notifications empty");

const onboarding = read("src/pages/OnboardingPage.tsx");
assert(onboarding.includes("ProfileCompletionProgress"), "onboarding progress");

const sheet = read("src/components/profile/overview/ProfileCompletionSheet.tsx");
assert(sheet.includes("ProfileCompletionProgress"), "completion sheet milestones");

const hqAudit = join(hqRoot, "docs/bamsignal/first-time-user/PROGRAM-002-ONBOARDING-AUDIT.md");
if (existsSync(hqAudit)) {
  assert(readFileSync(hqAudit, "utf8").includes("First Signal"), "HQ audit synced");
} else {
  console.log("SKIP: HQ onboarding audit not at sibling path");
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("PASS: PROGRAM 002 Milestone 6 first-time user success (BamSignal)");
