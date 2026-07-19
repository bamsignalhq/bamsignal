/**
 * Phase 3C — membership entitlement matrix (pure + wiring).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CAPABILITY,
  EXPERIENCE_BUNDLES,
  PRODUCT_TO_EXPERIENCE,
  hasCapability,
  resolveCapabilitySet,
  resolveLimitsFromCapabilities
} from "../shared/membershipCapabilities.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function matrixRow(label, input) {
  const caps = resolveCapabilitySet(input);
  return {
    label,
    caps,
    can: (c) => hasCapability(caps, c),
    limits: resolveLimitsFromCapabilities(caps)
  };
}

const guest = matrixRow("Guest", { isGuest: true });
const free = matrixRow("Free Discover", { isMember: true });
const premium = matrixRow("Premium Discover", {
  isMember: true,
  discoverMembershipActive: true
});
const discreet = matrixRow("Discreet", { isMember: true, discreetActive: true });
const concierge = matrixRow("Concierge", { isMember: true, conciergeActive: true });
const admin = matrixRow("Admin", { isAdmin: true });

assert(!guest.can(CAPABILITY.SEND_SIGNAL), "guest cannot send signals");
assert(!guest.can(CAPABILITY.BROWSE_DISCOVER), "guest cannot browse discover");

assert(free.can(CAPABILITY.SEND_SIGNAL), "free can send signals");
assert(free.can(CAPABILITY.APPEAR_IN_DISCOVER), "free appears in discover");
assert(!free.can(CAPABILITY.UNLIMITED_SIGNALS), "free is limited");
assert(free.limits.signalsPerDay === 5, "free signal limit is 5");
assert(!free.can(CAPABILITY.VIEW_VISITORS), "free cannot view visitors");
assert(!free.can(CAPABILITY.DISCREET_PRIVACY), "free is not discreet");

assert(premium.can(CAPABILITY.UNLIMITED_SIGNALS), "premium unlimited signals");
assert(premium.can(CAPABILITY.UNLIMITED_MESSAGING), "premium unlimited messaging");
assert(premium.can(CAPABILITY.VIEW_VISITORS), "premium visitors");
assert(premium.can(CAPABILITY.APPEAR_IN_DISCOVER), "premium appears in discover");
assert(premium.limits.signalsPerDay === null, "premium has no daily signal cap");

assert(discreet.can(CAPABILITY.DISCREET_PRIVACY), "discreet privacy on");
assert(discreet.can(CAPABILITY.UNLIMITED_SIGNALS), "discreet has unlimited signals");
assert(discreet.can(CAPABILITY.BROWSE_DISCOVER), "discreet can browse");
assert(!discreet.can(CAPABILITY.APPEAR_IN_DISCOVER), "discreet never appears in discover");
assert(!discreet.can(CAPABILITY.PURCHASE_CITY_BOOST), "discreet cannot buy city boost");
assert(!discreet.can(CAPABILITY.PURCHASE_SPOTLIGHT), "discreet cannot buy spotlight");
assert(discreet.can(CAPABILITY.PURCHASE_BOOST), "discreet can buy shop boosts");

assert(concierge.can(CAPABILITY.USE_CONCIERGE), "concierge eligibility");
assert(concierge.can(CAPABILITY.SEND_SIGNAL), "concierge still has free_discover base");
assert(!concierge.can(CAPABILITY.UNLIMITED_SIGNALS), "concierge alone is not discover paid");

assert(admin.can(CAPABILITY.ADMIN_TOOLS), "admin tools");
assert(admin.can(CAPABILITY.USE_CONCIERGE), "admin all caps");
assert(admin.can(CAPABILITY.DISCREET_PRIVACY), "admin all caps include discreet");

assert(PRODUCT_TO_EXPERIENCE.discover === "discover_membership", "discover product maps to experience");
assert(PRODUCT_TO_EXPERIENCE.discreet === "discreet_membership", "discreet product maps");
assert(EXPERIENCE_BUNDLES.discover_membership.includes(CAPABILITY.UNLIMITED_SIGNALS), "bundle content");

const cooldown = read("server/services/signalCooldown.js");
assert(
  cooldown.includes("loadMembershipEntitlements") && cooldown.includes("REDUCED_SIGNAL_COOLDOWN"),
  "signal cooldown must use entitlement capabilities"
);

const memberSocial = read("server/memberSocial.js");
assert(
  memberSocial.includes("loadMembershipEntitlements"),
  "fetchMemberEntitlements must delegate to entitlement service"
);

const cityHome = read("server/cityHome.js");
assert(
  cityHome.includes("PURCHASE_CITY_BOOST") && cityHome.includes("PURCHASE_SPOTLIGHT"),
  "city placement activation must check purchase capabilities"
);

const service = read("server/services/membershipEntitlements.js");
assert(
  service.includes("buildEntitlementSnapshot") &&
    service.includes("canFromSnapshot") &&
    service.includes("loadMembershipEntitlements"),
  "entitlement service must expose load/build/can"
);

assert(
  !read("shared/membershipCapabilities.mjs").includes('plan === "premium"'),
  "shared capabilities must not branch on plan names"
);

console.log("test-membership-entitlements: ok");
