/** Relationship Connect™ House — gatherings at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";
import { RELATIONSHIP_CONNECT_FORBIDDEN_COPY } from "./relationshipConnect";

export const RELATIONSHIP_CONNECT_HOUSE_TITLE = "Relationship Connect™ House";
export const RELATIONSHIP_CONNECT_HOUSE_LABEL = "Relationship Connect House";
export const CONNECT_HOUSE_CONFERENCE_LABEL = "Conference";
export const CONNECT_HOUSE_WORKSHOP_LABEL = "Workshop";
export const CONNECT_HOUSE_NETWORKING_LABEL = "Networking";

export const RELATIONSHIP_CONNECT_HOUSE_SUBCOPY =
  "Relationship Connect™ at The BamSignal House™ — premium programs and activities with dignity, never conventions or dating expos.";
export const RELATIONSHIP_CONNECT_HOUSE_PURPOSE_COPY =
  "Prepare Relationship Connect House architecture — programs and activities reserved, not ticketing yet.";
export const RELATIONSHIP_CONNECT_HOUSE_RESERVED_COPY =
  "Architecture prepared. Relationship Connect House programs and activities are not enabled yet.";

export {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_CONNECT_FORBIDDEN_COPY,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
};

export type PreparedConnectHouseCardKind = "conference" | "workshop" | "networking";

export type PreparedConnectHouseProgramId =
  | "singles-connect"
  | "couples-connect"
  | "family-connect"
  | "diaspora-connect"
  | "faith-family-summit";

export type PreparedConnectHouseProgramDefinition = {
  id: PreparedConnectHouseProgramId;
  title: string;
  description: string;
  kind: PreparedConnectHouseCardKind;
};

export const PREPARED_CONNECT_HOUSE_PROGRAMS: PreparedConnectHouseProgramDefinition[] = [
  {
    id: "singles-connect",
    title: "Singles Connect™",
    description: "Singles Connect™ — dignified gathering at the House, not a singles fair.",
    kind: "networking"
  },
  {
    id: "couples-connect",
    title: "Couples Connect™",
    description: "Couples Connect™ — workshop experience for growing together.",
    kind: "workshop"
  },
  {
    id: "family-connect",
    title: "Family Connect™",
    description: "Family Connect™ — household programs with relationship wisdom.",
    kind: "workshop"
  },
  {
    id: "diaspora-connect",
    title: "Diaspora Connect™",
    description: "Diaspora Connect™ — cross-border networking at the House.",
    kind: "networking"
  },
  {
    id: "faith-family-summit",
    title: "Faith & Family Summit™",
    description: "Faith & Family Summit™ — conference honouring faith and family Legacy.",
    kind: "conference"
  }
];

export type PreparedConnectHouseActivityId =
  | "meet-greet"
  | "comedy"
  | "music"
  | "panel-sessions"
  | "relationship-lessons"
  | "networking"
  | "artists"
  | "entertainment"
  | "private-dinners";

export type PreparedConnectHouseActivityDefinition = {
  id: PreparedConnectHouseActivityId;
  title: string;
  description: string;
  kind: PreparedConnectHouseCardKind;
};

export const PREPARED_CONNECT_HOUSE_ACTIVITIES: PreparedConnectHouseActivityDefinition[] = [
  {
    id: "meet-greet",
    title: "Meet & Greet",
    description: "Meet & Greet — warm networking at Relationship Connect House.",
    kind: "networking"
  },
  {
    id: "comedy",
    title: "Comedy",
    description: "Comedy — celebration with humour, not headquarters entertainment.",
    kind: "conference"
  },
  {
    id: "music",
    title: "Music",
    description: "Music — live performances at House gatherings.",
    kind: "conference"
  },
  {
    id: "panel-sessions",
    title: "Panel Sessions",
    description: "Panel Sessions — expert conversations at the summit.",
    kind: "conference"
  },
  {
    id: "relationship-lessons",
    title: "Relationship Lessons",
    description: "Relationship Lessons — practical wisdom in workshop format.",
    kind: "workshop"
  },
  {
    id: "networking",
    title: "Networking",
    description: "Networking — dignified connections, never a dating expo.",
    kind: "networking"
  },
  {
    id: "artists",
    title: "Artists",
    description: "Artists — creative voices at Relationship Connect House.",
    kind: "conference"
  },
  {
    id: "entertainment",
    title: "Entertainment",
    description: "Entertainment — celebration nights at the House.",
    kind: "conference"
  },
  {
    id: "private-dinners",
    title: "Private Dinners",
    description: "Private Dinners — intimate meals after Connect gatherings.",
    kind: "workshop"
  }
];

export function getPreparedConnectHouseProgram(
  programId: PreparedConnectHouseProgramId
): PreparedConnectHouseProgramDefinition | undefined {
  return PREPARED_CONNECT_HOUSE_PROGRAMS.find((program) => program.id === programId);
}

export function getPreparedConnectHouseActivity(
  activityId: PreparedConnectHouseActivityId
): PreparedConnectHouseActivityDefinition | undefined {
  return PREPARED_CONNECT_HOUSE_ACTIVITIES.find((activity) => activity.id === activityId);
}
