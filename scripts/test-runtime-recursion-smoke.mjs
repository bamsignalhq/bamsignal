#!/usr/bin/env node
/**
 * Runtime smoke: verification tier + profile strength must not stack-overflow.
 */
import assert from "node:assert/strict";

const { getVerificationTier } = await import("../src/utils/verification.ts");
const { calculateProfileStrength } = await import("../src/utils/profileStrength.ts");
const { defaultDatingProfile } = await import("../src/utils/profile.ts");

const profile = defaultDatingProfile();
profile.verified = true;
profile.createdAt = new Date(Date.now() - 8 * 86400000).toISOString();

let tier;
let strength;
try {
  strength = calculateProfileStrength(profile, { isPremium: true, phoneVerified: true });
  tier = getVerificationTier(profile, true, true);
} catch (error) {
  console.error("runtime recursion smoke failed:", error);
  process.exit(1);
}

assert(typeof strength === "number", "calculateProfileStrength returns number");
assert(typeof tier.tier === "number", "getVerificationTier returns tier");
console.log("runtime recursion smoke ok", { strength, tier: tier.tier });
