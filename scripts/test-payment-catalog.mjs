#!/usr/bin/env node
import {
  DEFAULT_BOOST_CATALOG,
  FAST_CONNECTION_DAILY_SIGNALS,
  boostExpiresAtFromIntent,
  fastConnectionUntilFromIntent,
  premiumUntilFromIntent,
  readPurchaseIntentFromFulfillment,
  resolveBoostProduct,
  resolveFastConnectionProduct,
  resolvePremiumPlan,
  verifyExpectedAmount
} from "../server/services/paymentCatalog.js";

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const monthly = await resolvePremiumPlan("monthly");
assert(monthly?.amountKobo === 399900, "monthly premium amount comes from server catalog");
assert(monthly?.days === 30, "monthly premium duration comes from server catalog");

const tamperedPremium = await resolvePremiumPlan("monthly");
const tamperedAmountCheck = verifyExpectedAmount(100, tamperedPremium);
assert(!tamperedAmountCheck.ok, "rejects tampered premium payment amount");
assert(tamperedAmountCheck.reason === "amount_mismatch", "tampered premium amount reports mismatch");

const signalBoost = resolveBoostProduct("signal-boost");
assert(signalBoost?.amountKobo === 35000, "signal boost price is server authoritative");
assert(signalBoost?.durationHours === 24, "signal boost duration is server authoritative");

const tamperedBoostCheck = verifyExpectedAmount(100, signalBoost);
assert(!tamperedBoostCheck.ok, "rejects tampered boost payment amount");

const fastConnection = await resolveFastConnectionProduct("weekly");
assert(fastConnection?.amountKobo === 99900, "fast connection price is server authoritative");
assert(fastConnection?.days === 7, "fast connection duration is server authoritative");
assert(
  fastConnection?.dailyFastSignals === FAST_CONNECTION_DAILY_SIGNALS,
  "fast connection daily signals come from server catalog"
);

const tamperedDaysIntent = {
  ...fastConnection,
  days: 365
};
const passUntil = fastConnectionUntilFromIntent(tamperedDaysIntent);
const passDays = Math.round((new Date(passUntil).getTime() - Date.now()) / 86400000);
assert(passDays > 360, "entitlement helper uses intent days when provided internally");
assert(
  !verifyExpectedAmount(100, fastConnection).ok,
  "rejects tampered fast connection payment amount"
);

const storedIntent = readPurchaseIntentFromFulfillment({
  raw_payload: {
    purchaseIntent: {
      productType: "boost",
      productId: "profile-boost",
      amountKobo: 75000,
      durationHours: 48
    }
  }
});
assert(storedIntent?.durationHours === 48, "purchase intent stores server boost duration");
const boostUntil = boostExpiresAtFromIntent(storedIntent);
assert(boostUntil, "boost expiry derives from stored intent duration");

const premiumUntil = premiumUntilFromIntent(monthly);
assert(premiumUntil, "premium expiry derives from catalog days only");

assert(DEFAULT_BOOST_CATALOG.length >= 5, "boost catalog includes all boost products");

if (failed) process.exit(1);
console.log("payment catalog tests ok");
