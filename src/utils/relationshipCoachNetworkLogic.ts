import type {
  PreparedCoachDefinition,
  PreparedCoachId,
  PreparedCoachSpecialtyDefinition,
  PreparedCoachSpecialtyId
} from "../constants/relationshipCoachNetwork";
import { PREPARED_COACH_SPECIALTIES, PREPARED_COACHES } from "../constants/relationshipCoachNetwork";

export type CoachProfileViewModel = {
  id: PreparedCoachId;
  name: string;
  title: string;
  focus: string;
  specialtyTitle: string;
  statusLabel: string;
};

export type CoachBadgeViewModel = {
  id: PreparedCoachSpecialtyId;
  title: string;
  description: string;
  coachName: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildCoachProfileViewModel(coach: PreparedCoachDefinition): CoachProfileViewModel {
  const specialty = PREPARED_COACH_SPECIALTIES.find((item) => item.id === coach.specialtyId);
  return {
    id: coach.id,
    name: coach.name,
    title: coach.title,
    focus: coach.focus,
    specialtyTitle: specialty?.title ?? coach.specialtyId,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildCoachBadgeViewModel(
  specialty: PreparedCoachSpecialtyDefinition
): CoachBadgeViewModel {
  const coach = PREPARED_COACHES.find((item) => item.id === specialty.coachId);
  return {
    id: specialty.id,
    title: specialty.title,
    description: specialty.description,
    coachName: coach?.name ?? "Reserved coach",
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureCoachProfiles(): CoachProfileViewModel[] {
  return [...PREPARED_COACHES.map(buildCoachProfileViewModel)].sort((a, b) =>
    a.specialtyTitle.localeCompare(b.specialtyTitle)
  );
}

export function listArchitectureCoachBadges(): CoachBadgeViewModel[] {
  return [...PREPARED_COACH_SPECIALTIES.map(buildCoachBadgeViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}
