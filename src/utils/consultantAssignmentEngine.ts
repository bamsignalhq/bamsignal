import {
  ASSIGNMENT_CONFIDENCE_LABELS,
  ASSIGNMENT_RULE_LABELS,
  ASSIGNMENT_RULE_TARGET_ROLE,
  WORKLOAD_HEALTH_LABELS
} from "../constants/consultantAssignment";
import { CONCIERGE_CONSULTANT_ROLE_LABELS } from "../constants/conciergeConsultantRoles";
import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../constants/signalConcierge";
import type { ConciergeConsultantRecord } from "../types/conciergeConsultantDirectory";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConciergeConsultantRoleId } from "../constants/conciergeConsultantRoles";
import type {
  AssignmentConfidence,
  AssignmentMemberType,
  AssignmentReason,
  AssignmentSummary,
  ConsultantAssignmentRule,
  ConsultantRecommendation,
  WorkloadHealth,
  WorkloadProfile
} from "../types/consultantAssignment";
import {
  listConciergeConsultantMeetings,
  listConciergeConsultants
} from "./conciergeConsultantDirectoryStore";
import { listMembersForConsultant } from "./conciergeConsultantDirectoryStore";
import { getMemberStewardName } from "./conciergeMemberStewardship";

const ACTIVE_MEMBER_STATUSES = new Set<ConciergeMemberRecord["status"]>([
  "accepted",
  "active-search",
  "introductions-in-progress",
  "relationship",
  "matched",
  "exclusive",
  "engaged",
  "consultation-scheduled",
  "under-review"
]);

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

function deriveWorkloadHealth(
  consultant: ConciergeConsultantRecord,
  activeMembers: number,
  workloadScore: number
): WorkloadHealth {
  if (consultant.status !== "active") return "paused";
  if (activeMembers >= 8 || workloadScore >= 12) return "full";
  if (activeMembers >= 5 || workloadScore >= 8) return "busy";
  return "healthy";
}

function workloadSummary(health: WorkloadHealth, activeMembers: number): string {
  const label = WORKLOAD_HEALTH_LABELS[health];
  if (health === "healthy") {
    return `${label} — ${activeMembers} active member${activeMembers === 1 ? "" : "s"} in portfolio.`;
  }
  if (health === "busy") {
    return `${label} — portfolio active with ${activeMembers} members.`;
  }
  if (health === "full") {
    return `${label} — near capacity with ${activeMembers} active members.`;
  }
  return `${label} — consultant not available for new stewardship.`;
}

export function buildWorkloadProfile(consultant: ConciergeConsultantRecord): WorkloadProfile {
  const members = listMembersForConsultant(consultant.id);
  const meetings = listConciergeConsultantMeetings(consultant.id);
  const activeMembers = members.filter((member) => ACTIVE_MEMBER_STATUSES.has(member.status)).length;
  const pendingFollowUps = members
    .flatMap((member) => member.followUpTasks)
    .filter((task) => !task.completed).length;
  const upcomingMeetings = meetings.filter(
    (meeting) => new Date(meeting.scheduledAt).getTime() >= Date.now()
  ).length;
  const workloadScore = activeMembers + pendingFollowUps + upcomingMeetings;
  const health = deriveWorkloadHealth(consultant, activeMembers, workloadScore);

  return {
    consultantId: consultant.id,
    consultantName: consultant.name,
    health,
    activeMembers,
    pendingFollowUps,
    upcomingMeetings,
    summary: workloadSummary(health, activeMembers)
  };
}

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

function deriveConfidence(
  consultant: ConciergeConsultantRecord,
  member: ConciergeMemberRecord,
  targetRole: ConciergeConsultantRoleId,
  workload: WorkloadProfile
): AssignmentConfidence {
  const roleMatch = consultantMatchesRole(consultant, targetRole);
  const tierMatch = tierFocusMatch(consultant, member);

  if (!roleMatch) return "available-fit";
  if (workload.health === "full" || workload.health === "paused") return "available-fit";
  if (roleMatch && tierMatch && workload.health === "healthy") return "strong-fit";
  if (roleMatch && (tierMatch || workload.health === "healthy")) return "good-fit";
  return "good-fit";
}

function scoreConsultant(
  consultant: ConciergeConsultantRecord,
  member: ConciergeMemberRecord,
  targetRole: ConciergeConsultantRoleId
): number {
  const workload = buildWorkloadProfile(consultant);
  let score = 0;
  if (consultantMatchesRole(consultant, targetRole)) score += 40;
  if (consultant.primaryRole === targetRole) score += 20;
  if (tierFocusMatch(consultant, member)) score += 15;
  if (workload.health === "healthy") score += 20;
  else if (workload.health === "busy") score += 10;
  else if (workload.health === "full") score += 2;
  return score;
}

function pickRecommendedConsultant(
  member: ConciergeMemberRecord,
  targetRole: ConciergeConsultantRoleId
): ConciergeConsultantRecord | null {
  const consultants = listConciergeConsultants().filter((consultant) => consultant.status === "active");
  if (!consultants.length) return null;

  const ranked = [...consultants].sort(
    (a, b) => scoreConsultant(b, member, targetRole) - scoreConsultant(a, member, targetRole)
  );

  const roleMatch = ranked.find((consultant) => consultantMatchesRole(consultant, targetRole));
  return roleMatch ?? ranked[0] ?? null;
}

export function recommendConsultantForMember(
  member: ConciergeMemberRecord
): ConsultantRecommendation | null {
  const reason = buildAssignmentReason(member);
  const targetRole = ASSIGNMENT_RULE_TARGET_ROLE[reason.code];
  const consultant = pickRecommendedConsultant(member, targetRole);
  if (!consultant) return null;

  const workload = buildWorkloadProfile(consultant);
  const confidence = deriveConfidence(consultant, member, targetRole, workload);

  return {
    consultantId: consultant.id,
    consultantName: consultant.name,
    primaryRole: consultant.primaryRole,
    confidence,
    reason,
    workload
  };
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
    reason: recommendation.reason,
    workloadHealth: recommendation.workload.health,
    narrative: `${ASSIGNMENT_CONFIDENCE_LABELS[recommendation.confidence]} — ${recommendation.reason.detail}${
      currentWorkload ? ` Current steward workload: ${WORKLOAD_HEALTH_LABELS[currentWorkload.health]}.` : ""
    }`
  };
}

export function buildMemberAssignmentBundle(member: ConciergeMemberRecord): {
  recommendation: ConsultantRecommendation | null;
  summary: AssignmentSummary | null;
  currentStewardWorkload: WorkloadProfile | null;
} {
  const recommendation = recommendConsultantForMember(member);
  const summary = buildAssignmentSummary(member);
  const stewardId = member.currentConsultantId ?? member.assignedConsultantId;
  const steward = stewardId
    ? listConciergeConsultants().find((consultant) => consultant.id === stewardId)
    : null;

  return {
    recommendation,
    summary,
    currentStewardWorkload: steward ? buildWorkloadProfile(steward) : null
  };
}
