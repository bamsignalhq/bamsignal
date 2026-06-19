import { profileIntentLabel } from "../constants/intents";
import type { DatingProfile, IntentTag } from "../types";
import { safeArray } from "./safeProfile";

export function getAboutSnippet(profile: DatingProfile): string | null {
  const promptAnswer = profile.profilePrompts?.find((entry) => entry.answer.trim())?.answer.trim();
  if (promptAnswer) return promptAnswer;

  const bio = profile.bio?.trim();
  if (!bio) return null;

  const firstLine = bio.split(/[.!?\n]/)[0]?.trim();
  if (!firstLine) return null;
  if (firstLine.length <= 72) return firstLine;
  return `${firstLine.slice(0, 72).trim()}…`;
}

export function getAboutMeText(profile: DatingProfile): string | null {
  const bio = profile.bio?.trim();
  if (!bio || bio.length < 12) return null;
  return bio;
}

/** Single About block for profile overview — bio preferred over prompt snippet. */
export function getProfileAboutDisplay(
  profile: DatingProfile
): { text: string; editSection: "bio" | "prompts" } | null {
  const bio = profile.bio?.trim();
  if (bio) return { text: bio, editSection: "bio" };

  const promptAnswer = profile.profilePrompts?.find((entry) => entry.answer.trim())?.answer?.trim();
  if (promptAnswer) return { text: promptAnswer, editSection: "prompts" };

  return null;
}

export function shouldShowAboutCard(profile: DatingProfile): boolean {
  return getProfileAboutDisplay(profile) !== null;
}

export function getOwnWhyReasons(profile: DatingProfile): string[] {
  const reasons: string[] = [];

  if (profile.verified) reasons.push("Verified account");
  if ((profile.interests?.length ?? 0) >= 1) reasons.push("Similar interests");

  const intents = safeArray<IntentTag>(profile.intents);
  if (intents.includes("Relationship")) {
    reasons.push("Serious relationship");
  } else if (intents.length) {
    reasons.push(profileIntentLabel(intents[0]));
  }

  return reasons.slice(0, 3);
}
