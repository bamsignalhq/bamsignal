import { PREPARED_FAMILY_ADVISOR_SPECIALTIES } from "../constants/familyAdvisors";
import {
  listArchitectureAdvisorProfiles,
  type AdvisorProfileViewModel
} from "./familyAdvisorsLogic";

export type FamilyAdvisorsBundle = {
  advisors: AdvisorProfileViewModel[];
  specialtyCount: number;
};

export function getFamilyAdvisorsBundle(): FamilyAdvisorsBundle {
  return {
    advisors: listArchitectureAdvisorProfiles(),
    specialtyCount: PREPARED_FAMILY_ADVISOR_SPECIALTIES.length
  };
}

export function getFamilyAdvisorProfile(advisorId: string): AdvisorProfileViewModel | null {
  return listArchitectureAdvisorProfiles().find((advisor) => advisor.id === advisorId) ?? null;
}
