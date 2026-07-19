/**
 * RC2 launch finishing — unlock UX, boost analytics, Concierge portal,
 * server payment history, and public Signal Pass copy cleanup.
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

// --- Conversation Unlock UX ---
const unlockHelpers = read("shared/discoverCommerceHelpers.mjs");
assert(unlockHelpers.includes("one specific"), "unlock copy mentions one specific profile");
assert(unlockHelpers.includes("permanent") || unlockHelpers.toLowerCase().includes("permanently"), "unlock permanence");

const unlockSheet = read("src/components/discover/ConversationUnlockSheet.tsx");
assert(unlockSheet.includes("₦500") || unlockSheet.includes("500"), "unlock price visible");
assert(/permanen/i.test(unlockSheet), "unlock sheet permanence");

const premiumCenter = read("src/pages/PremiumCenterPage.tsx");
assert(/Unlocked conversations/i.test(premiumCenter), "account lists unlocked conversations");
assert(premiumCenter.includes("boost") || /Boost/i.test(premiumCenter), "boost status surface");

// --- Profile Boost analytics ---
const boostPerf = read("src/utils/boostPerformance.ts");
assert(boostPerf.includes("impressions") || boostPerf.includes("profile_viewed"), "boost performance metrics");
assert(boostPerf.includes("expires") || boostPerf.includes("expiresAt") || boostPerf.includes("until"), "boost expiry");

// --- Server payment history ---
assert(read("server/services/paymentFulfillments.js").includes("listPaymentHistoryForMember"), "server list history");
assert(read("api/member/data.js").includes("payment-history"), "member API payment-history");
assert(read("src/utils/serverPaymentHistory.ts").includes("fetchServerPaymentHistory"), "client fetch");
assert(
  read("src/components/commercial/CommercialDashboardSummary.tsx").includes("fetchServerPaymentHistory"),
  "dashboard prefers server payments"
);

// --- Concierge client portal ---
const portal = read("src/components/signalConcierge/MemberJourneyDashboard.tsx");
assert(/Next step/i.test(portal), "portal next step");
assert(/private client portal/i.test(portal), "portal framing");
assert(portal.includes("opsCase?.history") || portal.includes("history"), "ops case timeline");
assert(portal.includes("SIGNAL_CONCIERGE_ROUTES.invoices"), "invoice history CTA");

const landing = read("src/constants/signalConcierge.ts");
assert(/Nigerian relationship advisory/i.test(landing) || /discretion/i.test(landing), "luxury advisory copy");
assert(/Request a private consultation/i.test(landing), "high-trust CTA");

// --- Public / member Signal Pass copy audit (user-facing) ---
const publicSurfaces = [
  "src/content/seo/premiumPages.ts",
  "src/content/seo/seoPages.ts",
  "src/content/seo/helpPages.ts",
  "src/content/seo/internalLinks.ts",
  "src/utils/premiumRenewal.ts",
  "src/pages/ProfilePage.tsx",
  "src/components/premium/SignalPassInlineChip.tsx",
  "src/components/ContactExchangeLimitModal.tsx",
  "src/utils/signalLimits.ts"
];

for (const rel of publicSurfaces) {
  const src = read(rel);
  assert(!src.includes("Signal Pass"), `${rel} must not show Signal Pass`);
}

assert(read("src/content/seo/premiumPages.ts").includes("Discover Membership"), "SEO premium renamed");
assert(read("src/utils/premiumRenewal.ts").includes("Discover Membership"), "renewal copy renamed");

console.log("commercial-launch-finishing: PASS");
