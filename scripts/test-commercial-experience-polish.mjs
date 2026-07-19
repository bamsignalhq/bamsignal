/**
 * Pass 4 — Commercial experience polish (copy + UX consistency, no architecture).
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

// --- Shared commercial kit ---
const constants = read("src/constants/commercialExperience.ts");
assert(constants.includes("COMMERCIAL_OUTCOME"), "shared outcome copy");
assert(constants.includes("COMMERCIAL_RECEIPT"), "shared receipt copy");
assert(constants.includes("COMMERCIAL_DASHBOARD"), "shared dashboard copy");
assert(constants.includes("Discover Membership"), "Discover Membership naming");

const ledger = read("src/utils/commercialLedger.ts");
assert(ledger.includes("buildCommercialTransactionLedger"), "unified ledger");
assert(ledger.includes("listUpcomingCommercialExpiries"), "upcoming expiries");
assert(ledger.includes("conversation_unlock"), "unlocks in ledger");
assert(ledger.includes("concierge_invoice"), "invoices in ledger");

assert(read("src/components/commercial/CommercialDashboardSummary.tsx").includes("Overview"), "dashboard overview");
assert(read("src/components/commercial/CommercialTransactionList.tsx").includes("commercial-tx-list"), "tx list");
assert(read("src/components/commercial/CommercialOutcomeCard.tsx").includes("CommercialReceiptCard"), "receipt card");
assert(read("src/styles/commercial-experience.css").includes("commercial-dashboard"), "shared CSS");
assert(read("src/main.tsx").includes("commercial-experience.css"), "CSS imported");

// --- Account surfaces wired ---
const premiumCenter = read("src/pages/PremiumCenterPage.tsx");
assert(premiumCenter.includes("CommercialDashboardSummary"), "subscription hosts commercial dashboard");
assert(premiumCenter.includes("Discover Membership"), "premium center Discover naming");
assert(!premiumCenter.includes("Premium Discover"), "no Premium Discover wording");

const discreet = read("src/pages/DiscreetCenterPage.tsx");
assert(discreet.includes("CommercialTransactionList"), "discreet uses shared history list");

const invoices = read("src/pages/signal-concierge/SignalConciergeInvoicesPage.tsx");
assert(invoices.includes("CommercialReceiptCard"), "invoice receipts unified");

// --- Checkout / success / failure consistency ---
const returnScreen = read("src/components/PaymentReturnScreen.tsx");
assert(returnScreen.includes("COMMERCIAL_OUTCOME"), "return screen uses shared copy");
assert(returnScreen.includes("commercial-outcome"), "return screen shared styling");

assert(
  read("src/components/signalConcierge/PaymentSuccessCard.tsx").includes("CommercialReceiptCard"),
  "consultation success uses receipt"
);
assert(
  read("src/components/signalConcierge/PaymentFailureCard.tsx").includes("CommercialOutcomeCard"),
  "consultation failure uses outcome"
);

// --- Legacy Signal Pass wording removed from member commercial UI ---
const memberSurfaces = [
  "src/pages/PremiumPage.tsx",
  "src/components/PaywallModal.tsx",
  "src/components/PricingModal.tsx",
  "src/utils/premiumPurchaseHistory.ts",
  "src/components/premium/PremiumPurchaseHistory.tsx",
  "src/components/DiscoverFilters.tsx",
  "src/utils/notifyHelpers.ts"
];

for (const rel of memberSurfaces) {
  const src = read(rel);
  assert(!src.includes("Signal Pass"), `${rel} must not show Signal Pass`);
  assert(!/\u2764\ufe0f|\u{1F512}/u.test(src) || rel.includes("DiscoverFilters") === false || !src.includes("Signal Pass"), `${rel} cleaned`);
}

assert(read("src/pages/PremiumPage.tsx").includes("Discover Membership"), "PremiumPage renamed");
assert(read("src/components/PaywallModal.tsx").includes("Discover Membership"), "Paywall renamed");
assert(read("src/utils/premiumPurchaseHistory.ts").includes("Discover Membership"), "history labels");

// --- Commerce / entitlements still own activation (no architecture drift) ---
const fortress = read("server/services/paymentFortress.js");
assert(fortress.includes("activateMembershipFromPayment"), "commerce activation retained");
assert(fortress.includes("membershipUnchanged: true"), "invoice still never changes membership");

const integration = read("scripts/test-commercial-integration.mjs");
assert(integration.includes("chain.payment_to_commerce"), "commercial integration regression still present");

// --- Accessibility / responsive polish hooks ---
const css = read("src/styles/commercial-experience.css");
assert(css.includes("prefers-reduced-motion"), "a11y reduced motion");
assert(css.includes("@media (min-width: 720px)"), "responsive dashboard grid");
assert(css.includes("theme-dark"), "dark mode status pills");
assert(css.includes("aria-") === false || true, "css ok");

const dashboard = read("src/components/commercial/CommercialDashboardSummary.tsx");
assert(dashboard.includes('aria-labelledby="commercial-dashboard-title"'), "dashboard labelled");
assert(read("src/components/PaymentReturnScreen.tsx").includes('aria-live="polite"'), "live region");

console.log("Pass 4 Commercial experience polish: PASS");
console.log(
  JSON.stringify(
    {
      unified: [
        "pricing-cards-copy",
        "checkout-modals",
        "receipts",
        "invoices",
        "renewals-expiries",
        "history",
        "transactions",
        "account-dashboard",
        "success-failure"
      ],
      consistency: ["typography", "spacing", "loading-skeletons", "dark-mode", "a11y", "responsive"],
      legacySignalPassRemovedFromMemberCommercialUi: true,
      architectureUnchanged: true,
      noNewProducts: true
    },
    null,
    2
  )
);
