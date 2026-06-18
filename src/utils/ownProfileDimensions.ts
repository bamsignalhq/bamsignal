import { normalizeLifestyleTraits } from "../constants/profileOptions";
import type { DatingProfile } from "../types";
import { isPreferNot } from "./profile";
import { safeArray } from "./safeProfile";

function lifestyleTraitCount(profile: DatingProfile): number {
  return normalizeLifestyleTraits([
    ...safeArray<string>(profile.lifestyles),
    ...(profile.lifestyle && !isPreferNot(profile.lifestyle) ? [profile.lifestyle] : [])
  ]).length;
}

/** Display scores for own-profile compatibility section */
export function getOwnProfileDimensionScores(
  profile: DatingProfile
): { label: string; percent: number }[] {
  const lifestyleCount = lifestyleTraitCount(profile);
  const lifestylePct = lifestyleCount >= 2 ? 92 : lifestyleCount === 1 ? 78 : 55;

  const faithPct =
    profile.religion && !isPreferNot(profile.religion) ? 86 : profile.religion ? 72 : 48;

  const intentCount = profile.intents?.length ?? 0;
  const intentPct = intentCount >= 2 ? 95 : intentCount === 1 ? 88 : 52;

  return [
    { label: "Lifestyle", percent: lifestylePct },
    { label: "Faith", percent: faithPct },
    { label: "Relationship goals", percent: intentPct }
  ];
}
