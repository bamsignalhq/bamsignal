import type {
  ConsultantCapacityRecord,
  StaffingForecastRecord,
  WorkforceProfileRecord
} from "../types/workforceManagement";
import type { WorkforceRegionId } from "../constants/workforceManagement";

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function buildStaffingForecast(
  regionId: WorkforceRegionId,
  profiles: WorkforceProfileRecord[],
  capacities: ConsultantCapacityRecord[],
  period = "next-quarter"
): Omit<StaffingForecastRecord, "id" | "createdAt" | "updatedAt"> {
  const regionalProfiles = profiles.filter((profile) => profile.regionId === regionId);
  const capacityByProfile = Object.fromEntries(capacities.map((item) => [item.profileId, item]));
  const activeConsultants = regionalProfiles.filter((profile) => profile.employmentStatus === "active");

  const projectedConsultationDemand = Math.max(
    20,
    activeConsultants.reduce((sum, profile) => {
      const capacity = capacityByProfile[profile.id];
      return sum + asNumber(capacity?.consultationsThisWeek, 4) * 4;
    }, 0)
  );

  const availableCapacity = activeConsultants.reduce((sum, profile) => {
    const capacity = capacityByProfile[profile.id];
    const remaining = Math.max(0, profile.maxActiveJourneys - asNumber(capacity?.activeJourneys, 0));
    return sum + remaining;
  }, 0);

  const consultantShortage = Math.max(
    0,
    Math.ceil(projectedConsultationDemand / 12) - activeConsultants.length
  );
  const estimatedHiringNeeds = consultantShortage + (consultantShortage > 0 ? 1 : 0);
  const staffingPressureScore = Math.min(
    100,
    Math.round((projectedConsultationDemand / Math.max(1, availableCapacity)) * 35)
  );

  return {
    regionId,
    forecastPeriod: period,
    projectedConsultationDemand,
    consultantShortage,
    estimatedHiringNeeds,
    staffingPressureScore,
    assumptions: {
      avgJourneysPerConsultant: 12,
      activeConsultants: activeConsultants.length,
      availableCapacity
    }
  };
}

export function buildRegionalForecasts(
  regionIds: WorkforceRegionId[],
  profiles: WorkforceProfileRecord[],
  capacities: ConsultantCapacityRecord[],
  period = "next-quarter"
): Array<Omit<StaffingForecastRecord, "id" | "createdAt" | "updatedAt">> {
  return regionIds.map((regionId) => buildStaffingForecast(regionId, profiles, capacities, period));
}
