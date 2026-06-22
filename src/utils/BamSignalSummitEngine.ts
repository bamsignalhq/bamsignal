import {
  FUTURE_READY_SUMMIT_CAPABILITIES,
  PREPARED_SUMMIT_EXPERIENCES,
  PREPARED_SUMMIT_SPEAKERS,
  PREPARED_SUMMIT_THEMES
} from "../constants/bamSignalSummit";
import {
  listArchitectureSummitAgenda,
  listArchitectureSummitExperiences,
  listArchitectureSummitSpeakers,
  listArchitectureSummitThemes,
  type SummitAgendaViewModel,
  type SummitExperienceViewModel,
  type SummitSpeakerViewModel,
  type SummitThemeViewModel
} from "./bamSignalSummitLogic";

export type BamSignalSummitBundle = {
  themes: SummitThemeViewModel[];
  experiences: SummitExperienceViewModel[];
  speakers: SummitSpeakerViewModel[];
  agenda: SummitAgendaViewModel[];
  themeCount: number;
  experienceCount: number;
  speakerCount: number;
  futureReadyCapabilityCount: number;
};

export function getBamSignalSummitBundle(): BamSignalSummitBundle {
  return {
    themes: listArchitectureSummitThemes(),
    experiences: listArchitectureSummitExperiences(),
    speakers: listArchitectureSummitSpeakers(),
    agenda: listArchitectureSummitAgenda(),
    themeCount: PREPARED_SUMMIT_THEMES.length,
    experienceCount: PREPARED_SUMMIT_EXPERIENCES.length,
    speakerCount: PREPARED_SUMMIT_SPEAKERS.length,
    futureReadyCapabilityCount: FUTURE_READY_SUMMIT_CAPABILITIES.length
  };
}

export function getSummitTheme(themeId: string): SummitThemeViewModel | null {
  return listArchitectureSummitThemes().find((theme) => theme.id === themeId) ?? null;
}
