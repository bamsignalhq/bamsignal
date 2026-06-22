/** BamSignal Relationship Connect™ — premium conferences and gatherings architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const RELATIONSHIP_CONNECT_TITLE = "BamSignal Relationship Connect™";
export const RELATIONSHIP_CONNECT_LABEL = "Relationship Connect";
export const CONFERENCE_LABEL = "Conference";
export const EXPERIENCE_LABEL = "Experience";
export const SPEAKER_LABEL = "Speaker";
export const ARTIST_LABEL = "Artist";
export const WORKSHOP_LABEL = "Workshop";
export const NETWORKING_LABEL = "Networking";

export const RELATIONSHIP_CONNECT_GOOD_COPY = [
  "Relationship Connect",
  "Conference",
  "Summit",
  "Experience",
  "Gathering",
  "Celebration"
] as const;

export const RELATIONSHIP_CONNECT_FORBIDDEN_COPY = [
  "Convention",
  "Dating Expo",
  "Singles Fair"
] as const;

export const RELATIONSHIP_CONNECT_SUBCOPY =
  "Premium conferences and gatherings — Relationship Connect experiences with dignity, never conventions or dating expos.";
export const RELATIONSHIP_CONNECT_PURPOSE_COPY =
  "Prepare premium conferences and gatherings — programs, activities, and guests reserved, not ticketing yet.";
export const RELATIONSHIP_CONNECT_RESERVED_COPY =
  "Architecture prepared. Conferences, experiences, speakers, and city gatherings are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedConnectProgramId =
  | "singles-connect"
  | "couples-connect"
  | "family-connect"
  | "legacy-connect"
  | "diaspora-connect"
  | "faith-family-summit";

export type PreparedConnectProgramDefinition = {
  id: PreparedConnectProgramId;
  title: string;
  description: string;
};

export const PREPARED_CONNECT_PROGRAMS: PreparedConnectProgramDefinition[] = [
  {
    id: "singles-connect",
    title: "Singles Connect™",
    description: "Singles Connect — gathering and celebration, not a singles fair."
  },
  {
    id: "couples-connect",
    title: "Couples Connect™",
    description: "Couples Connect — conference experience for growing together."
  },
  {
    id: "family-connect",
    title: "Family Connect™",
    description: "Family Connect — family gathering with relationship wisdom."
  },
  {
    id: "legacy-connect",
    title: "Legacy Connect™",
    description: "Legacy Connect — summit honouring lasting relationships."
  },
  {
    id: "diaspora-connect",
    title: "Diaspora Connect™",
    description: "Diaspora Connect — cross-border gathering and celebration."
  },
  {
    id: "faith-family-summit",
    title: "Faith & Family Summit™",
    description: "Faith & Family Summit — dignified summit, not a convention."
  }
];

export type PreparedConnectActivityId =
  | "meet-greet"
  | "relationship-networking"
  | "panel-discussions"
  | "masterclasses"
  | "qa-sessions"
  | "workshops"
  | "mentorship-sessions"
  | "comedy"
  | "music"
  | "live-performances"
  | "dinner-experiences";

export type PreparedConnectActivityKind = "networking" | "workshop" | "artist";

export type PreparedConnectActivityDefinition = {
  id: PreparedConnectActivityId;
  title: string;
  description: string;
  kind: PreparedConnectActivityKind;
};

export const PREPARED_CONNECT_ACTIVITIES: PreparedConnectActivityDefinition[] = [
  {
    id: "meet-greet",
    title: "Meet & Greet",
    description: "Meet & Greet — warm networking, not a dating expo.",
    kind: "networking"
  },
  {
    id: "relationship-networking",
    title: "Relationship Networking",
    description: "Relationship Networking — dignified connections at gatherings.",
    kind: "networking"
  },
  {
    id: "panel-discussions",
    title: "Panel Discussions",
    description: "Panel Discussions — expert conversations at the summit.",
    kind: "networking"
  },
  {
    id: "masterclasses",
    title: "Masterclasses",
    description: "Masterclasses — relationship wisdom in conference format.",
    kind: "workshop"
  },
  {
    id: "qa-sessions",
    title: "Q&A Sessions",
    description: "Q&A Sessions — thoughtful dialogue with experts.",
    kind: "workshop"
  },
  {
    id: "workshops",
    title: "Workshops",
    description: "Workshops — hands-on learning at Relationship Connect.",
    kind: "workshop"
  },
  {
    id: "mentorship-sessions",
    title: "Mentorship Sessions",
    description: "Mentorship Sessions — guided growth with mentors.",
    kind: "workshop"
  },
  {
    id: "comedy",
    title: "Comedy",
    description: "Comedy — celebration with warmth and dignity.",
    kind: "artist"
  },
  {
    id: "music",
    title: "Music",
    description: "Music — live celebration at the gathering.",
    kind: "artist"
  },
  {
    id: "live-performances",
    title: "Live Performances",
    description: "Live Performances — experience and celebration combined.",
    kind: "artist"
  },
  {
    id: "dinner-experiences",
    title: "Dinner Experiences",
    description: "Dinner Experiences — premium gathering over shared meals.",
    kind: "artist"
  }
];

export type PreparedConnectGuestId =
  | "relationship-experts"
  | "marriage-mentors"
  | "faith-leaders"
  | "artists"
  | "comedians"
  | "authors"
  | "family-counselors"
  | "psychologists"
  | "diaspora-leaders";

export type PreparedConnectGuestKind = "speaker" | "artist";

export type PreparedConnectGuestDefinition = {
  id: PreparedConnectGuestId;
  title: string;
  description: string;
  kind: PreparedConnectGuestKind;
};

export const PREPARED_CONNECT_GUESTS: PreparedConnectGuestDefinition[] = [
  {
    id: "relationship-experts",
    title: "Relationship Experts",
    description: "Relationship Experts — conference speakers reserved.",
    kind: "speaker"
  },
  {
    id: "marriage-mentors",
    title: "Marriage Mentors",
    description: "Marriage Mentors — summit guidance with dignity.",
    kind: "speaker"
  },
  {
    id: "faith-leaders",
    title: "Faith Leaders",
    description: "Faith Leaders — respectful counsel at gatherings.",
    kind: "speaker"
  },
  {
    id: "artists",
    title: "Artists",
    description: "Artists — celebration performers reserved.",
    kind: "artist"
  },
  {
    id: "comedians",
    title: "Comedians",
    description: "Comedians — warm comedy at the experience.",
    kind: "artist"
  },
  {
    id: "authors",
    title: "Authors",
    description: "Authors — relationship wisdom shared at the summit.",
    kind: "speaker"
  },
  {
    id: "family-counselors",
    title: "Family Counselors",
    description: "Family Counselors — household guidance at conferences.",
    kind: "speaker"
  },
  {
    id: "psychologists",
    title: "Psychologists",
    description: "Psychologists — expert speakers reserved.",
    kind: "speaker"
  },
  {
    id: "diaspora-leaders",
    title: "Diaspora Leaders",
    description: "Diaspora Leaders — cross-border gathering voices.",
    kind: "speaker"
  }
];

export type PreparedPremiumExperienceId =
  | "vip-tables"
  | "private-dinners"
  | "executive-lounge"
  | "legacy-circle"
  | "founders-circle";

export type PreparedPremiumExperienceDefinition = {
  id: PreparedPremiumExperienceId;
  title: string;
  description: string;
};

export const PREPARED_PREMIUM_EXPERIENCES: PreparedPremiumExperienceDefinition[] = [
  {
    id: "vip-tables",
    title: "VIP Tables",
    description: "VIP Tables — premium experience reserved, not ticketing yet."
  },
  {
    id: "private-dinners",
    title: "Private Dinners",
    description: "Private Dinners — intimate gathering experience."
  },
  {
    id: "executive-lounge",
    title: "Executive Lounge",
    description: "Executive Lounge — dignified premium conference space."
  },
  {
    id: "legacy-circle",
    title: "Legacy Circle",
    description: "Legacy Circle — honoured gathering for lasting impact."
  },
  {
    id: "founders-circle",
    title: "Founders Circle",
    description: "Founders Circle — pioneers celebrated at the summit."
  }
];

export type PreparedFutureCityId =
  | "lagos"
  | "abuja"
  | "port-harcourt"
  | "enugu"
  | "london"
  | "toronto"
  | "houston"
  | "atlanta"
  | "dubai"
  | "johannesburg"
  | "sydney";

export type PreparedFutureCityDefinition = {
  id: PreparedFutureCityId;
  title: string;
  description: string;
};

export const PREPARED_FUTURE_CITIES: PreparedFutureCityDefinition[] = [
  { id: "lagos", title: "Lagos", description: "Lagos — future Relationship Connect gathering reserved." },
  { id: "abuja", title: "Abuja", description: "Abuja — future conference city prepared." },
  { id: "port-harcourt", title: "Port Harcourt", description: "Port Harcourt — future summit city reserved." },
  { id: "enugu", title: "Enugu", description: "Enugu — future gathering city prepared." },
  { id: "london", title: "London", description: "London — diaspora conference city reserved." },
  { id: "toronto", title: "Toronto", description: "Toronto — future celebration city prepared." },
  { id: "houston", title: "Houston", description: "Houston — future Relationship Connect city reserved." },
  { id: "atlanta", title: "Atlanta", description: "Atlanta — future summit city prepared." },
  { id: "dubai", title: "Dubai", description: "Dubai — future gathering city reserved." },
  {
    id: "johannesburg",
    title: "Johannesburg",
    description: "Johannesburg — future conference city prepared."
  },
  { id: "sydney", title: "Sydney", description: "Sydney — future celebration city reserved." }
];
