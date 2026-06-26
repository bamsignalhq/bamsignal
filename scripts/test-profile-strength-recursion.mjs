#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const profileStrengthSource = readFileSync(
  join(rootPath, "src/utils/profileStrength.ts"),
  "utf8"
);
const verificationSource = readFileSync(join(rootPath, "src/utils/verification.ts"), "utf8");

assert(
  !/import\s*\{\s*getVerificationTier\s*\}/.test(profileStrengthSource),
  "profileStrength must not import getVerificationTier (calculateProfileStrength recursion)"
);
assert(
  profileStrengthSource.includes("trustedMember"),
  "trustedMember factor remains in profile strength scoring"
);
assert(
  verificationSource.includes("calculateProfileStrength"),
  "verification tier still uses profile strength for full verification"
);
assert(
  verificationSource.includes("skipTrustedMember"),
  "getVerificationTier must skip trustedMember factor to break calculateProfileStrength recursion"
);

console.log("profile strength recursion guard ok");
