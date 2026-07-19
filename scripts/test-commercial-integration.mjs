/**
 * Commercial integration pass — verify Phases 3B–3E chain boundaries.
 * Not a feature test: wiring + separation of concerns only.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const fortress = read("server/services/paymentFortress.js");
const commerce = read("server/services/membershipCommerce.js");
const entitlements = read("server/services/membershipEntitlements.js");
const visibility = read("server/services/memberVisibilityPolicy.js");
const ops = read("server/services/conciergeOperations.js");
const production = read("server/production.js");
const memberSocial = read("server/memberSocial.js");
const app = read("server/app.js");

const findings = [];

function note(ok, id, detail) {
  findings.push({ ok, id, detail });
  assert(ok, `${id}: ${detail}`);
}

// --- Chain: Payment → Commerce → Entitlements ---
note(
  fortress.includes("activateMembershipFromPayment") &&
    fortress.includes('experienceMode: "discover"') &&
    fortress.includes('experienceMode: "discreet"') &&
    fortress.includes('experienceMode: "concierge"'),
  "chain.payment_to_commerce",
  "Fortress activates Discover / Discreet / Concierge via commerce only"
);

note(
  !fortress.includes("activateAppUserPremium(") && !fortress.includes("activateDiscreetMembership("),
  "chain.no_payment_effect_bypass",
  "Payment never calls effect helpers directly"
);

note(
  commerce.includes("loadMembershipEntitlements") &&
    commerce.includes("MEMBERSHIP_GRANTED") &&
    commerce.includes("PAYMENT_COMPLETED"),
  "chain.commerce_to_entitlements",
  "Commerce records events and refreshes entitlements"
);

note(
  commerce.includes("activateDiscreetMembership") && commerce.includes("PRIVACY_MODE"),
  "chain.commerce_effects_visibility_state",
  "Commerce writes privacy effects; listings still go through visibility policy"
);

note(
  visibility.includes("passiveListingVisibilitySql") && visibility.includes("isDiscreetPrivacyActive"),
  "chain.visibility_policy",
  "Visibility policy owns listing / intentional-contact rules"
);

note(
  entitlements.includes("resolveCapabilitySet") || entitlements.includes("loadMembershipEntitlements"),
  "chain.entitlements_capabilities",
  "Entitlements expose capability snapshots"
);

// --- Operations boundaries ---
note(
  !ops.includes("activateMembershipFromPayment") &&
    !ops.includes("membershipCommerce") &&
    !ops.includes("loadMembershipEntitlements") &&
    ops.includes("grantsMembership: false"),
  "chain.ops_no_membership",
  "Operations never grants memberships; invoices declare grantsMembership:false"
);

note(
  app.includes("/api/concierge-operations"),
  "chain.ops_mounted",
  "Concierge operations admin route mounted"
);

// --- Expiry / non-payment grants ---
note(
  production.includes("processExpiredMemberships"),
  "chain.expiry_sweep",
  "Startup runs membership expiry sweep (commerce events)"
);

note(
  memberSocial.includes("grantMembershipManual") && memberSocial.includes("referral_reward"),
  "chain.referral_via_commerce",
  "Referral premium rewards go through commerce, not raw premium_until updates"
);

// --- Journey / matching isolation ---
note(
  !ops.includes("IntroductionEngine") && !commerce.includes("IntroductionEngine"),
  "regression.matching_untouched",
  "Commerce/ops do not own matching"
);

note(
  !fortress.includes("conciergeOperations") && !commerce.includes("conciergeOperations"),
  "regression.ops_not_in_payment",
  "Payment/commerce do not depend on Concierge operations"
);

// --- Migrations present ---
for (const mig of [
  "migrations/0050_experience_membership_billing.sql",
  "migrations/0051_discreet_visibility_policy.sql",
  "migrations/0052_membership_commerce_events.sql",
  "migrations/0053_concierge_operations.sql"
]) {
  note(read(mig).length > 100, `migration.${mig.split("/").pop()}`, "present");
}

console.log("commercial-integration: PASS");
console.log(
  JSON.stringify(
    {
      chain: [
        "Checkout",
        "Payment Fortress",
        "Commerce Engine",
        "Membership Events",
        "Entitlements",
        "Visibility Policy",
        "Concierge Operations"
      ],
      checks: findings.map((f) => f.id),
      scenariosCoveredByPhaseTests: [
        "premium_discover_purchase",
        "discreet_purchase",
        "discreet_expiration_lazy+sweep",
        "discover_renewal",
        "duplicate_callback",
        "refund",
        "admin_grant",
        "admin_revoke",
        "concierge_eligibility",
        "concierge_application",
        "consultant_assignment",
        "invoice",
        "invoice_payment",
        "case_completion"
      ]
    },
    null,
    2
  )
);
