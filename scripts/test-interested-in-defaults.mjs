#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  applyGenderInterestedInDefault,
  applyInterestedInManualChange,
  defaultLookingForFromGender,
  resolveLookingFor
} from "../shared/interestedInDefaults.mjs";

assert.equal(defaultLookingForFromGender("Woman"), "Men");
assert.equal(defaultLookingForFromGender("Man"), "Women");
assert.equal(defaultLookingForFromGender("Non-binary"), undefined);
assert.equal(defaultLookingForFromGender(""), undefined);

assert.equal(
  resolveLookingFor({ gender: "Woman", onboardingComplete: false }),
  "Men",
  "A: Woman onboarding defaults to Men"
);

assert.equal(
  resolveLookingFor({ gender: "Man", onboardingComplete: false }),
  "Women",
  "B: Man onboarding defaults to Women"
);

assert.equal(
  resolveLookingFor({ gender: "Non-binary", onboardingComplete: false }),
  undefined,
  "C: Non-binary has no default"
);

assert.equal(
  resolveLookingFor({
    gender: "Woman",
    raw: "Women",
    interestedInManuallyChanged: true,
    onboardingComplete: false
  }),
  "Women",
  "D: manual Women selection is preserved"
);

assert.equal(
  applyInterestedInManualChange({ lookingFor: "Women" }, "Women").interestedInManuallyChanged,
  true
);

let draft = { gender: "Woman", lookingFor: undefined, interestedInManuallyChanged: false };
draft = applyGenderInterestedInDefault(draft, "Woman");
assert.equal(draft.lookingFor, "Men");
draft = applyGenderInterestedInDefault(draft, "Man");
assert.equal(draft.lookingFor, "Women", "F: gender change updates default before manual pick");

draft = applyInterestedInManualChange(draft, "Women");
draft = applyGenderInterestedInDefault(draft, "Woman");
assert.equal(draft.lookingFor, "Women", "manual pick survives gender change");

assert.equal(
  resolveLookingFor({
    gender: "Woman",
    raw: "Women",
    onboardingComplete: true
  }),
  "Women",
  "G: completed users keep stored preference"
);

assert.equal(
  resolveLookingFor({
    gender: "Woman",
    raw: "Women",
    onboardingComplete: false,
    interestedInManuallyChanged: false
  }),
  "Men",
  "stale onboarding default is corrected when not manual"
);

console.log("✓ Interested-in onboarding defaults");
