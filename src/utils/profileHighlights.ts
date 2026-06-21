import { intentDisplay } from "../constants/intents";
import { formatMoreAboutMeChip } from "../constants/moreAboutMe";
import { relationshipIntentsFrom } from "../constants/relationshipIntent";
import type { DatingProfile } from "../types";
import { normalizeMoreAboutMeInterests } from "./moreAboutMe";
import { safeArray, safeString } from "./safeProfile";

/** Positive highlights shown on own profile — how you appear to others */
export function getOwnProfileHighlights(profile: DatingProfile): string[] {
  const reasons: string[] = [];

  if (profile.verified) reasons.push("Verified profile");
  if (profile.voiceIntroUrl) reasons.push("Voice Vibe added");
  const moreAboutMe = normalizeMoreAboutMeInterests(profile.interests);
  if (moreAboutMe.length >= 1) {
    reasons.push(
      moreAboutMe.length > 1
        ? "More About Me added"
        : `${formatMoreAboutMeChip(moreAboutMe[0])} on your profile`
    );
  }
  const intents = relationshipIntentsFrom(profile.intents);
  if (intents.length) {
    const label = intentDisplay(intents[0]);
    reasons.push(intents.length > 1 ? "Clear on what brings you here" : label);
  }
  if (safeString(profile.bio).trim().length >= 16) reasons.push("Thoughtful bio");
  if (profile.city?.trim()) reasons.push(`Based in ${profile.city}`);
  if (safeArray(profile.photos).length >= 2) reasons.push("Multiple photos");

  return reasons.slice(0, 4);
}
