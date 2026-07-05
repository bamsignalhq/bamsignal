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

const audit = read("src/constants/premiumExperience.ts");
assert(audit.includes("PREMIUM_FEATURE_AUDIT"), "feature audit");
assert(audit.includes("unlimited_signals"), "unlimited signals");
assert(audit.includes("future_benefits"), "future benefits");

const renewal = read("src/utils/premiumRenewal.ts");
assert(renewal.includes("seven_days"), "7-day renewal");
assert(renewal.includes("grace"), "grace period");

const center = read("src/pages/PremiumCenterPage.tsx");
assert(center.includes("Premium Center"), "premium center page");
assert(center.includes("Benefits"), "benefits section");
assert(center.includes("Usage"), "usage section");
assert(center.includes("History"), "history section");

const hook = read("src/hooks/usePremiumRenewalReminder.ts");
assert(hook.includes("usePremiumRenewalReminder"), "renewal hook");

const app = read("src/App.tsx");
assert(app.includes("/subscription"), "subscription route");
assert(app.includes("LazyPremiumCenterPage"), "lazy premium center");

const home = read("src/pages/HomePage.tsx");
assert(home.includes("PremiumRenewalBanner"), "home renewal banner");

const profile = read("src/pages/ProfilePage.tsx");
assert(profile.includes("Premium Center"), "profile premium center link");

const hqDoc = join(hqRoot, "docs/bamsignal/premium-experience/PROGRAM-002-PREMIUM-EXPERIENCE.md");
if (existsSync(hqDoc)) {
  assert(readFileSync(hqDoc, "utf8").includes("PremiumCenterPage"), "HQ doc synced");
} else {
  console.log("SKIP: HQ premium doc not at sibling path");
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("PASS: PROGRAM 002 Milestone 8 premium experience (BamSignal)");
