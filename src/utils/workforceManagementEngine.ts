import { WORKFORCE_ACTIVE_REGIONS } from "../constants/workforceManagement";
import type { WorkforceManagementBundle, WorkforceRecommendationInput } from "../types/workforceManagement";
import { refreshAllCapacities } from "./workforceCapacityEngine";
import { buildRegionalForecasts } from "./workforceForecastEngine";
import {
  buildCapacityHeatmap,
  buildRecommendationPreview,
  buildWorkforceOverviewMetrics
} from "./workforceManagementLogic";
import {
  listLeaveRequests,
  listRegionalAssignments,
  listStaffingForecasts,
  listWorkforceAvailability,
  listWorkforceCapacity,
  listWorkforceProfiles,
  listWorkforceTransfers
} from "./workforceManagementStore";

const DEFAULT_RECOMMENDATION_INPUT: WorkforceRecommendationInput = {
  memberCity: "Lagos",
  memberCountry: "Nigeria",
  memberLanguages: ["English"],
  memberPreference: "legacy",
  relationshipType: "legacy",
  needsDiasporaExperience: false,
  needsFamilySpecialization: false
};

export function buildWorkforceManagementBundle(
  recommendationInput: WorkforceRecommendationInput = DEFAULT_RECOMMENDATION_INPUT
): WorkforceManagementBundle {
  const profiles = listWorkforceProfiles();
  const leaves = listLeaveRequests();
  const capacity = refreshAllCapacities(profiles, listWorkforceCapacity(), leaves);
  const regionalAssignments = listRegionalAssignments();
  const forecasts =
    listStaffingForecasts().length > 0
      ? listStaffingForecasts()
      : buildRegionalForecasts(
          WORKFORCE_ACTIVE_REGIONS.map((region) => region.id),
          profiles,
          capacity
        ).map((forecast, index) => ({
          ...forecast,
          id: `forecast_generated_${index}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));

  return {
    generatedAt: new Date().toISOString(),
    overviewMetrics: buildWorkforceOverviewMetrics(profiles, capacity, leaves),
    profiles,
    capacity,
    availability: listWorkforceAvailability(),
    leaveRequests: leaves,
    regionalAssignments,
    transfers: listWorkforceTransfers(),
    recommendations: buildRecommendationPreview(
      profiles,
      capacity,
      regionalAssignments,
      recommendationInput
    ),
    forecasts,
    heatmap: buildCapacityHeatmap(profiles, capacity)
  };
}
