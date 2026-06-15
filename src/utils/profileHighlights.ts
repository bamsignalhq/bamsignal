import { intentDisplay } from "../constants/intents";
import type { DatingProfile } from "../types";

/** Positive highlights shown on own profile — what others notice first */
export function getOwnProfileHighlights(profile: DatingProfile): string[] {
  const reasons: string[] = [];

  if (profile.verified) reasons.push("Verified profile");
  if (profile.voiceIntroUrl) reasons.push("Voice intro available");
  if ((profile.interests?.length ?? 0) >= 3) {
    reasons.push(`${profile.interests!.length} interests listed`);
  } else if ((profile.interests?.length ?? 0) >= 1) {
    reasons.push("Interests on display");
  }
  if (profile.intents.length) {
    const label = intentDisplay(profile.intents[0]);
    reasons.push(profile.intents.length > 1 ? "Clear about what you're looking for" : `Open to ${label.toLowerCase()}`);
  }
  if (profile.bio.trim().length >= 24) reasons.push("Thoughtful bio");
  if (profile.city?.trim()) reasons.push(`Based in ${profile.city}`);
  if (profile.photos.length >= 2) reasons.push("Multiple photos");

  return reasons.slice(0, 4);
}
