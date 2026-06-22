import {
  PREPARED_CONNECT_ACTIVITIES,
  PREPARED_CONNECT_GUESTS,
  PREPARED_CONNECT_PROGRAMS,
  PREPARED_FUTURE_CITIES,
  PREPARED_PREMIUM_EXPERIENCES
} from "../constants/relationshipConnect";
import {
  listArchitectureArtists,
  listArchitectureConferences,
  listArchitectureExperiences,
  listArchitectureFutureCities,
  listArchitectureNetworking,
  listArchitectureSpeakers,
  listArchitectureWorkshops,
  type ArtistViewModel,
  type ConferenceViewModel,
  type ExperienceViewModel,
  type FutureCityViewModel,
  type NetworkingViewModel,
  type SpeakerViewModel,
  type WorkshopViewModel
} from "./relationshipConnectLogic";

export type RelationshipConnectBundle = {
  conferences: ConferenceViewModel[];
  experiences: ExperienceViewModel[];
  speakers: SpeakerViewModel[];
  artists: ArtistViewModel[];
  workshops: WorkshopViewModel[];
  networking: NetworkingViewModel[];
  futureCities: FutureCityViewModel[];
  programCount: number;
  activityCount: number;
  guestCount: number;
};

export function getRelationshipConnectBundle(): RelationshipConnectBundle {
  return {
    conferences: listArchitectureConferences(),
    experiences: listArchitectureExperiences(),
    speakers: listArchitectureSpeakers(),
    artists: listArchitectureArtists(),
    workshops: listArchitectureWorkshops(),
    networking: listArchitectureNetworking(),
    futureCities: listArchitectureFutureCities(),
    programCount: PREPARED_CONNECT_PROGRAMS.length,
    activityCount: PREPARED_CONNECT_ACTIVITIES.length,
    guestCount: PREPARED_CONNECT_GUESTS.length
  };
}

export function getConnectProgram(programId: string): ConferenceViewModel | null {
  return listArchitectureConferences().find((program) => program.id === programId) ?? null;
}

export function getConnectCounts() {
  return {
    programs: PREPARED_CONNECT_PROGRAMS.length,
    activities: PREPARED_CONNECT_ACTIVITIES.length,
    guests: PREPARED_CONNECT_GUESTS.length,
    experiences: PREPARED_PREMIUM_EXPERIENCES.length,
    cities: PREPARED_FUTURE_CITIES.length
  };
}
