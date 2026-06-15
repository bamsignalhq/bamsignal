import { intentDisplay } from "../constants/intents";
import type { DatingProfile } from "../types";

/** Positive highlights shown on own profile — how you appear to others */
export function getOwnProfileHighlights(profile: DatingProfile): string[] {
  const reasons: string[] = [];

  if (profile.verified) reasons.push("Verified profile");
  if (profile.voiceIntroUrl) reasons.push("Voice greeting added");
  if ((profile.interests?.length ?? 0) >= 1) {
    reasons.push(`${profile.interests!.length} interest${profile.interests!.length === 1 ? "" : "s"} added`);
  }
  if (profile.intents.length) {
    const label = intentDisplay(profile.intents[0]);
    reasons.push(profile.intents.length > 1 ? "Clear relationship intent" : `${label} intent`);
  }
  if (profile.bio.trim().length >= 16) reasons.push("Thoughtful bio");
  if (profile.city?.trim()) reasons.push(`Based in ${profile.city}`);
  if (profile.photos.length >= 2) reasons.push("Multiple photos");

  return reasons.slice(0, 4);
}
