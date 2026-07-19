import type { DatingProfile, UserProfile } from "../types";
import type { PublicVerificationStatus } from "../lib/verification/types";

/**
 * Messaging trust gate.
 * Default (F&F): SMS + selfie submit unlock.
 * When FACE_MATCH_REQUIRED_FOR_MESSAGING is on (national mode), require national session unlock.
 */
export function isMessagingUnlocked(
  user: Pick<UserProfile, "phoneVerified"> | null | undefined,
  profile: Pick<DatingProfile, "verificationSelfie" | "verificationStatus" | "verified"> | null | undefined,
  options: {
    smsRequired?: boolean;
    selfieRequired?: boolean;
    nationalStatus?: Pick<PublicVerificationStatus, "messagingUnlocked" | "status"> | null;
    nationalFaceMatchRequired?: boolean;
  } = {}
): boolean {
  const smsRequired = options.smsRequired !== false;
  const selfieRequired = options.selfieRequired !== false;
  const nationalRequired =
    options.nationalFaceMatchRequired === true ||
    String(import.meta.env.VITE_FACE_MATCH_REQUIRED_FOR_MESSAGING || "false").toLowerCase() === "true";

  if (smsRequired && !user?.phoneVerified) return false;

  if (nationalRequired) {
    return Boolean(options.nationalStatus?.messagingUnlocked);
  }

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
