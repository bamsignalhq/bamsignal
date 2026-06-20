/** Profile patch scopes — prevent unrelated fields from clobbering each other on concurrent saves. */

export const PROFILE_PATCH_SCOPES = ["full", "profile", "photos", "voice"];

export const PROFILE_PHOTO_KEYS = [
  "photos",
  "mainPhotoUrl",
  "photoMeta",
  "coverPhoto",
  "coverPhotoUrl",
  "coverPhotoPath",
  "coverPhotoUpdatedAt",
  "coverPhotoExplicit"
];

export const PROFILE_VOICE_KEYS = ["voiceIntroUrl", "voiceIntroDuration", "voiceIntroUpdatedAt"];

/** Editable profile fields — excludes photos, voice, and moderation metadata. */
export const PROFILE_EDITOR_KEYS = [
  "age",
  "dateOfBirth",
  "gender",
  "state",
  "city",
  "bio",
  "lookingFor",
  "interestedInManuallyChanged",
  "intents",
  "fastConnectionInterested",
  "interests",
  "interestsTouched",
  "religion",
  "ethnicity",
  "ethnicities",
  "stateOfOrigin",
  "statesOfOrigin",
  "occupation",
  "occupations",
  "genotype",
  "genotypes",
  "kidsPreference",
  "hasKidsOptions",
  "wantsKidsOptions",
  "lifestyle",
  "lifestyles",
  "bodyTypes",
  "visibility",
  "matchingPrivacy",
  "safetySettings",
  "verified",
  "premium",
  "verificationSelfie",
  "verificationStatus",
  "onboardingComplete",
  "setupCompleted",
  "onboardingCompletedAt",
  "profileCompletedAt",
  "completedAt",
  "createdAt",
  "profilePrompts",
  "screenshotPrivacyNoticeSeen",
  "profilePausedAt",
  "compliance",
  "reportCount",
  "name"
];

export function normalizeProfilePatchScope(raw) {
  const scope = String(raw || "full").trim();
  return PROFILE_PATCH_SCOPES.includes(scope) ? scope : "full";
}

export function pickProfilePatchFields(source = {}, keys = []) {
  const out = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      out[key] = source[key];
    }
  }
  return out;
}
