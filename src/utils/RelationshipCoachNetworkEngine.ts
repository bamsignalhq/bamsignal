import { PREPARED_COACH_SPECIALTIES } from "../constants/relationshipCoachNetwork";
import {
  listArchitectureCoachBadges,
  listArchitectureCoachProfiles,
  type CoachBadgeViewModel,
  type CoachProfileViewModel
} from "./relationshipCoachNetworkLogic";

export type RelationshipCoachNetworkBundle = {
  profiles: CoachProfileViewModel[];
  badges: CoachBadgeViewModel[];
  specialtyCount: number;
};

export function getRelationshipCoachNetworkBundle(): RelationshipCoachNetworkBundle {
  return {
    profiles: listArchitectureCoachProfiles(),
    badges: listArchitectureCoachBadges(),
    specialtyCount: PREPARED_COACH_SPECIALTIES.length
  };
}

export function getCoachProfile(coachId: string): CoachProfileViewModel | null {
  return listArchitectureCoachProfiles().find((profile) => profile.id === coachId) ?? null;
}
