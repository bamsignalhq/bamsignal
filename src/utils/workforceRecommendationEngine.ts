import type { WorkforceMatchFactorId } from "../constants/workforceManagement";
import type {
  ConsultantCapacityRecord,
  RegionalAssignmentRecord,
  WorkforceProfileRecord,
  WorkforceRecommendation,
  WorkforceRecommendationInput
} from "../types/workforceManagement";
import { buildCapacityMetrics } from "./workforceCapacityEngine";

function languageMatch(profileLanguages: string[], memberLanguages: string[] = []): boolean {
  if (!memberLanguages.length) return false;
  const normalized = profileLanguages.map((item) => item.toLowerCase());
  return memberLanguages.some((lang) => normalized.includes(lang.toLowerCase()));
}

function regionMatch(
  profileId: string,
  regionalAssignments: RegionalAssignmentRecord[],
  memberCountry?: string
): boolean {
  if (!memberCountry) return false;
  const country = memberCountry.toLowerCase();
  return regionalAssignments.some(
    (assignment) =>
      assignment.profileId === profileId &&
      assignment.coverageCountries.some((item) => item.toLowerCase() === country)
  );
}

function cityMatch(
  profileId: string,
  regionalAssignments: RegionalAssignmentRecord[],
  memberCity?: string
): boolean {
  if (!memberCity) return false;
  const city = memberCity.toLowerCase();
  return regionalAssignments.some(
    (assignment) =>
      assignment.profileId === profileId &&
      assignment.coverageCities.some((item) => item.toLowerCase() === city)
  );
}

export function scoreWorkforceRecommendation(
  profile: WorkforceProfileRecord,
  capacity: ConsultantCapacityRecord,
  regionalAssignments: RegionalAssignmentRecord[],
  input: WorkforceRecommendationInput = {}
): WorkforceRecommendation {
  const factors: WorkforceMatchFactorId[] = [];
  let score = 0;

  if (capacity.capacityState === "available" || capacity.capacityState === "busy") {
    factors.push("availability");
    score += 20;
  }

  if (profile.specialization.length) {
    factors.push("specialization");
    score += 15;
  }

  if (cityMatch(profile.id, regionalAssignments, input.memberCity)) {
    factors.push("city");
    score += 12;
  }

  if (regionMatch(profile.id, regionalAssignments, input.memberCountry)) {
    factors.push("country");
    score += 12;
  }

  if (languageMatch(profile.languages, input.memberLanguages)) {
    factors.push("language");
    score += 10;
  }

  if (capacity.activeJourneys < profile.maxActiveJourneys * 0.75) {
    factors.push("current-workload");
    score += 10;
  }

  if (input.memberPreference && profile.specialization.includes(input.memberPreference)) {
    factors.push("member-preference");
    score += 8;
  }

  if (input.relationshipType && profile.specialization.includes(input.relationshipType)) {
    factors.push("relationship-type");
    score += 8;
  }

  if (input.needsDiasporaExperience && profile.roleId === "diaspora-consultant") {
    factors.push("diaspora-experience");
    score += 12;
  }

  if (input.needsFamilySpecialization && profile.roleId === "family-values-advisor") {
    factors.push("family-specialization");
    score += 12;
  }

  if (capacity.capacityState === "near-capacity") score -= 8;
  if (capacity.capacityState === "at-capacity" || capacity.capacityState === "overloaded") {
    score -= 25;
  }
  if (profile.employmentStatus !== "active") score -= 40;

  const finalScore = Math.max(0, Math.min(100, score));

  return {
    profileId: profile.id,
    displayName: profile.displayName,
    roleId: profile.roleId,
    score: finalScore,
    capacityState: capacity.capacityState,
    matchFactors: factors,
    narrative: `Score ${finalScore} — recommendation only. Admin makes the final assignment decision.`
  };
}

export function rankWorkforceRecommendations(
  profiles: WorkforceProfileRecord[],
  capacities: ConsultantCapacityRecord[],
  regionalAssignments: RegionalAssignmentRecord[],
  input: WorkforceRecommendationInput = {}
): WorkforceRecommendation[] {
  const capacityByProfile = Object.fromEntries(capacities.map((item) => [item.profileId, item]));

  return profiles
    .map((profile) =>
      scoreWorkforceRecommendation(
        profile,
        capacityByProfile[profile.id] ?? buildCapacityMetrics(profile),
        regionalAssignments,
        input
      )
    )
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);
}
