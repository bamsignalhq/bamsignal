/**
 * Phase 3B — Discreet Membership visibility policy (source + unit checks).
 * No live DB required. Fail-closed rules verified in-process.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRIVACY_MODE,
  VISIBILITY_CONTEXT,
  activeDiscreetPrivacySql,
  computeDiscoverableFlag,
  isDiscreetPrivacyActive,
  mayAppearInPassiveListing,
  passiveListingVisibilitySql,
  evaluateMemberVisibility
} from "../server/services/memberVisibilityPolicy.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

// --- Pure policy ---
assert(!isDiscreetPrivacyActive({ privacy_mode: "discover" }), "discover mode is not discreet");
assert(
  isDiscreetPrivacyActive({ privacy_mode: "discreet", discreet_until: null }),
  "open-ended discreet must be active (fail closed)"
);
assert(
  isDiscreetPrivacyActive({
    privacy_mode: "discreet",
    discreet_until: new Date(Date.now() + 86400000).toISOString()
  }),
  "future discreet_until must be active"
);
assert(
  !isDiscreetPrivacyActive({
    privacy_mode: "discreet",
    discreet_until: new Date(Date.now() - 1000).toISOString()
  }),
  "expired discreet_until must not be active"
);

assert(
  computeDiscoverableFlag({
    privacyMode: PRIVACY_MODE.DISCREET,
    discreetUntil: null,
    hideFromDiscovery: false,
    clientDiscoverable: true
  }) === false,
  "discreet members must never be discoverable"
);

assert(
  computeDiscoverableFlag({
    privacyMode: PRIVACY_MODE.DISCOVER,
    hideFromDiscovery: false,
    clientDiscoverable: true
  }) === true,
  "discover members remain discoverable"
);

assert(
  computeDiscoverableFlag({
    privacyMode: PRIVACY_MODE.DISCOVER,
    hideFromDiscovery: true,
    clientDiscoverable: true
  }) === false,
  "hideFromDiscovery still works for discover members"
);

const discreetSubject = {
  id: "sub",
  user_key: "uk-sub",
  privacy_mode: "discreet",
  discreet_until: null,
  account_status: "active",
  discoverable: false,
  onboarding_complete: true
};

assert(!mayAppearInPassiveListing(discreetSubject), "discreet must not appear in passive listings");

const discoverSubject = {
  id: "disc",
  user_key: "uk-disc",
  privacy_mode: "discover",
  account_status: "active",
  discoverable: true,
  onboarding_complete: true,
  shadow_banned: false
};
assert(mayAppearInPassiveListing(discoverSubject), "discover member may appear when eligible");

assert(
  !mayAppearInPassiveListing({ ...discoverSubject, shadow_banned: true }),
  "shadow banned must fail closed"
);
assert(
  !mayAppearInPassiveListing({ ...discoverSubject, account_status: "banned" }),
  "banned must fail closed"
);

const sql = passiveListingVisibilitySql("p");
assert(sql.includes("privacy_mode"), "passive SQL must reference privacy_mode");
assert(sql.includes(activeDiscreetPrivacySql("p").slice(0, 20)), "passive SQL must exclude discreet");
assert(sql.includes("shadow_banned"), "passive SQL must keep shadow ban gate");

const directGuest = await evaluateMemberVisibility({
  subject: discreetSubject,
  viewer: null,
  context: VISIBILITY_CONTEXT.DIRECT_PROFILE
});
assert(!directGuest.allowed, "guest must not view discreet profile");

const directDiscoverOk = await evaluateMemberVisibility({
  subject: discoverSubject,
  viewer: null,
  context: VISIBILITY_CONTEXT.DIRECT_PROFILE
});
assert(directDiscoverOk.allowed, "guest may view discover profile");

// --- Wiring audit (no scattered is_discreet) ---
const policySrc = read("server/services/memberVisibilityPolicy.js");
assert(
  policySrc.includes("passiveListingVisibilitySql") && policySrc.includes("evaluateMemberVisibility"),
  "central policy module must export listing + evaluate helpers"
);

const memberTrust = read("server/memberTrust.js");
assert(
  memberTrust.includes("policyDiscoverVisibilitySql") || memberTrust.includes("passiveListingVisibilitySql"),
  "memberTrust discoverVisibilitySql must delegate to policy"
);

const memberSocial = read("server/memberSocial.js");
assert(
  memberSocial.includes("getVisibleMemberProfileById") &&
    memberSocial.includes("isDiscreetPrivacyActive") &&
    memberSocial.includes("hasIntentionalContact") &&
    memberSocial.includes("filterPassiveExposureRows"),
  "memberSocial must gate profile, signals, likes/follows/saved via policy"
);

const memberData = read("api/member/data.js");
assert(
  memberData.includes("getVisibleMemberProfileById") &&
    memberData.includes("computeDiscoverableFlag") &&
    memberData.includes('error: "Profile not available."'),
  "member data API must use visible profile fetch, policy discoverable, and uniform denial copy"
);

const cityHome = read("server/cityHome.js");
assert(
  cityHome.includes("passiveListingVisibilitySql"),
  "city home / nearby / spotlight must use policy SQL (not scattered discreet flags)"
);

const fastConnection = read("server/services/fastConnection.js");
assert(
  fastConnection.includes("isDiscreetPrivacyActive") && fastConnection.includes("discoverVisibilitySql"),
  "fast connection pool must exclude discreet"
);

const fortress = read("server/services/paymentFortress.js");
assert(
  fortress.includes("isDiscreetProductType") &&
    fortress.includes("activateMembershipFromPayment") &&
    fortress.includes('experienceMode: "discreet"') &&
    !fortress.includes("activateDiscreetMembership(") &&
    !fortress.includes("activateAppUserPremium("),
  "discreet fulfillment must go Payment → Commerce → effects (never direct premium/discreet helpers)"
);

const migration = read("migrations/0051_discreet_visibility_policy.sql");
assert(
  migration.includes("privacy_mode") && migration.includes("discreet_until"),
  "migration 0051 must add privacy_mode + discreet_until"
);

// Ensure we did not sprinkle raw is_discreet boolean checks as the primary gate
const scatterHits = [
  "server/memberSocial.js",
  "server/cityHome.js",
  "server/services/fastConnection.js",
  "api/member/data.js"
]
  .map((f) => ({ f, src: read(f) }))
  .filter(({ src }) => /\bis_discreet\b/.test(src));
assert(
  scatterHits.length === 0,
  `must not scatter is_discreet checks: ${scatterHits.map((h) => h.f).join(", ")}`
);

console.log("test-discreet-visibility: ok");
