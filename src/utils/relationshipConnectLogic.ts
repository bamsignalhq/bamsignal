import type {
  PreparedConnectActivityDefinition,
  PreparedConnectActivityId,
  PreparedConnectGuestDefinition,
  PreparedConnectGuestId,
  PreparedConnectProgramDefinition,
  PreparedConnectProgramId,
  PreparedFutureCityDefinition,
  PreparedFutureCityId,
  PreparedPremiumExperienceDefinition,
  PreparedPremiumExperienceId
} from "../constants/relationshipConnect";
import {
  PREPARED_CONNECT_ACTIVITIES,
  PREPARED_CONNECT_GUESTS,
  PREPARED_CONNECT_PROGRAMS,
  PREPARED_FUTURE_CITIES,
  PREPARED_PREMIUM_EXPERIENCES
} from "../constants/relationshipConnect";

export type ConferenceViewModel = {
  id: PreparedConnectProgramId;
  title: string;
  description: string;
  statusLabel: string;
};

export type ExperienceViewModel = {
  id: PreparedPremiumExperienceId;
  title: string;
  description: string;
  statusLabel: string;
};

export type SpeakerViewModel = {
  id: PreparedConnectGuestId;
  title: string;
  description: string;
  statusLabel: string;
};

export type ArtistViewModel = {
  id: string;
  title: string;
  description: string;
  source: "guest" | "activity";
  statusLabel: string;
};

export type WorkshopViewModel = {
  id: PreparedConnectActivityId;
  title: string;
  description: string;
  statusLabel: string;
};

export type NetworkingViewModel = {
  id: PreparedConnectActivityId;
  title: string;
  description: string;
  statusLabel: string;
};

export type FutureCityViewModel = {
  id: PreparedFutureCityId;
  title: string;
  description: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildConferenceViewModel(program: PreparedConnectProgramDefinition): ConferenceViewModel {
  return {
    id: program.id,
    title: program.title,
    description: program.description,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildExperienceViewModel(
  experience: PreparedPremiumExperienceDefinition
): ExperienceViewModel {
  return {
    id: experience.id,
    title: experience.title,
    description: experience.description,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildSpeakerViewModel(guest: PreparedConnectGuestDefinition): SpeakerViewModel {
  return {
    id: guest.id,
    title: guest.title,
    description: guest.description,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildArtistViewModel(
  item: PreparedConnectGuestDefinition | PreparedConnectActivityDefinition,
  source: "guest" | "activity"
): ArtistViewModel {
  return {
    id: source === "guest" ? `guest_${item.id}` : `activity_${item.id}`,
    title: item.title,
    description: item.description,
    source,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildWorkshopViewModel(activity: PreparedConnectActivityDefinition): WorkshopViewModel {
  return {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildNetworkingViewModel(activity: PreparedConnectActivityDefinition): NetworkingViewModel {
  return {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildFutureCityViewModel(city: PreparedFutureCityDefinition): FutureCityViewModel {
  return {
    id: city.id,
    title: city.title,
    description: city.description,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureConferences(): ConferenceViewModel[] {
  return [...PREPARED_CONNECT_PROGRAMS.map(buildConferenceViewModel)];
}

export function listArchitectureExperiences(): ExperienceViewModel[] {
  return [...PREPARED_PREMIUM_EXPERIENCES.map(buildExperienceViewModel)];
}

export function listArchitectureSpeakers(): SpeakerViewModel[] {
  return PREPARED_CONNECT_GUESTS.filter((guest) => guest.kind === "speaker").map(buildSpeakerViewModel);
}

export function listArchitectureArtists(): ArtistViewModel[] {
  const guestArtists = PREPARED_CONNECT_GUESTS.filter((guest) => guest.kind === "artist").map((guest) =>
    buildArtistViewModel(guest, "guest")
  );
  const activityArtists = PREPARED_CONNECT_ACTIVITIES.filter((activity) => activity.kind === "artist").map(
    (activity) => buildArtistViewModel(activity, "activity")
  );
  return [...guestArtists, ...activityArtists];
}

export function listArchitectureWorkshops(): WorkshopViewModel[] {
  return PREPARED_CONNECT_ACTIVITIES.filter((activity) => activity.kind === "workshop").map(
    buildWorkshopViewModel
  );
}

export function listArchitectureNetworking(): NetworkingViewModel[] {
  return PREPARED_CONNECT_ACTIVITIES.filter((activity) => activity.kind === "networking").map(
    buildNetworkingViewModel
  );
}

export function listArchitectureFutureCities(): FutureCityViewModel[] {
  return [...PREPARED_FUTURE_CITIES.map(buildFutureCityViewModel)];
}
