#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const profileNudgeSource = readFileSync(join(rootPath, "src/utils/profileNudge.ts"), "utf8");
assert(profileNudgeSource.includes('kind: "fields"'), "fields nudge kind");
assert(profileNudgeSource.includes("Profile ${score}% complete"), "profile completion copy");
assert(profileNudgeSource.includes('kind: "photos"'), "photos nudge kind");
assert(profileNudgeSource.includes("Improve visibility →"), "photos CTA");
assert(profileNudgeSource.includes('kind: "verification"'), "verification nudge kind");
assert(profileNudgeSource.includes("Verify your identity"), "verification copy");
assert(profileNudgeSource.includes("NUDGE_DISMISS_MS = 7 * 24"), "7-day dismiss window");
assert(profileNudgeSource.includes("resolveVisibleProfileImprovementNudge"), "visible nudge resolver");

const trustFeedSource = readFileSync(join(rootPath, "src/utils/trustFeedInsertion.ts"), "utf8");
assert(trustFeedSource.includes("TRUST_NUDGE_MIN_PROFILES = 3"), "trust minimum profiles");
assert(trustFeedSource.includes("[12, 28, 46, 65]"), "trust anchor positions");
assert(trustFeedSource.includes("interleaveTrustNudges"), "discover interleave helper");

const homeFeedSource = readFileSync(join(rootPath, "src/utils/homeFeed.ts"), "utf8");
assert(homeFeedSource.includes('type: "trust-nudge"'), "home feed trust item");
assert(homeFeedSource.includes("injectTrustMemberNudges"), "home feed trust injection");

const nudgeComponentSource = readFileSync(
  join(rootPath, "src/components/nudges/MemberMicroNudge.tsx"),
  "utf8"
);
assert(nudgeComponentSource.includes("member-micro-nudge"), "micro nudge component");

const trustedNudgeSource = readFileSync(
  join(rootPath, "src/components/trusted/TrustedMemberNudge.tsx"),
  "utf8"
);
assert(trustedNudgeSource.includes("Trusted Members receive more replies"), "feed trust copy");
assert(trustedNudgeSource.includes("Build trust with other members"), "profile trust copy");

const homePageSource = readFileSync(join(rootPath, "src/pages/HomePage.tsx"), "utf8");
assert(homePageSource.includes("ProfileImprovementNudge"), "home uses improvement nudge");
assert(!homePageSource.includes("ProfileReminderCard"), "home removed reminder card");
assert(!homePageSource.includes("ProfilePhotoProgressCard"), "home removed photo progress card");
assert(!homePageSource.includes("TrustedMemberHomeCard"), "home removed trusted home card");

const discoverSource = readFileSync(join(rootPath, "src/pages/DiscoverPage.tsx"), "utf8");
assert(discoverSource.includes("interleaveTrustNudges"), "discover feed trust insertion");
assert(!discoverSource.includes("ProfileReminderCard"), "discover removed reminder card");

const profilePageSource = readFileSync(join(rootPath, "src/pages/ProfilePage.tsx"), "utf8");
assert(profilePageSource.includes("ProfileOverviewContent"), "profile fintech overview");
assert(!profilePageSource.includes("ProfilePhotoProgressCard"), "profile removed photo progress");
assert(!profilePageSource.includes("ActivityHighlightsCard"), "profile removed activity highlights");
assert(!profilePageSource.includes("WhatBringsYouHereEmptyCard"), "profile removed empty intent card");
assert(!profilePageSource.includes("profile-action-card"), "profile removed action card block");

const overviewSource = readFileSync(
  join(rootPath, "src/components/profile/overview/ProfileOverviewContent.tsx"),
  "utf8"
);
assert(overviewSource.includes("ProfileFintechHero"), "fintech hero section");
assert(overviewSource.includes("ProfileQuickStats"), "quick stats row");
assert(overviewSource.includes("ProfileGuidanceChip"), "single guidance chip");
assert(overviewSource.includes("ProfileCompletionSheet"), "completion sheet");

const cssOverviewSource = readFileSync(join(rootPath, "src/styles/profile-fintech-overview.css"), "utf8");
assert(cssOverviewSource.includes("profile-fintech-hero"), "fintech overview styles");

const emptyChatSource = readFileSync(join(rootPath, "src/components/chats/EmptyChatState.tsx"), "utf8");
assert(!emptyChatSource.includes("ProfileReminderCard"), "chats removed profile reminder");

const cssSource = readFileSync(join(rootPath, "src/styles/member-nudges.css"), "utf8");
assert(cssSource.includes("memberNudgeFadeIn 0.2s"), "200ms fade in");
assert(cssSource.includes("border-radius: 16px"), "16px radius");
assert(cssSource.includes("max-height: 72px"), "max height constraint");

if (failed > 0) {
  console.error(`\n${failed} profile nudge test(s) failed`);
  process.exit(1);
}

console.log("profile nudge tests passed");
