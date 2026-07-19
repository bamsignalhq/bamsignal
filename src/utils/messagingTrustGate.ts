import type { DatingProfile, UserProfile } from "../types";

/**
 * Messaging trust gate: SMS phone verify + selfie submit unlock (admin review can continue async).
 * Browse/like/match remain available without this.
 */
export function isMessagingUnlocked(
  user: Pick<UserProfile, "phoneVerified"> | null | undefined,
  profile: Pick<DatingProfile, "verificationSelfie" | "verificationStatus" | "verified"> | null | undefined,
  options: { smsRequired?: boolean; selfieRequired?: boolean } = {}
): boolean {
  const smsRequired = options.smsRequired !== false;
  const selfieRequired = options.selfieRequired !== false;

  if (smsRequired && !user?.phoneVerified) return false;

  if (selfieRequired) {
    const selfieSubmitted =
      Boolean(profile?.verificationSelfie) ||
      profile?.verificationStatus === "pending" ||
      profile?.verificationStatus === "approved" ||
      Boolean(profile?.verified);
    if (!selfieSubmitted) return false;
  }

  return true;
}
