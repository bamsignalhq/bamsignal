import {
  ASSIGNMENT_CONFIDENCE_LABELS,
  ASSIGNMENT_RULE_LABELS,
  ASSIGNMENT_RULE_TARGET_ROLE,
  WORKLOAD_HEALTH_LABELS
} from "../constants/consultantAssignment";
import { CONCIERGE_CONSULTANT_ROLE_LABELS } from "../constants/conciergeConsultantRoles";
import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../constants/signalConcierge";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  AssignmentDecision,
  AssignmentMemberType,
  AssignmentReason,
  AssignmentSummary,
  ConsultantAssignmentRule,
  ConsultantRecommendation
} from "../types/consultantAssignment";
import { assignMemberToConsultant, listConciergeConsultants } from "./conciergeConsultantDirectoryStore";
import { listConciergeMembers } from "./conciergeConsultantStore";
import { getMemberStewardName } from "./conciergeMemberStewardship";
import {
  listRecommendationsForMember,
  recommendConsultantForMember as pickRecommendation
} from "./consultantRecommendationEngine";
import {
  buildWorkloadProfile,
  listConsultantWorkloadProfiles
} from "./consultantWorkloadEngine";

export {
  buildWorkloadProfile,
  deriveCapacityLevel,
  deriveWorkloadHealth,
  listConsultantWorkloadProfiles,
  memberMatchesConsultantRegion,
  specializationLabels
} from "./consultantWorkloadEngine";

export {
  buildAssignmentRecommendation,
  buildMatchFactors,
  listRecommendationsForMember,
  rankConsultantRecommendations,
  recommendationLevelLabel,
  scoreConsultantForMember
} from "./consultantRecommendationEngine";

const COMPATIBILITY_REVIEW_STATUSES = new Set<ConciergeMemberRecord["status"]>([
  "applied",
  "under-review",
  "consultation-scheduled",
  "waitlisted"
]);

function isLegacyMember(member: ConciergeMemberRecord): boolean {
  return (
    member.preferredTier === "legacy" ||
    member.status === "legacy-archive" ||
    Boolean(member.journeyArchive?.isLegacyArchive) ||
    member.journeyArchive?.relationshipStatus === "legacy-archive"
  );
}

function isGlobalMember(member: ConciergeMemberRecord): boolean {
  return (
    member.preferredTier === "global" ||
    member.flags.includes("diaspora") ||
    member.flags.includes("relocation")
  );
}

function isFamilyJourney(member: ConciergeMemberRecord): boolean {
  return (
    member.flags.includes("family-involvement") ||
    Boolean(member.relationshipGoals.familyGoals?.toLowerCase().includes("family"))
  );
}

function isCompatibilityReview(member: ConciergeMemberRecord): boolean {
  return COMPATIBILITY_REVIEW_STATUSES.has(member.status);
}

export function classifyAssignmentMemberType(member: ConciergeMemberRecord): AssignmentMemberType {
  if (isLegacyMember(member)) return "legacy";
  if (isGlobalMember(member)) return "global";
  if (isCompatibilityReview(member)) return "compatibility-review";
  if (isFamilyJourney(member)) return "family-journey";
  return "standard";
}

export function resolveAssignmentRule(member: ConciergeMemberRecord): ConsultantAssignmentRule {
  const memberType = classifyAssignmentMemberType(member);
  switch (memberType) {
    case "legacy":
      return "legacy-member";
    case "global":
      return "global-member";
    case "compatibility-review":
      return "compatibility-review";
    case "family-journey":
      return "family-journey";
    default:
      return "default-stewardship";
  }
}

export function buildAssignmentReason(member: ConciergeMemberRecord): AssignmentReason {
  const rule = resolveAssignmentRule(member);
  const roleLabel = CONCIERGE_CONSULTANT_ROLE_LABELS[ASSIGNMENT_RULE_TARGET_ROLE[rule]];

  const details: Record<ConsultantAssignmentRule, string> = {
    "legacy-member": `${member.aboutYou.name} is on a Legacy™ journey — recommend a Senior Matchmaker steward.`,
    "global-member": `${member.aboutYou.city} and tier signals diaspora or global goals — recommend a Diaspora Consultant.`,
    "compatibility-review": `Journey stage is ${SIGNAL_CONCIERGE_STATUS_LABELS[member.status]} — route to a Compatibility Specialist for review.`,
    "family-journey": `Family alignment is central to this journey — recommend a Family Values Advisor.`,
    "default-stewardship": `Standard stewardship — recommend a Relationship Consultant under BamSignal ownership.`
  };

  return {
    code: rule,
    label: ASSIGNMENT_RULE_LABELS[rule],
    detail: `${details[rule]} Target role: ${roleLabel}.`
  };
}

export function recommendConsultantForMember(
  member: ConciergeMemberRecord
): ConsultantRecommendation | null {
  const reason = buildAssignmentReason(member);
  return pickRecommendation(member, reason);
}

export function buildAssignmentSummary(member: ConciergeMemberRecord): AssignmentSummary | null {
  const recommendation = recommendConsultantForMember(member);
  if (!recommendation) return null;

  const currentStewardId = member.currentConsultantId ?? member.assignedConsultantId;
  const currentStewardName = getMemberStewardName(member) ?? undefined;
  const currentWorkload = currentStewardId
    ? listConciergeConsultants()
        .filter((consultant) => consultant.id === currentStewardId)
        .map((consultant) => buildWorkloadProfile(consultant))[0]
    : undefined;

  return {
    memberId: member.id,
    journeyId: member.journeyId,
    memberName: member.aboutYou.name,
    memberType: classifyAssignmentMemberType(member),
    journeyStage: member.status,
    city: member.aboutYou.city,
    tier: member.preferredTier ?? "pending",
    currentStewardId,
    currentStewardName,
    recommendedConsultantId: recommendation.consultantId,
    recommendedConsultantName: recommendation.consultantName,
    confidence: recommendation.confidence,
    level: recommendation.level,
    reason: recommendation.reason,
    workloadHealth: recommendation.workload.health,
    matchFactors: recommendation.matchFactors,
    narrative: `${ASSIGNMENT_CONFIDENCE_LABELS[recommendation.confidence]} — ${recommendation.narrative}${
      currentWorkload ? ` Current steward workload: ${WORKLOAD_HEALTH_LABELS[currentWorkload.health]}.` : ""
    }`
  };
}

export function buildMemberAssignmentBundle(member: ConciergeMemberRecord): {
  recommendation: ConsultantRecommendation | null;
  recommendations: ConsultantRecommendation[];
  summary: AssignmentSummary | null;
  currentStewardWorkload: ReturnType<typeof buildWorkloadProfile> | null;
} {
  const reason = buildAssignmentReason(member);
  const recommendation = pickRecommendation(member, reason);
  const recommendations = listRecommendationsForMember(member, reason);
  const summary = buildAssignmentSummary(member);
  const stewardId = member.currentConsultantId ?? member.assignedConsultantId;
  const steward = stewardId
    ? listConciergeConsultants().find((consultant) => consultant.id === stewardId)
    : null;

  return {
    recommendation,
    recommendations,
    summary,
    currentStewardWorkload: steward ? buildWorkloadProfile(steward) : null
  };
}

export function listUnassignedMembersForAssignment(): ConciergeMemberRecord[] {
  return listConciergeMembers().filter(
    (member) => !member.currentConsultantId && !member.assignedConsultantId
  );
}

export function prepareAssignmentDecision(member: ConciergeMemberRecord): AssignmentDecision | null {
  const recommendation = recommendConsultantForMember(member);
  if (!recommendation) return null;

  return {
    memberId: member.id,
    memberName: member.aboutYou.name,
    journeyId: member.journeyId,
    consultantId: recommendation.consultantId,
    consultantName: recommendation.consultantName,
    level: recommendation.level,
    requiresAdminConfirm: true,
    narrative: recommendation.narrative,
    recommendation
  };
}

/**
 * Admin-confirmed assignment only — never call without explicit operator confirmation.
 */
export function confirmAssignmentDecision(
  decision: AssignmentDecision,
  actorName = "Operations Center"
): ConciergeMemberRecord | null {
  if (!decision.requiresAdminConfirm) return null;
  return assignMemberToConsultant(decision.memberId, decision.consultantId, {
    id: "admin_ops",
    name: actorName,
    role: "admin"
  });
}

export function buildAssignmentEngineSnapshot() {
  return {
    workloads: listConsultantWorkloadProfiles(),
    unassignedCount: listUnassignedMembersForAssignment().length,
    recommendations: listUnassignedMembersForAssignment()
      .map((member) => prepareAssignmentDecision(member))
      .filter((decision): decision is AssignmentDecision => Boolean(decision))
  };
}
