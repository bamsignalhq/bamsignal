import {
  RECOMMENDATION_LEVEL_LABELS,
  WORKLOAD_HEALTH_LABELS
} from "../constants/consultantAssignment";
import { CONCIERGE_CONSULTANT_ROLE_LABELS } from "../constants/conciergeConsultantRoles";
import { REGIONAL_CONSULTANT_TEAM_REGIONS } from "../constants/regionalConsultantTeams";
import type { ConciergeConsultantRecord } from "../types/conciergeConsultantDirectory";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { RecommendationLevel, WorkloadHealth, WorkloadProfile } from "../types/consultantAssignment";
import {
  deriveCapacityLevel,
  deriveWorkloadHealth
} from "./consultantWorkloadHealth";
import {
  computeConsultantMetrics,
  portfolioIntroductionsInProgress,
  portfolioPendingConsultations
} from "./conciergeConsultantMetrics";
import {
  listConciergeConsultantMeetings,
  listConciergeConsultants,
  listMembersForConsultant
} from "./conciergeConsultantDirectoryStore";
import { listIntroductionRecords } from "./conciergeIntroductionStore";
import {
  resolveConsultantRegionForAssignment,
  resolveMemberRegion
} from "./regionalConsultantTeamsLogic";

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

const ACTIVE_INTRO_STATUSES = new Set([
  "pending-review",
  "compatibility-review",
  "presented",
  "awaiting-response",
  "accepted",
  "active-conversation",
  "exclusive",
  "relationship",
  "engaged",
  "paused"
]);

export { deriveCapacityLevel, deriveWorkloadHealth } from "./consultantWorkloadHealth";

function regionLabel(regionId: string): string {
  return REGIONAL_CONSULTANT_TEAM_REGIONS.find((region) => region.id === regionId)?.label ?? regionId;
}

function workloadSummary(health: WorkloadHealth, activeMembers: number, workloadScore: number): string {
  const label = WORKLOAD_HEALTH_LABELS[health];
  if (health === "healthy") {
    return `${label} — ${activeMembers} active member${activeMembers === 1 ? "" : "s"} · score ${workloadScore}.`;
  }
  if (health === "busy") {
    return `${label} — active portfolio (${activeMembers} members) · score ${workloadScore}.`;
  }
  if (health === "full") {
    return `${label} — near capacity (${activeMembers} members) · score ${workloadScore}.`;
  }
  return `${label} — consultant not available for new stewardship.`;
}

export function buildWorkloadProfile(consultant: ConciergeConsultantRecord): WorkloadProfile {
  const members = listMembersForConsultant(consultant.id);
  const meetings = listConciergeConsultantMeetings(consultant.id);
  const metrics = computeConsultantMetrics(members);
  const activeMembers = members.filter((member) => ACTIVE_MEMBER_STATUSES.has(member.status)).length;
  const pendingConsultations = portfolioPendingConsultations(members).length;
  const introductionsInProgress = Math.max(
    portfolioIntroductionsInProgress(members).length,
    listIntroductionRecords().filter(
      (record) => record.consultantId === consultant.id && ACTIVE_INTRO_STATUSES.has(record.status)
    ).length
  );
  const pendingFollowUps = members
    .flatMap((member) => member.followUpTasks)
    .filter((task) => !task.completed).length;
  const upcomingMeetings = meetings.filter(
    (meeting) => new Date(meeting.scheduledAt).getTime() >= Date.now()
  ).length;
  const workloadScore =
    activeMembers + pendingConsultations + introductionsInProgress + pendingFollowUps + upcomingMeetings;
  const health = deriveWorkloadHealth(consultant, activeMembers, workloadScore);
  const capacityLevel = deriveCapacityLevel(health, workloadScore);
  const region = resolveConsultantRegionForAssignment(consultant);

  return {
    consultantId: consultant.id,
    consultantName: consultant.name,
    health,
    capacityLevel,
    activeMembers,
    pendingConsultations,
    introductionsInProgress,
    pendingFollowUps,
    upcomingMeetings,
    responseTimeHours: metrics.responseTimeHours,
    specializations: consultant.roles,
    region,
    regionLabel: regionLabel(region),
    workloadScore,
    summary: workloadSummary(health, activeMembers, workloadScore)
  };
}

export function listConsultantWorkloadProfiles(): WorkloadProfile[] {
  return listConciergeConsultants().map((consultant) => buildWorkloadProfile(consultant));
}

export function memberMatchesConsultantRegion(
  member: ConciergeMemberRecord,
  consultant: ConciergeConsultantRecord
): boolean {
  return resolveMemberRegion(member) === resolveConsultantRegionForAssignment(consultant);
}

export function specializationLabels(roles: ConciergeConsultantRecord["roles"]): string {
  return roles.map((role) => CONCIERGE_CONSULTANT_ROLE_LABELS[role]).join(" · ");
}

export function formatCapacitySummary(workload: WorkloadProfile): string {
  return `${RECOMMENDATION_LEVEL_LABELS[workload.capacityLevel]} — ${workload.summary}`;
}
