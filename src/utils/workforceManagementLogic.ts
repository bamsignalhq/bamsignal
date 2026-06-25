import type {
  ConsultantCapacityRecord,
  LeaveRequestRecord,
  WorkforceCapacityHeatmapCell,
  WorkforceOverviewMetric,
  WorkforceProfileRecord,
  WorkforceRecommendation,
  WorkforceRecommendationInput
} from "../types/workforceManagement";
import { WORKFORCE_CAPACITY_STATE_LABELS } from "../constants/workforceManagement";
import { buildCapacityMetrics } from "./workforceCapacityEngine";
import { rankWorkforceRecommendations } from "./workforceRecommendationEngine";
import type { RegionalAssignmentRecord } from "../types/workforceManagement";

export function buildWorkforceOverviewMetrics(
  profiles: WorkforceProfileRecord[],
  capacities: ConsultantCapacityRecord[],
  leaveRequests: LeaveRequestRecord[]
): WorkforceOverviewMetric[] {
  const activeProfiles = profiles.filter((profile) => profile.employmentStatus === "active");
  const overloaded = capacities.filter((item) => item.capacityState === "overloaded").length;
  const onLeave = leaveRequests.filter((item) => item.status === "approved").length;

  return [
    {
      id: "active-staff",
      label: "Active staff",
      value: String(activeProfiles.length),
      hint: `${profiles.length} total profiles`
    },
    {
      id: "available-consultants",
      label: "Available consultants",
      value: String(
        capacities.filter(
          (item) => item.capacityState === "available" || item.capacityState === "busy"
        ).length
      )
    },
    {
      id: "overloaded",
      label: "Overloaded",
      value: String(overloaded),
      hint: overloaded ? "Review handoffs" : "Within tolerance"
    },
    {
      id: "on-leave",
      label: "On leave",
      value: String(onLeave)
    },
    {
      id: "avg-satisfaction",
      label: "Avg satisfaction",
      value: (
        capacities.reduce((sum, item) => sum + (item.memberSatisfaction ?? 0), 0) /
        Math.max(1, capacities.filter((item) => item.memberSatisfaction).length)
      ).toFixed(1)
    }
  ];
}

export function buildCapacityHeatmap(
  profiles: WorkforceProfileRecord[],
  capacities: ConsultantCapacityRecord[]
): WorkforceCapacityHeatmapCell[] {
  const capacityByProfile = Object.fromEntries(capacities.map((item) => [item.profileId, item]));

  return profiles.map((profile) => {
    const capacity = capacityByProfile[profile.id] ?? buildCapacityMetrics(profile);
    return {
      profileId: profile.id,
      displayName: profile.displayName,
      regionId: profile.regionId,
      capacityState: capacity.capacityState,
      activeJourneys: capacity.activeJourneys,
      maxActiveJourneys: profile.maxActiveJourneys
    };
  });
}

export function capacityStateLabel(state: ConsultantCapacityRecord["capacityState"]): string {
  return WORKFORCE_CAPACITY_STATE_LABELS[state];
}

export function buildRecommendationPreview(
  profiles: WorkforceProfileRecord[],
  capacities: ConsultantCapacityRecord[],
  regionalAssignments: RegionalAssignmentRecord[],
  input: WorkforceRecommendationInput
): WorkforceRecommendation[] {
  return rankWorkforceRecommendations(profiles, capacities, regionalAssignments, input).slice(0, 5);
}
