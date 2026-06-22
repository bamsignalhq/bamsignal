import type {
  PreparedSummitAgendaDefinition,
  PreparedSummitAgendaId,
  PreparedSummitExperienceDefinition,
  PreparedSummitExperienceId,
  PreparedSummitSpeakerDefinition,
  PreparedSummitSpeakerId,
  PreparedSummitThemeDefinition,
  PreparedSummitThemeId
} from "../constants/bamSignalSummit";
import {
  PREPARED_SUMMIT_AGENDA,
  PREPARED_SUMMIT_EXPERIENCES,
  PREPARED_SUMMIT_SPEAKERS,
  PREPARED_SUMMIT_THEMES,
  SUMMIT_AGENDA_LABEL,
  SUMMIT_EXPERIENCE_LABEL,
  SUMMIT_SPEAKER_LABEL,
  SUMMIT_THEME_LABEL
} from "../constants/bamSignalSummit";

export type SummitThemeViewModel = {
  id: PreparedSummitThemeId;
  title: string;
  description: string;
  themeLabel: string;
  statusLabel: string;
};

export type SummitExperienceViewModel = {
  id: PreparedSummitExperienceId;
  title: string;
  description: string;
  experienceLabel: string;
  statusLabel: string;
};

export type SummitSpeakerViewModel = {
  id: PreparedSummitSpeakerId;
  title: string;
  description: string;
  speakerLabel: string;
  statusLabel: string;
};

export type SummitAgendaViewModel = {
  id: PreparedSummitAgendaId;
  title: string;
  summary: string;
  themeTitle: string;
  experienceTitle: string;
  agendaLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildSummitThemeViewModel(theme: PreparedSummitThemeDefinition): SummitThemeViewModel {
  return {
    id: theme.id,
    title: theme.title,
    description: theme.description,
    themeLabel: SUMMIT_THEME_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildSummitExperienceViewModel(
  experience: PreparedSummitExperienceDefinition
): SummitExperienceViewModel {
  return {
    id: experience.id,
    title: experience.title,
    description: experience.description,
    experienceLabel: SUMMIT_EXPERIENCE_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildSummitSpeakerViewModel(speaker: PreparedSummitSpeakerDefinition): SummitSpeakerViewModel {
  return {
    id: speaker.id,
    title: speaker.title,
    description: speaker.description,
    speakerLabel: SUMMIT_SPEAKER_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildSummitAgendaViewModel(agenda: PreparedSummitAgendaDefinition): SummitAgendaViewModel {
  const theme = PREPARED_SUMMIT_THEMES.find((item) => item.id === agenda.themeId);
  const experience = PREPARED_SUMMIT_EXPERIENCES.find((item) => item.id === agenda.experienceId);
  return {
    id: agenda.id,
    title: agenda.title,
    summary: agenda.summary,
    themeTitle: theme?.title ?? agenda.themeId,
    experienceTitle: experience?.title ?? agenda.experienceId,
    agendaLabel: SUMMIT_AGENDA_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureSummitThemes(): SummitThemeViewModel[] {
  return [...PREPARED_SUMMIT_THEMES.map(buildSummitThemeViewModel)];
}

export function listArchitectureSummitExperiences(): SummitExperienceViewModel[] {
  return [...PREPARED_SUMMIT_EXPERIENCES.map(buildSummitExperienceViewModel)];
}

export function listArchitectureSummitSpeakers(): SummitSpeakerViewModel[] {
  return [...PREPARED_SUMMIT_SPEAKERS.map(buildSummitSpeakerViewModel)];
}

export function listArchitectureSummitAgenda(): SummitAgendaViewModel[] {
  return [...PREPARED_SUMMIT_AGENDA.map(buildSummitAgendaViewModel)];
}
