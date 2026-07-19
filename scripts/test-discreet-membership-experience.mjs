/**
 * Pass 2 — Discreet Membership commercial experience (wiring + contract tests).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CAPABILITY,
  EXPERIENCE_BUNDLES,
  FREE_TIER_LIMITS,
  hasCapability,
  resolveCapabilitySet,
  resolveLimitsFromCapabilities
} from "../shared/membershipCapabilities.mjs";
import {
  EXPERIENCE_MODE,
  MEMBERSHIP_EVENT,
  computeEndsAt,
  normalizeExperienceMode
} from "../shared/membershipCommerceHelpers.mjs";
import {
  PRIVACY_MODE,
  computeDiscoverableFlag,
  isDiscreetPrivacyActive,
  mayAppearInPassiveListing
} from "../server/services/memberVisibilityPolicy.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

// --- Pricing / duration ---
const catalog = read("server/services/membershipCatalog.js");
assert(catalog.includes("price: 9999") && catalog.includes("days: 30"), "catalog fallback ₦9999/30d");
assert(read("src/constants/discreetMembership.ts").includes("DISCREET_PRICE_NGN = 9999"), "client price");
assert(read("src/constants/discreetMembership.ts").includes("DISCREET_DURATION_DAYS = 30"), "client days");

// --- Capabilities: unlimited signals/messaging + privacy, no appear_in_discover ---
const discreetCaps = new Set(EXPERIENCE_BUNDLES.discreet_membership);
assert(hasCapability(discreetCaps, CAPABILITY.UNLIMITED_SIGNALS), "unlimited signals");
assert(hasCapability(discreetCaps, CAPABILITY.UNLIMITED_MESSAGING), "unlimited messaging");
assert(hasCapability(discreetCaps, CAPABILITY.DISCREET_PRIVACY), "discreet privacy");
assert(hasCapability(discreetCaps, CAPABILITY.BROWSE_DISCOVER), "can browse");
assert(hasCapability(discreetCaps, CAPABILITY.SEARCH_MEMBERS), "can search");
assert(hasCapability(discreetCaps, CAPABILITY.SEND_SIGNAL), "can signal");
assert(hasCapability(discreetCaps, CAPABILITY.SEND_MESSAGE), "can message");
assert(!hasCapability(discreetCaps, CAPABILITY.APPEAR_IN_DISCOVER), "must not appear in discover");
assert(!hasCapability(discreetCaps, CAPABILITY.PURCHASE_CITY_BOOST), "no city boost placement");
assert(!hasCapability(discreetCaps, CAPABILITY.PURCHASE_SPOTLIGHT), "no spotlight placement");

const resolved = resolveCapabilitySet({ isMember: true, discreetActive: true });
const limits = resolveLimitsFromCapabilities(resolved);
assert(limits.signalsPerDay === null, "discreet signals unlimited");
assert(limits.messagesPerDay === null, "discreet messages unlimited");
assert(FREE_TIER_LIMITS.signalsPerDay === 5, "free tier unchanged");

// --- Visibility ---
assert(
  computeDiscoverableFlag({
    privacyMode: PRIVACY_MODE.DISCREET,
    discreetUntil: new Date(Date.now() + 86400000).toISOString(),
    hideFromDiscovery: false,
    clientDiscoverable: true
  }) === false,
  "active discreet never discoverable"
);

const discreetSubject = {
  id: "d1",
  privacy_mode: "discreet",
  discreet_until: new Date(Date.now() + 86400000).toISOString(),
  account_status: "active",
  discoverable: false,
  onboarding_complete: true
};
assert(isDiscreetPrivacyActive(discreetSubject), "active discreet status");
assert(!mayAppearInPassiveListing(discreetSubject), "hidden from passive listings");

const expired = {
  ...discreetSubject,
  discreet_until: new Date(Date.now() - 1000).toISOString()
};
assert(!isDiscreetPrivacyActive(expired), "expired discreet not active");

// --- Commerce owns activation ---
const fortress = read("server/services/paymentFortress.js");
assert(
  fortress.includes('experienceMode: "discreet"') && fortress.includes("activateMembershipFromPayment"),
  "fortress activates discreet via commerce"
);
assert(!fortress.includes("activateDiscreetMembership("), "fortress must not call effect helper directly");

const commerce = read("server/services/membershipCommerce.js");
assert(
  commerce.includes("activateMembershipFromPayment") &&
    commerce.includes("applyMembershipRefund") &&
    commerce.includes("processExpiredMemberships") &&
    commerce.includes("listDiscreetMembershipAdminEvents") &&
    commerce.includes("listMembershipEventsForMember"),
  "commerce lifecycle + audit lists"
);
assert(normalizeExperienceMode("discreet_membership") === EXPERIENCE_MODE.DISCREET, "mode alias");
assert(MEMBERSHIP_EVENT.MEMBERSHIP_RENEWED === "MEMBERSHIP_RENEWED", "renewal event");

const now = Date.now();
const renewed = new Date(computeEndsAt(new Date(now + 5 * 86400000).toISOString(), 30)).getTime();
assert(renewed > now + 34 * 86400000, "renew stacks from remaining end");

// --- Verify API returns discreet (not premium_until mislabel) ---
const verify = read("api/paystack/verify.js");
assert(
  verify.includes('productType: "discreet"') &&
    verify.includes("discreetUntil") &&
    verify.includes("isDiscreetProductType"),
  "verify success response for discreet"
);

// --- Client purchase + account ---
const payments = read("src/services/payments.ts");
assert(
  payments.includes("startDiscreetPayment") && payments.includes("verifyDiscreetPayment"),
  "client discreet checkout"
);

const center = read("src/pages/DiscreetCenterPage.tsx");
assert(
  center.includes("Discreet active") &&
    center.includes("Renewal") &&
    center.includes("Benefits") &&
    center.includes("History"),
  "account surfaces"
);

assert(read("src/constants/memberRoutes.ts").includes("/discreet-membership"), "member route");
assert(read("src/App.tsx").includes("LazyDiscreetCenterPage"), "App mounts discreet center");
assert(read("src/App.tsx").includes("startDiscreetPayment"), "App purchase handler");

// --- Admin ---
assert(read("api/admin/discreet-membership.js").includes("applyMembershipRefund"), "admin refund");
assert(
  read("src/components/admin/launchCommand/LaunchCommandDiscreetMembershipCard.tsx").includes(
    "Discreet Membership"
  ),
  "admin launch card"
);
assert(read("server/app.js").includes("/api/admin/discreet-membership"), "admin route mounted");

// --- Listing surfaces still use visibility policy ---
assert(
  read("server/memberSocial.js").includes("discoverVisibilitySql") ||
    read("server/memberSocial.js").includes("passiveListingVisibilitySql"),
  "discover/search listings gated"
);
assert(read("server/cityHome.js").includes("passiveListingVisibilitySql"), "nearby/city gated");
assert(
  read("server/services/memberVisibilityPolicy.js").includes("passiveListingVisibilitySql"),
  "policy SQL for recommendations/suggestions surfaces"
);

// --- Regression: privacy/entitlements/commerce architecture not redesigned ---
assert(read("server/services/discreetMembership.js").includes("activateDiscreetMembership"), "effect module kept");
assert(read("scripts/test-discreet-visibility.mjs").includes("mayAppearInPassiveListing"), "3B tests remain");

console.log("test-discreet-membership-experience: ok");
