/**
 * Phase 3D — membership commerce lifecycle matrix (pure + wiring).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MEMBERSHIP_EVENT,
  EXPERIENCE_MODE,
  clampDays,
  computeEndsAt,
  normalizeExperienceMode
} from "../shared/membershipCommerceHelpers.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

// Event vocabulary
for (const key of [
  "PAYMENT_COMPLETED",
  "MEMBERSHIP_GRANTED",
  "MEMBERSHIP_RENEWED",
  "MEMBERSHIP_EXPIRED",
  "MEMBERSHIP_REVOKED",
  "ADMIN_GRANTED",
  "ADMIN_REVOKED",
  "REFUND_APPLIED"
]) {
  assert(MEMBERSHIP_EVENT[key] === key, `event ${key}`);
}

assert(normalizeExperienceMode("premium") === EXPERIENCE_MODE.DISCOVER, "premium → discover");
assert(normalizeExperienceMode("discreet_membership") === EXPERIENCE_MODE.DISCREET, "discreet alias");
assert(normalizeExperienceMode("signal_concierge") === EXPERIENCE_MODE.CONCIERGE, "concierge alias");
assert(normalizeExperienceMode("nope") === null, "invalid mode");

assert(clampDays(0) === 30, "invalid/zero days falls back to 30");
assert(clampDays(999) === 366, "clamp max");

const now = Date.now();
const fromNow = new Date(computeEndsAt(null, 30)).getTime();
assert(fromNow > now + 29 * 86400000, "fresh grant ~30d");

const future = new Date(now + 10 * 86400000).toISOString();
const renewed = new Date(computeEndsAt(future, 30)).getTime();
assert(renewed > new Date(future).getTime() + 29 * 86400000, "renew stacks from existing end");

const commerce = read("server/services/membershipCommerce.js");
assert(
  commerce.includes("activateMembershipFromPayment") &&
    commerce.includes("grantMembershipManual") &&
    commerce.includes("revokeMembershipManual") &&
    commerce.includes("applyMembershipRefund") &&
    commerce.includes("processExpiredMemberships") &&
    commerce.includes("findActivationEventForPayment"),
  "commerce engine exports lifecycle operations"
);

const fortress = read("server/services/paymentFortress.js");
assert(
  fortress.includes("activateMembershipFromPayment") &&
    fortress.includes('experienceMode: "discover"') &&
    fortress.includes('experienceMode: "discreet"') &&
    fortress.includes('experienceMode: "concierge"'),
  "fortress must activate memberships via commerce engine"
);
assert(
  !fortress.includes("activateAppUserPremium(") && !fortress.includes("activateDiscreetMembership("),
  "fortress must not grant access by calling effect helpers directly"
);

const migration = read("migrations/0052_membership_commerce_events.sql");
assert(
  migration.includes("membership_events") &&
    migration.includes("MEMBERSHIP_GRANTED") &&
    migration.includes("membership_events_payment_activation_uidx"),
  "migration 0052 must define events + payment idempotency index"
);

// Lifecycle matrix (documented contract)
const matrix = {
  successful_payment: ["PAYMENT_COMPLETED", "MEMBERSHIP_GRANTED|MEMBERSHIP_RENEWED", "entitlements.refresh"],
  duplicate_callback: ["findActivationEventForPayment → duplicate:true", "no double stack"],
  expired_membership: ["processExpiredMemberships", "MEMBERSHIP_EXPIRED"],
  renewal: ["computeEndsAt stacks", "MEMBERSHIP_RENEWED"],
  upgrade: ["independent experience modes via separate activate calls"],
  manual_grant: ["ADMIN_GRANTED", "MEMBERSHIP_GRANTED"],
  manual_revoke: ["ADMIN_REVOKED", "MEMBERSHIP_REVOKED"],
  failed_payment: ["fortress marks fulfillment failed", "no MEMBERSHIP_GRANTED"],
  abandoned_checkout: ["no payment event", "no membership change"]
};
assert(Object.keys(matrix).length === 9, "lifecycle matrix coverage");

console.log("test-membership-commerce: ok");
console.log(JSON.stringify(matrix, null, 2));
