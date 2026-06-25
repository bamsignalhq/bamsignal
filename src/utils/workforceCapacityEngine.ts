import type {
  ConsultantCapacityRecord,
  LeaveRequestRecord,
  WorkforceProfileRecord
} from "../types/workforceManagement";
import type { WorkforceCapacityStateId } from "../constants/workforceManagement";

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isActiveLeave(leave: LeaveRequestRecord, at = new Date()): boolean {
  if (leave.status !== "approved") return false;
  const start = Date.parse(leave.startsAt);
  const end = Date.parse(leave.endsAt);
  const now = at.getTime();
  return now >= start && now <= end;
}

export function computeLeaveCapacityReduction(leaves: LeaveRequestRecord[], at = new Date()): number {
  const active = leaves.filter((leave) => isActiveLeave(leave, at));
  if (!active.length) return 0;
  return Math.min(
    1,
    active.reduce((sum, leave) => sum + asNumber(leave.capacityReduction, 1), 0)
  );
}

export function deriveCapacityState(input: {
  activeJourneys?: number;
  maxActiveJourneys?: number;
  followUpsPending?: number;
  introductionsPending?: number;
  consultationsToday?: number;
  availabilityScore?: number;
  employmentStatus?: WorkforceProfileRecord["employmentStatus"];
}): WorkforceCapacityStateId {
  const activeJourneys = asNumber(input.activeJourneys);
  const maxActiveJourneys = asNumber(input.maxActiveJourneys, 12);
  const followUpsPending = asNumber(input.followUpsPending);
  const introductionsPending = asNumber(input.introductionsPending);
  const consultationsToday = asNumber(input.consultationsToday);
  const availabilityScore = asNumber(input.availabilityScore, 1);
  const employmentStatus = input.employmentStatus ?? "active";

  if (employmentStatus === "inactive") {
    return "at-capacity";
  }

  if (employmentStatus === "on-leave" || availabilityScore <= 0.1) {
    return "at-capacity";
  }

  const workloadScore =
    activeJourneys + followUpsPending + introductionsPending + consultationsToday;
  const utilization = maxActiveJourneys > 0 ? activeJourneys / maxActiveJourneys : 0;

  if (utilization >= 1.1 || workloadScore >= maxActiveJourneys + 6) return "overloaded";
  if (utilization >= 1 || workloadScore >= maxActiveJourneys + 3) return "at-capacity";
  if (utilization >= 0.85 || workloadScore >= maxActiveJourneys) return "near-capacity";
  if (utilization >= 0.6 || workloadScore >= Math.ceil(maxActiveJourneys * 0.5)) return "busy";
  return "available";
}

export function buildCapacityMetrics(
  profile: WorkforceProfileRecord,
  workload: Partial<ConsultantCapacityRecord> = {},
  leaves: LeaveRequestRecord[] = [],
  at = new Date()
): ConsultantCapacityRecord {
  const activeJourneys = asNumber(workload.activeJourneys, profile.currentWorkload);
  const leaveReduction = computeLeaveCapacityReduction(
    leaves.filter((leave) => leave.profileId === profile.id),
    at
  );
  const availabilityScore = Math.max(0, 1 - leaveReduction);
  let capacityState = deriveCapacityState({
    activeJourneys,
    maxActiveJourneys: profile.maxActiveJourneys,
    followUpsPending: workload.followUpsPending,
    introductionsPending: workload.introductionsPending,
    consultationsToday: workload.consultationsToday,
    availabilityScore,
    employmentStatus: profile.employmentStatus
  });

  if (leaveReduction >= 1 || profile.employmentStatus === "on-leave") {
    capacityState = "at-capacity";
  }

  return {
    id: workload.id ?? `capacity_${profile.id}`,
    profileId: profile.id,
    consultantId: profile.consultantId,
    capacityState,
    applicationsAssigned: asNumber(workload.applicationsAssigned),
    consultationsToday: asNumber(workload.consultationsToday),
    consultationsThisWeek: asNumber(workload.consultationsThisWeek),
    activeJourneys,
    followUpsPending: asNumber(workload.followUpsPending),
    introductionsPending: asNumber(workload.introductionsPending),
    memberSatisfaction:
      workload.memberSatisfaction ?? profile.performanceSummary.satisfactionScore,
    availabilityScore,
    vacationSchedule: leaves
      .filter((leave) => leave.profileId === profile.id && isActiveLeave(leave, at))
      .map((leave) => ({
        startsAt: leave.startsAt,
        endsAt: leave.endsAt,
        label: leave.leaveType
      })),
    workHours: workload.workHours ?? {},
    computedAt: new Date().toISOString(),
    createdAt: workload.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function refreshAllCapacities(
  profiles: WorkforceProfileRecord[],
  existing: ConsultantCapacityRecord[],
  leaves: LeaveRequestRecord[]
): ConsultantCapacityRecord[] {
  const existingByProfile = Object.fromEntries(existing.map((item) => [item.profileId, item]));
  return profiles.map((profile) =>
    buildCapacityMetrics(profile, existingByProfile[profile.id], leaves)
  );
}
