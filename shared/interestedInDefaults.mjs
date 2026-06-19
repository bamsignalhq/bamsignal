/** @typedef {"Man" | "Woman" | "Non-binary"} Gender */
/** @typedef {"Men" | "Women"} LookingFor */

/**
 * @param {Gender | "" | undefined} gender
 * @returns {LookingFor | undefined}
 */
export function defaultLookingForFromGender(gender) {
  if (!gender) return undefined;
  if (gender === "Man") return "Women";
  if (gender === "Woman") return "Men";
  return undefined;
}

/**
 * @param {{
 *   raw?: LookingFor | string;
 *   gender?: Gender | "";
 *   interestedInManuallyChanged?: boolean;
 *   onboardingComplete?: boolean;
 *   fallback?: LookingFor;
 * }} options
 * @returns {LookingFor | undefined}
 */
export function resolveLookingFor({
  raw,
  gender,
  interestedInManuallyChanged = false,
  onboardingComplete = false,
  fallback = "Women"
}) {
  const stored = raw && String(raw) !== "Everyone" ? raw : undefined;

  if (onboardingComplete) {
    if (stored) return stored;
    return defaultLookingForFromGender(gender) ?? fallback;
  }

  if (interestedInManuallyChanged) {
    return stored;
  }

  if (gender) {
    return defaultLookingForFromGender(gender);
  }

  return stored;
}

/**
 * @template T
 * @param {T} profile
 * @param {Gender} nextGender
 */
export function applyGenderInterestedInDefault(profile, nextGender) {
  if (profile.interestedInManuallyChanged) {
    return { ...profile, gender: nextGender };
  }
  return {
    ...profile,
    gender: nextGender,
    lookingFor: defaultLookingForFromGender(nextGender)
  };
}

/**
 * @template T
 * @param {T} profile
 * @param {LookingFor | undefined} lookingFor
 */
export function applyInterestedInManualChange(profile, lookingFor) {
  return {
    ...profile,
    lookingFor,
    interestedInManuallyChanged: true
  };
}
