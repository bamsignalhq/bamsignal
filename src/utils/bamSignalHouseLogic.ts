import type {
  PreparedFoundingHouseDefinition,
  PreparedFoundingHouseId,
  PreparedHouseExperienceDefinition,
  PreparedHouseExperienceId,
  PreparedHousePrincipleDefinition,
  PreparedHousePrincipleId,
  PreparedHouseTimelineDefinition,
  PreparedHouseTimelineId
} from "../constants/bamSignalHouse";
import {
  HOUSE_EXPERIENCE_LABEL,
  HOUSE_LOCATION_LABEL,
  HOUSE_PRINCIPLE_LABEL,
  HOUSE_TIMELINE_LABEL,
  PREPARED_FOUNDING_HOUSES,
  PREPARED_HOUSE_EXPERIENCES,
  PREPARED_HOUSE_PRINCIPLES,
  PREPARED_HOUSE_TIMELINES
} from "../constants/bamSignalHouse";

export type HouseLocationViewModel = {
  id: PreparedFoundingHouseId;
  title: string;
  description: string;
  locationLabel: string;
  statusLabel: string;
};

export type HouseExperienceViewModel = {
  id: PreparedHouseExperienceId;
  title: string;
  description: string;
  experienceLabel: string;
  statusLabel: string;
};

export type HouseTimelineViewModel = {
  id: PreparedHouseTimelineId;
  title: string;
  summary: string;
  houseTitle: string;
  timelineLabel: string;
  entries: PreparedHouseTimelineDefinition["entries"];
  statusLabel: string;
};

export type HousePrincipleViewModel = {
  id: PreparedHousePrincipleId;
  title: string;
  description: string;
  principleLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildHouseLocationViewModel(house: PreparedFoundingHouseDefinition): HouseLocationViewModel {
  return {
    id: house.id,
    title: house.title,
    description: house.description,
    locationLabel: HOUSE_LOCATION_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildHouseExperienceViewModel(
  experience: PreparedHouseExperienceDefinition
): HouseExperienceViewModel {
  return {
    id: experience.id,
    title: experience.title,
    description: experience.description,
    experienceLabel: HOUSE_EXPERIENCE_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildHouseTimelineViewModel(
  timeline: PreparedHouseTimelineDefinition
): HouseTimelineViewModel {
  const house = PREPARED_FOUNDING_HOUSES.find((item) => item.id === timeline.houseId);
  return {
    id: timeline.id,
    title: timeline.title,
    summary: timeline.summary,
    houseTitle: house?.title ?? timeline.houseId,
    timelineLabel: HOUSE_TIMELINE_LABEL,
    entries: timeline.entries,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildHousePrincipleViewModel(
  principle: PreparedHousePrincipleDefinition
): HousePrincipleViewModel {
  return {
    id: principle.id,
    title: principle.title,
    description: principle.description,
    principleLabel: HOUSE_PRINCIPLE_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureHouseLocations(): HouseLocationViewModel[] {
  return [...PREPARED_FOUNDING_HOUSES.map(buildHouseLocationViewModel)];
}

export function listArchitectureHouseExperiences(): HouseExperienceViewModel[] {
  return [...PREPARED_HOUSE_EXPERIENCES.map(buildHouseExperienceViewModel)];
}

export function listArchitectureHouseTimelines(): HouseTimelineViewModel[] {
  return [...PREPARED_HOUSE_TIMELINES.map(buildHouseTimelineViewModel)];
}

export function listArchitectureHousePrinciples(): HousePrincipleViewModel[] {
  return [...PREPARED_HOUSE_PRINCIPLES.map(buildHousePrincipleViewModel)];
}
