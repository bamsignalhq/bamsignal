import {
  ASSIGNMENT_CONFIDENCE_LABELS,
  ASSIGNMENT_CONFIDENCE_TO_LEVEL,
  ASSIGNMENT_MATCH_FACTOR_LABELS,
  ASSIGNMENT_RULE_TARGET_ROLE,
  RECOMMENDATION_LEVEL_LABELS
} from "../constants/consultantAssignment";
import { CONCIERGE_CONSULTANT_ROLE_LABELS } from "../constants/conciergeConsultantRoles";
import type { ConciergeConsultantRoleId } from "../constants/conciergeConsultantRoles";
import type { ConciergeConsultantRecord } from "../types/conciergeConsultantDirectory";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  AssignmentConfidence,
  AssignmentMatchFactor,
  AssignmentRecommendation,
  RecommendationLevel
} from "../types/consultantAssignment";
import type { AssignmentReason } from "../types/consultantAssignment";
import {
  buildWorkloadProfile,
  memberMatchesConsultantRegion
} from "./consultantWorkloadEngine";
import { listConciergeConsultants } from "./conciergeConsultantDirectoryStore";

function consultantMatchesRole(
  consultant: ConciergeConsultantRecord,
  role: ConciergeConsultantRoleId
): boolean {
  return consultant.primaryRole === role || consultant.roles.includes(role);
}

function tierFocusMatch(consultant: ConciergeConsultantRecord, member: ConciergeMemberRecord): boolean {
  if (!member.preferredTier) return false;
  return consultant.tierFocus.includes(member.preferredTier);
}

function relationshipGoalsMatch(
  consultant: ConciergeConsultantRecord,
  member: ConciergeMemberRecord
): boolean {
  const goals = member.relationshipGoals;
  if (!goals) return false;
  if (consultant.primaryRole === "family-values-advisor") {
    return Boolean(goals.familyGoals?.trim() || goals.marriageTimeline?.trim());
  }
  if (consultant.primaryRole === "diaspora-consultant") {
    return member.flags.includes("diaspora") || member.flags.includes("relocation");
  }
  if (consultant.primaryRole === "compatibility-specialist") {
    return Boolean(goals.dealBreakers?.trim() || goals.marriageTimeline?.trim());
  }
  return Boolean(goals.marriageTimeline?.trim() || goals.childrenPreference?.trim());
}

function lowWorkloadFactor(workload: ReturnType<typeof buildWorkloadProfile>): boolean {
  return workload.health === "healthy" && workload.workloadScore <= 6;
}

export function buildMatchFactors(
  consultant: ConciergeConsultantRecord,
  member: ConciergeMemberRecord,
  targetRole: ConciergeConsultantRoleId
): AssignmentMatchFactor[] {
  const workload = buildWorkloadProfile(consultant);
  const factors: AssignmentMatchFactor[] = [];
  if (lowWorkloadFactor(workload)) factors.push("low-workload");
  if (consultantMatchesRole(consultant, targetRole)) factors.push("matching-specialization");
  if (memberMatchesConsultantRegion(member, consultant)) factors.push("matching-location");
  if (tierFocusMatch(consultant, member)) factors.push("matching-tier");
  if (relationshipGoalsMatch(consultant, member)) factors.push("matching-relationship-goals");
  return factors;
}

function deriveConfidence(
  consultant: ConciergeConsultantRecord,
  member: ConciergeMemberRecord,
  targetRole: ConciergeConsultantRoleId,
  matchFactors: AssignmentMatchFactor[]
): AssignmentConfidence {
  const workload = buildWorkloadProfile(consultant);
  const roleMatch = consultantMatchesRole(consultant, targetRole);
  const tierMatch = tierFocusMatch(consultant, member);
  const regionMatch = memberMatchesConsultantRegion(member, consultant);

  if (!roleMatch || workload.health === "paused") return "available-fit";
  if (workload.health === "full") return "available-fit";
  if (roleMatch && tierMatch && regionMatch && matchFactors.length >= 4 && workload.health === "healthy") {
    return "strong-fit";
  }
  if (roleMatch && (tierMatch || regionMatch) && workload.health !== "busy") return "good-fit";
  return "available-fit";
}

function deriveRecommendationLevel(
  confidence: AssignmentConfidence,
  workload: ReturnType<typeof buildWorkloadProfile>
): RecommendationLevel {
  if (workload.health === "paused") return "unavailable";
  if (workload.health === "full") return "limited-capacity";
  if (workload.health === "busy" && confidence === "available-fit") return "limited-capacity";
  return ASSIGNMENT_CONFIDENCE_TO_LEVEL[confidence];
}

export function scoreConsultantForMember(
  consultant: ConciergeConsultantRecord,
  member: ConciergeMemberRecord,
  targetRole: ConciergeConsultantRoleId,
  reason: AssignmentReason
): number {
  const workload = buildWorkloadProfile(consultant);
  const matchFactors = buildMatchFactors(consultant, member, targetRole);
  let score = 0;
  if (consultantMatchesRole(consultant, targetRole)) score += 35;
  if (consultant.primaryRole === targetRole) score += 20;
  if (tierFocusMatch(consultant, member)) score += 15;
  if (memberMatchesConsultantRegion(member, consultant)) score += 15;
  if (relationshipGoalsMatch(consultant, member)) score += 10;
  score += matchFactors.length * 4;
  if (workload.health === "healthy") score += 18;
  else if (workload.health === "busy") score += 8;
  else if (workload.health === "full") score += 1;
  if (workload.responseTimeHours !== null && workload.responseTimeHours <= 24) score += 5;
  void reason;
  return score;
}

function buildRecommendationNarrative(
  consultant: ConciergeConsultantRecord,
  member: ConciergeMemberRecord,
  level: RecommendationLevel,
  matchFactors: AssignmentMatchFactor[],
  reason: AssignmentReason
): string {
  const factorText =
    matchFactors.length > 0
      ? matchFactors.map((factor) => ASSIGNMENT_MATCH_FACTOR_LABELS[factor]).join(", ")
      : "General stewardship availability";
  return `${RECOMMENDATION_LEVEL_LABELS[level]} — ${consultant.name} (${CONCIERGE_CONSULTANT_ROLE_LABELS[consultant.primaryRole]}) for ${member.aboutYou.name}. ${reason.label}. Factors: ${factorText}.`;
}

export function buildAssignmentRecommendation(
  consultant: ConciergeConsultantRecord,
  member: ConciergeMemberRecord,
  reason: AssignmentReason
): AssignmentRecommendation {
  const targetRole = ASSIGNMENT_RULE_TARGET_ROLE[reason.code];
  const workload = buildWorkloadProfile(consultant);
  const matchFactors = buildMatchFactors(consultant, member, targetRole);
  const confidence = deriveConfidence(consultant, member, targetRole, matchFactors);
  const level = deriveRecommendationLevel(confidence, workload);
  const score = scoreConsultantForMember(consultant, member, targetRole, reason);

  return {
    consultantId: consultant.id,
    consultantName: consultant.name,
    primaryRole: consultant.primaryRole,
    confidence,
    level,
    matchFactors,
    reason,
    workload,
    score,
    narrative: buildRecommendationNarrative(consultant, member, level, matchFactors, reason)
  };
}

export function rankConsultantRecommendations(
  member: ConciergeMemberRecord,
  reason: AssignmentReason
): AssignmentRecommendation[] {
  const targetRole = ASSIGNMENT_RULE_TARGET_ROLE[reason.code];
  const consultants = listConciergeConsultants().filter((consultant) => consultant.status === "active");

  return consultants
    .map((consultant) => buildAssignmentRecommendation(consultant, member, reason))
    .filter((recommendation) => recommendation.level !== "unavailable")
    .sort((a, b) => b.score - a.score || a.workload.workloadScore - b.workload.workloadScore)
    .filter((recommendation, index, list) => {
      if (index === 0) return true;
      const roleMatch = consultantMatchesRole(
        consultants.find((item) => item.id === recommendation.consultantId)!,
        targetRole
      );
      return roleMatch || recommendation.score >= (list[0]?.score ?? 0) - 10;
    });
}

export function recommendConsultantForMember(
  member: ConciergeMemberRecord,
  reason: AssignmentReason
): AssignmentRecommendation | null {
  const ranked = rankConsultantRecommendations(member, reason);
  const top = ranked[0];
  if (!top) return null;
  return top;
}

export function listRecommendationsForMember(member: ConciergeMemberRecord, reason: AssignmentReason) {
  return rankConsultantRecommendations(member, reason).slice(0, 5);
}

export function recommendationLevelLabel(level: RecommendationLevel): string {
  return RECOMMENDATION_LEVEL_LABELS[level];
}

export function confidenceLabel(confidence: AssignmentConfidence): string {
  return ASSIGNMENT_CONFIDENCE_LABELS[confidence];
}
