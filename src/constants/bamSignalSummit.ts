/** BamSignal Summit™ — annual relationship and family conferences architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const BAMSIGNAL_SUMMIT_TITLE = "BamSignal Summit™";
export const BAMSIGNAL_SUMMIT_LABEL = "BamSignal Summit";
export const SUMMIT_THEME_LABEL = "Summit Theme";
export const SUMMIT_SPEAKER_LABEL = "Summit Speaker";
export const SUMMIT_AGENDA_LABEL = "Summit Agenda";
export const SUMMIT_EXPERIENCE_LABEL = "Summit Experience";

export const BAMSIGNAL_SUMMIT_GOOD_COPY = [
  "Summit",
  "Gathering",
  "Conversations",
  "Wisdom",
  "Legacy"
] as const;

export const BAMSIGNAL_SUMMIT_FORBIDDEN_COPY = ["Convention", "Trade Show", "Expo"] as const;

export const BAMSIGNAL_SUMMIT_SUBCOPY =
  "Annual relationship and family conferences — Summit gatherings with wisdom and legacy, never conventions or trade shows.";
export const BAMSIGNAL_SUMMIT_PURPOSE_COPY =
  "Prepare annual relationship and family conferences — themes, speakers, and experiences reserved, not ticketing yet.";
export const BAMSIGNAL_SUMMIT_RESERVED_COPY =
  "Architecture prepared. Summit themes, agendas, speakers, and experiences are not enabled yet.";
export const BAMSIGNAL_SUMMIT_FUTURE_READY_COPY =
  "Future-ready capabilities documented only — global summits, livestreams, and regional editions are not implemented.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type FutureReadySummitCapabilityId = "global-summits" | "livestreams" | "regional-editions";

export type FutureReadySummitCapabilityDefinition = {
  id: FutureReadySummitCapabilityId;
  title: string;
  description: string;
};

export const FUTURE_READY_SUMMIT_CAPABILITIES: FutureReadySummitCapabilityDefinition[] = [
  {
    id: "global-summits",
    title: "Global Summits",
    description: "Global Summits — architecture reserved, not implemented."
  },
  {
    id: "livestreams",
    title: "Livestreams",
    description: "Livestreams — architecture reserved, not implemented."
  },
  {
    id: "regional-editions",
    title: "Regional editions",
    description: "Regional editions — architecture reserved, not implemented."
  }
];

export type PreparedSummitThemeId =
  | "building-strong-homes"
  | "faith-family"
  | "diaspora-love"
  | "raising-healthy-families"
  | "communication-conflict"
  | "marriage-modern-africa"
  | "family-legacy"
  | "parenting-with-purpose";

export type PreparedSummitThemeDefinition = {
  id: PreparedSummitThemeId;
  title: string;
  description: string;
};

export const PREPARED_SUMMIT_THEMES: PreparedSummitThemeDefinition[] = [
  {
    id: "building-strong-homes",
    title: "Building Strong Homes",
    description: "Building Strong Homes — annual summit theme for lasting households."
  },
  {
    id: "faith-family",
    title: "Faith & Family",
    description: "Faith & Family — gathering conversations with wisdom and dignity."
  },
  {
    id: "diaspora-love",
    title: "Diaspora Love",
    description: "Diaspora Love — cross-border relationships honoured at the summit."
  },
  {
    id: "raising-healthy-families",
    title: "Raising Healthy Families",
    description: "Raising Healthy Families — legacy-focused family conversations."
  },
  {
    id: "communication-conflict",
    title: "Communication & Conflict",
    description: "Communication & Conflict — practical wisdom for modern relationships."
  },
  {
    id: "marriage-modern-africa",
    title: "Marriage In Modern Africa",
    description: "Marriage In Modern Africa — summit theme for contemporary couples."
  },
  {
    id: "family-legacy",
    title: "Family Legacy",
    description: "Family Legacy — multi-generational wisdom at the gathering."
  },
  {
    id: "parenting-with-purpose",
    title: "Parenting With Purpose",
    description: "Parenting With Purpose — intentional family stewardship conversations."
  }
];

export type PreparedSummitExperienceId =
  | "keynotes"
  | "masterclasses"
  | "panel-discussions"
  | "live-qa"
  | "workshops"
  | "networking"
  | "private-dinners"
  | "mentorship-sessions";

export type PreparedSummitExperienceDefinition = {
  id: PreparedSummitExperienceId;
  title: string;
  description: string;
};

export const PREPARED_SUMMIT_EXPERIENCES: PreparedSummitExperienceDefinition[] = [
  {
    id: "keynotes",
    title: "Keynotes",
    description: "Keynotes — opening wisdom at the annual summit gathering."
  },
  {
    id: "masterclasses",
    title: "Masterclasses",
    description: "Masterclasses — deep relationship learning, not a trade show booth."
  },
  {
    id: "panel-discussions",
    title: "Panel Discussions",
    description: "Panel Discussions — expert conversations with dignity."
  },
  {
    id: "live-qa",
    title: "Live Q&A",
    description: "Live Q&A — thoughtful dialogue at the summit."
  },
  {
    id: "workshops",
    title: "Workshops",
    description: "Workshops — hands-on family and relationship sessions."
  },
  {
    id: "networking",
    title: "Networking",
    description: "Networking — warm gathering connections, not an expo floor."
  },
  {
    id: "private-dinners",
    title: "Private Dinners",
    description: "Private Dinners — intimate summit experiences over shared meals."
  },
  {
    id: "mentorship-sessions",
    title: "Mentorship Sessions",
    description: "Mentorship Sessions — guided legacy conversations."
  }
];

export type PreparedSummitSpeakerId =
  | "relationship-experts"
  | "marriage-mentors"
  | "faith-leaders"
  | "authors"
  | "psychologists"
  | "family-advisors"
  | "diaspora-leaders"
  | "artists"
  | "comedians";

export type PreparedSummitSpeakerDefinition = {
  id: PreparedSummitSpeakerId;
  title: string;
  description: string;
};

export const PREPARED_SUMMIT_SPEAKERS: PreparedSummitSpeakerDefinition[] = [
  {
    id: "relationship-experts",
    title: "Relationship Experts",
    description: "Relationship Experts — summit speakers sharing wisdom, not expo pitches."
  },
  {
    id: "marriage-mentors",
    title: "Marriage Mentors",
    description: "Marriage Mentors — lifetime guidance at the annual gathering."
  },
  {
    id: "faith-leaders",
    title: "Faith Leaders",
    description: "Faith Leaders — dignified conversations on faith and family."
  },
  {
    id: "authors",
    title: "Authors",
    description: "Authors — written wisdom brought to summit conversations."
  },
  {
    id: "psychologists",
    title: "Psychologists",
    description: "Psychologists — evidence-based family insight at the summit."
  },
  {
    id: "family-advisors",
    title: "Family Advisors",
    description: "Family Advisors — household stewardship voices reserved."
  },
  {
    id: "diaspora-leaders",
    title: "Diaspora Leaders",
    description: "Diaspora Leaders — cross-border relationship expertise honoured."
  },
  {
    id: "artists",
    title: "Artists",
    description: "Artists — creative celebration at the gathering."
  },
  {
    id: "comedians",
    title: "Comedians",
    description: "Comedians — warmth and joy with dignity, not convention entertainment."
  }
];

export type PreparedSummitAgendaId =
  | "bsmt_agenda_keynotes"
  | "bsmt_agenda_masterclasses"
  | "bsmt_agenda_panel-discussions"
  | "bsmt_agenda_live-qa"
  | "bsmt_agenda_workshops"
  | "bsmt_agenda_networking"
  | "bsmt_agenda_private-dinners"
  | "bsmt_agenda_mentorship-sessions";

export type PreparedSummitAgendaDefinition = {
  id: PreparedSummitAgendaId;
  title: string;
  summary: string;
  themeId: PreparedSummitThemeId;
  experienceId: PreparedSummitExperienceId;
};

const agendaIdByExperience: Record<PreparedSummitExperienceId, PreparedSummitAgendaId> = {
  keynotes: "bsmt_agenda_keynotes",
  masterclasses: "bsmt_agenda_masterclasses",
  "panel-discussions": "bsmt_agenda_panel-discussions",
  "live-qa": "bsmt_agenda_live-qa",
  workshops: "bsmt_agenda_workshops",
  networking: "bsmt_agenda_networking",
  "private-dinners": "bsmt_agenda_private-dinners",
  "mentorship-sessions": "bsmt_agenda_mentorship-sessions"
};

export const PREPARED_SUMMIT_AGENDA: PreparedSummitAgendaDefinition[] =
  PREPARED_SUMMIT_EXPERIENCES.map((experience, index) => {
    const theme = PREPARED_SUMMIT_THEMES[index];
    return {
      id: agendaIdByExperience[experience.id],
      title: `${experience.title}: ${theme.title}`,
      summary: `${experience.title} on ${theme.title} — summit agenda reserved, not scheduled yet.`,
      themeId: theme.id,
      experienceId: experience.id
    };
  });

export function getPreparedSummitTheme(themeId: PreparedSummitThemeId): PreparedSummitThemeDefinition | undefined {
  return PREPARED_SUMMIT_THEMES.find((theme) => theme.id === themeId);
}
