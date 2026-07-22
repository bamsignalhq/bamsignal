/**
 * Product profile separation — Passport owns identity; products own activity data.
 */

import type { DatingProfile, UserProfile } from "../types";
import type { PassportId, PassportProductId } from "./types";

/** BamSignal member product profile (Discover, chats, signals). */
export type BamSignalMemberProfile = {
  passportId: PassportId;
  user: UserProfile;
  dating: DatingProfile;
};

/** Signal Concierge client product profile. */
export type BamSignalConciergeProfile = {
  passportId: PassportId;
  applicationStatus?: string;
  consultantAssigned?: boolean;
};

export type BamSignalProductProfiles = {
  member?: BamSignalMemberProfile;
  concierge?: BamSignalConciergeProfile;
};

/** Marker type for future product profile bindings — products are Trust Contributors. */
export type EcosystemProductProfileBinding = {
  passportId: PassportId;
  productId: PassportProductId;
  profileKind: "member" | "concierge" | "vendor" | "admin";
};

export function createMemberProductProfile(
  passportId: PassportId,
  user: UserProfile,
  dating: DatingProfile
): BamSignalMemberProfile {
  return { passportId, user, dating };
}

export function createConciergeProductProfile(
  passportId: PassportId,
  extras?: Omit<BamSignalConciergeProfile, "passportId">
): BamSignalConciergeProfile {
  return { passportId, ...extras };
}
