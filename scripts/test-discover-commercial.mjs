/**
 * Pass 1 — Discover commercial experience (wiring + contract tests).
 * Does not hit live Paystack. Validates catalog, fortress routing, and non-bypass rules.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONVERSATION_UNLOCK_AMOUNT_KOBO,
  CONVERSATION_UNLOCK_PRICE_NGN,
  DISCOVER_PRODUCT,
  DISCOVER_PRODUCT_EVENT,
  PROFILE_BOOST_DURATION_HOURS,
  PROFILE_BOOST_PRICE_NGN,
  isConversationUnlockProductId
} from "../shared/discoverCommerceHelpers.mjs";
import {
  FREE_TIER_LIMITS
} from "../shared/membershipCapabilities.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

// --- Product constants ---
assert(CONVERSATION_UNLOCK_PRICE_NGN === 500, "conversation unlock ₦500");
assert(CONVERSATION_UNLOCK_AMOUNT_KOBO === 50000, "conversation unlock kobo");
assert(PROFILE_BOOST_PRICE_NGN === 999, "profile boost ₦999");
assert(PROFILE_BOOST_DURATION_HOURS === 24, "profile boost 24h");
assert(isConversationUnlockProductId(DISCOVER_PRODUCT.CONVERSATION_UNLOCK), "unlock product id");
assert(DISCOVER_PRODUCT_EVENT.CONVERSATION_UNLOCKED === "CONVERSATION_UNLOCKED", "unlock event");

// --- Free limits ---
assert(FREE_TIER_LIMITS.signalsPerDay === 5, "free tier 5 signals/day");

const signalLimitsClient = read("src/constants/limits.ts");
assert(signalLimitsClient.includes("FREE_DAILY_SWIPES = 5"), "client free daily signals = 5");

const signalLimits = read("src/utils/signalLimits.ts");
assert(signalLimits.includes("FREE_DAILY_SWIPES"), "signalLimits uses FREE_DAILY_SWIPES");

// --- Catalog pricing ---
const catalog = read("server/services/paymentCatalog.js");
assert(catalog.includes("PROFILE_BOOST_PRICE_NGN"), "catalog imports profile boost price");
assert(catalog.includes("resolveConversationUnlockProduct"), "catalog resolves conversation unlock");
assert(catalog.includes("CONVERSATION_UNLOCK_PRODUCT_TYPE"), "catalog unlock product type");
assert(catalog.includes('id: "profile-boost"'), "catalog has profile-boost");

const clientBoosts = read("src/constants/boosts.ts");
assert(clientBoosts.includes("PROFILE_BOOST_PRICE_NGN"), "client boosts use shared price");
assert(clientBoosts.includes("PROFILE_BOOST_DURATION_HOURS"), "client boosts use shared duration");

const activeBoosts = read("src/utils/activeBoosts.ts");
assert(
  activeBoosts.includes('"profile-boost": 24 * 60 * 60 * 1000'),
  "client profile-boost duration is 24h"
);

// --- Premium plans ---
const plans = read("src/constants/plans.ts");
assert(plans.includes("price: 999") && plans.includes("price: 2999"), "weekly 999 / monthly 2999");

// --- Fortress owns fulfillment; no premium mutation for unlock ---
const fortress = read("server/services/paymentFortress.js");
assert(
  fortress.includes("activateConversationUnlockFromPayment") &&
    fortress.includes("initialize-conversation-unlock"),
  "fortress wires conversation unlock"
);
assert(
  fortress.includes("activateMembershipFromPayment") &&
    fortress.includes('experienceMode: "discover"'),
  "premium still activates via membership commerce"
);

const unlockService = read("server/services/conversationUnlock.js");
assert(
  !unlockService.includes("premium_until") && unlockService.includes("grantsPremium: false"),
  "unlock never grants premium / never touches premium_until"
);
assert(unlockService.includes("persistMatch"), "unlock opens conversation via match");
assert(unlockService.includes("DISCOVER_PRODUCT_EVENT.CONVERSATION_UNLOCKED"), "unlock emits event");

// --- Migration ---
const migration = read("migrations/0054_discover_conversation_unlock.sql");
assert(
  migration.includes("app_conversation_unlocks") &&
    migration.includes("app_conversation_unlocks_buyer_target_uidx") &&
    migration.includes("discover_product_events"),
  "migration 0054 defines unlocks + events"
);

// --- Verify API ---
const verify = read("api/paystack/verify.js");
assert(
  verify.includes("initialize-conversation-unlock") &&
    verify.includes("isConversationUnlockProductType"),
  "verify API supports unlock checkout"
);

// --- Client payment + UI ---
const payments = read("src/services/payments.ts");
assert(
  payments.includes("startConversationUnlockPayment") &&
    payments.includes("verifyConversationUnlockPayment"),
  "client payment helpers for unlock"
);

const premiumCenter = read("src/pages/PremiumCenterPage.tsx");
assert(
  premiumCenter.includes("Boost status") &&
    premiumCenter.includes("Unlocked conversations") &&
    premiumCenter.includes("Current plan"),
  "account surface shows plan, boost, unlocks"
);

const unlockSheet = read("src/components/discover/ConversationUnlockSheet.tsx");
assert(
  /permanen/i.test(unlockSheet) &&
    (unlockSheet.includes("Does not grant") || unlockSheet.includes("does not grant")),
  "unlock sheet permanence + no membership grant"
);

const profileSheet = read("src/components/ProfileDetailSheet.tsx");
assert(profileSheet.includes("onUnlockConversation"), "profile detail unlock CTA");

// --- Admin ---
const adminApi = read("api/admin/discover-commerce.js");
assert(adminApi.includes("listAllConversationUnlocksAdmin"), "admin lists unlocks");
const adminCard = read("src/components/admin/launchCommand/LaunchCommandDiscoverCommerceCard.tsx");
assert(adminCard.includes("Discover commerce"), "admin launch card present");

// --- Schema gate ---
const schema = read("server/services/schemaVerification.js");
assert(schema.includes("app_conversation_unlocks"), "schema requires unlock table");

// --- Regression: membership commerce not bypassed for premium ---
assert(
  !fortress.includes("activateAppUserPremium("),
  "regression: fortress must not call activateAppUserPremium"
);

console.log("test-discover-commercial: ok");
