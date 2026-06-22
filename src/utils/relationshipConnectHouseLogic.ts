import type {
  PreparedConnectHouseActivityDefinition,
  PreparedConnectHouseActivityId,
  PreparedConnectHouseProgramDefinition,
  PreparedConnectHouseProgramId
} from "../constants/relationshipConnectHouse";
import {
  CONNECT_HOUSE_CONFERENCE_LABEL,
  CONNECT_HOUSE_NETWORKING_LABEL,
  CONNECT_HOUSE_WORKSHOP_LABEL,
  PREPARED_CONNECT_HOUSE_ACTIVITIES,
  PREPARED_CONNECT_HOUSE_PROGRAMS
} from "../constants/relationshipConnectHouse";

export type ConnectHouseConferenceCardViewModel = {
  id: string;
  title: string;
  description: string;
  conferenceLabel: string;
  statusLabel: string;
};

export type ConnectHouseWorkshopCardViewModel = {
  id: string;
  title: string;
  description: string;
  workshopLabel: string;
  statusLabel: string;
};

export type ConnectHouseNetworkingCardViewModel = {
  id: string;
  title: string;
  description: string;
  networkingLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

function toConferenceViewModel(
  id: string,
  title: string,
  description: string
): ConnectHouseConferenceCardViewModel {
  return {
    id,
    title,
    description,
    conferenceLabel: CONNECT_HOUSE_CONFERENCE_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

function toWorkshopViewModel(
  id: string,
  title: string,
  description: string
): ConnectHouseWorkshopCardViewModel {
  return {
    id,
    title,
    description,
    workshopLabel: CONNECT_HOUSE_WORKSHOP_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

function toNetworkingViewModel(
  id: string,
  title: string,
  description: string
): ConnectHouseNetworkingCardViewModel {
  return {
    id,
    title,
    description,
    networkingLabel: CONNECT_HOUSE_NETWORKING_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildConferenceCardFromProgram(
  program: PreparedConnectHouseProgramDefinition
): ConnectHouseConferenceCardViewModel {
  return toConferenceViewModel(`program_${program.id}`, program.title, program.description);
}

export function buildConferenceCardFromActivity(
  activity: PreparedConnectHouseActivityDefinition
): ConnectHouseConferenceCardViewModel {
  return toConferenceViewModel(`activity_${activity.id}`, activity.title, activity.description);
}

export function buildWorkshopCardFromProgram(
  program: PreparedConnectHouseProgramDefinition
): ConnectHouseWorkshopCardViewModel {
  return toWorkshopViewModel(`program_${program.id}`, program.title, program.description);
}

export function buildWorkshopCardFromActivity(
  activity: PreparedConnectHouseActivityDefinition
): ConnectHouseWorkshopCardViewModel {
  return toWorkshopViewModel(`activity_${activity.id}`, activity.title, activity.description);
}

export function buildNetworkingCardFromProgram(
  program: PreparedConnectHouseProgramDefinition
): ConnectHouseNetworkingCardViewModel {
  return toNetworkingViewModel(`program_${program.id}`, program.title, program.description);
}

export function buildNetworkingCardFromActivity(
  activity: PreparedConnectHouseActivityDefinition
): ConnectHouseNetworkingCardViewModel {
  return toNetworkingViewModel(`activity_${activity.id}`, activity.title, activity.description);
}

export function listArchitectureConnectHouseConferences(): ConnectHouseConferenceCardViewModel[] {
  const programs = PREPARED_CONNECT_HOUSE_PROGRAMS.filter((item) => item.kind === "conference").map(
    buildConferenceCardFromProgram
  );
  const activities = PREPARED_CONNECT_HOUSE_ACTIVITIES.filter(
    (item) => item.kind === "conference"
  ).map(buildConferenceCardFromActivity);
  return [...programs, ...activities];
}

export function listArchitectureConnectHouseWorkshops(): ConnectHouseWorkshopCardViewModel[] {
  const programs = PREPARED_CONNECT_HOUSE_PROGRAMS.filter((item) => item.kind === "workshop").map(
    buildWorkshopCardFromProgram
  );
  const activities = PREPARED_CONNECT_HOUSE_ACTIVITIES.filter((item) => item.kind === "workshop").map(
    buildWorkshopCardFromActivity
  );
  return [...programs, ...activities];
}

export function listArchitectureConnectHouseNetworking(): ConnectHouseNetworkingCardViewModel[] {
  const programs = PREPARED_CONNECT_HOUSE_PROGRAMS.filter(
    (item) => item.kind === "networking"
  ).map(buildNetworkingCardFromProgram);
  const activities = PREPARED_CONNECT_HOUSE_ACTIVITIES.filter(
    (item) => item.kind === "networking"
  ).map(buildNetworkingCardFromActivity);
  return [...programs, ...activities];
}

export type { PreparedConnectHouseActivityId, PreparedConnectHouseProgramId };
