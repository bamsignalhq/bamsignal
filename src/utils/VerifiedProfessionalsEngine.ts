import { PREPARED_VERIFIED_BADGES } from "../constants/verifiedProfessionals";
import {
  listArchitectureProfessionalBadges,
  listArchitectureProfessionalProfiles,
  type ProfessionalBadgeViewModel,
  type ProfessionalProfileViewModel
} from "./verifiedProfessionalsLogic";

export type VerifiedProfessionalsBundle = {
  profiles: ProfessionalProfileViewModel[];
  badges: ProfessionalBadgeViewModel[];
  badgeCount: number;
};

export function getVerifiedProfessionalsBundle(): VerifiedProfessionalsBundle {
  return {
    profiles: listArchitectureProfessionalProfiles(),
    badges: listArchitectureProfessionalBadges(),
    badgeCount: PREPARED_VERIFIED_BADGES.length
  };
}

export function getVerifiedProfessionalProfile(
  professionalId: string
): ProfessionalProfileViewModel | null {
  return (
    listArchitectureProfessionalProfiles().find((profile) => profile.id === professionalId) ?? null
  );
}
