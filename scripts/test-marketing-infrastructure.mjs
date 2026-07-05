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

const constants = read("src/constants/marketingInfrastructure.ts");
assert(constants.includes("MARKETING_INFRASTRUCTURE_MISSION"), "mission");
assert(constants.includes("MARKETING_CAMPAIGN_TEMPLATES"), "campaign templates");
assert(constants.includes("MARKETING_CONTENT_HUBS"), "content hubs");
assert(constants.includes("REFERRAL_REWARD_RULES"), "referral rewards");

const campaignEngine = read("src/utils/marketingCampaignEngine.ts");
assert(campaignEngine.includes("listMarketingCampaigns"), "campaign list");
assert(campaignEngine.includes("recordCampaignImpression"), "campaign impressions");

const sharing = read("src/utils/marketingSharing.ts");
assert(sharing.includes("shareMemberProfile"), "share profile");
assert(sharing.includes("shareMemberReferral"), "share referral");
assert(sharing.includes("shareSuccessStory"), "share success story");

const dashboard = read("src/pages/ReferralDashboardPage.tsx");
assert(dashboard.includes("Referral Dashboard"), "referral dashboard page");
assert(dashboard.includes("Campaigns"), "campaigns section");

const seo = read("src/utils/marketingSeoCatalog.ts");
assert(seo.includes("getMarketingSeoCatalog"), "seo catalog");

const limits = read("src/constants/limits.ts");
assert(limits.includes("marketingCampaigns"), "campaign storage key");

const lazy = read("src/app/lazyRoutes.ts");
assert(lazy.includes("LazyReferralDashboardPage"), "lazy route");

const hqDoc = join(hqRoot, "docs/bamsignal/marketing-infrastructure/PROGRAM-002-MARKETING-INFRASTRUCTURE.md");
if (existsSync(hqDoc)) {
  assert(readFileSync(hqDoc, "utf8").includes("Marketing Infrastructure"), "HQ doc synced");
} else {
  console.log("SKIP: HQ marketing doc not at sibling path");
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("PASS: PROGRAM 002 Milestone 10 marketing infrastructure (BamSignal)");
