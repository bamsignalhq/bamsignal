/** Ballroom™ — grand gatherings at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const BALLROOM_TITLE = "Ballroom™";
export const BALLROOM_LABEL = "Ballroom";
export const BALLROOM_EVENT_LABEL = "Event";
export const BALLROOM_SUMMIT_LABEL = "Summit";
export const BALLROOM_CELEBRATION_LABEL = "Celebration";
export const BALLROOM_HOST_LABEL = "Host";

export const BALLROOM_SUBCOPY =
  "The Ballroom™ at The BamSignal House™ — Summits, Awards, Galas, and Legacy Celebrations with dignity.";
export const BALLROOM_PURPOSE_COPY =
  "Prepare Ballroom architecture — grand gatherings reserved, not headquarters ballrooms or branch halls.";
export const BALLROOM_RESERVED_COPY =
  "Architecture prepared. Ballroom events and celebrations are not enabled yet.";
export const BALLROOM_HOST_COPY =
  "The Ballroom hosts Summits, Awards, Galas, Legacy Celebrations, and Wedding Anniversaries.";

export { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL, GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedBallroomHostKind = "event" | "summit" | "celebration";

export type PreparedBallroomHostId =
  | "summits"
  | "awards"
  | "galas"
  | "legacy-celebrations"
  | "wedding-anniversaries";

export type PreparedBallroomHostDefinition = {
  id: PreparedBallroomHostId;
  title: string;
  description: string;
  kind: PreparedBallroomHostKind;
};

export const PREPARED_BALLROOM_HOSTS: PreparedBallroomHostDefinition[] = [
  {
    id: "summits",
    title: "Summits",
    description: "Summits — flagship gatherings at the Ballroom, not conventions.",
    kind: "summit"
  },
  {
    id: "awards",
    title: "Awards",
    description: "Awards — honouring Legacy and excellence with dignity.",
    kind: "event"
  },
  {
    id: "galas",
    title: "Galas",
    description: "Galas — elegant evenings at The BamSignal House™.",
    kind: "event"
  },
  {
    id: "legacy-celebrations",
    title: "Legacy Celebrations",
    description: "Legacy Celebrations — multi-generational milestones in the Ballroom.",
    kind: "celebration"
  },
  {
    id: "wedding-anniversaries",
    title: "Wedding Anniversaries",
    description: "Wedding Anniversaries — timeless unions celebrated with Community.",
    kind: "celebration"
  }
];

export function getPreparedBallroomHost(
  hostId: PreparedBallroomHostId
): PreparedBallroomHostDefinition | undefined {
  return PREPARED_BALLROOM_HOSTS.find((host) => host.id === hostId);
}
