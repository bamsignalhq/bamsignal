/** Great Room™ — warm conversation spaces at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const GREAT_ROOM_TITLE = "Great Room™";
export const GREAT_ROOM_LABEL = "Great Room";
export const GREAT_ROOM_CARD_LABEL = "Great Room";
export const CONVERSATION_AREA_LABEL = "Conversation Area";

export const GREAT_ROOM_STYLE_TRAITS = ["Warm", "Elegant", "Timeless"] as const;

export type GreatRoomStyleTrait = (typeof GREAT_ROOM_STYLE_TRAITS)[number];

export const GREAT_ROOM_SUBCOPY =
  "The Great Room™ at The BamSignal House™ — Warm, Elegant, and Timeless spaces for meaningful connection.";
export const GREAT_ROOM_PURPOSE_COPY =
  "Prepare Great Room architecture — conversation areas for meaningful dialogue, not headquarters lounges.";
export const GREAT_ROOM_RESERVED_COPY =
  "Architecture prepared. Great Room spaces and conversation areas are not enabled yet.";

export { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL, GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedGreatRoomPurposeId =
  | "meaningful-conversations"
  | "networking"
  | "mentorship"
  | "gatherings";

export type PreparedGreatRoomPurposeDefinition = {
  id: PreparedGreatRoomPurposeId;
  title: string;
  description: string;
};

export const PREPARED_GREAT_ROOM_PURPOSES: PreparedGreatRoomPurposeDefinition[] = [
  {
    id: "meaningful-conversations",
    title: "Meaningful conversations",
    description: "Meaningful conversations — depth over noise in a Warm, Elegant setting."
  },
  {
    id: "networking",
    title: "Networking",
    description: "Networking — dignified introductions, never transactional headquarters mixers."
  },
  {
    id: "mentorship",
    title: "Mentorship",
    description: "Mentorship — guided growth across generations in Timeless spaces."
  },
  {
    id: "gatherings",
    title: "Gatherings",
    description: "Gatherings — Community assembled with care, not branch office events."
  }
];

export type PreparedConversationAreaId =
  | "fireside-circle"
  | "introduction-lounge"
  | "mentors-alcove"
  | "community-salon";

export type PreparedConversationAreaDefinition = {
  id: PreparedConversationAreaId;
  title: string;
  description: string;
  purposeId: PreparedGreatRoomPurposeId;
};

export const PREPARED_CONVERSATION_AREAS: PreparedConversationAreaDefinition[] = [
  {
    id: "fireside-circle",
    title: "Fireside Circle",
    description: "Fireside Circle — intimate seating for meaningful conversations.",
    purposeId: "meaningful-conversations"
  },
  {
    id: "introduction-lounge",
    title: "Introduction Lounge",
    description: "Introduction Lounge — Elegant networking without the sales floor.",
    purposeId: "networking"
  },
  {
    id: "mentors-alcove",
    title: "Mentor's Alcove",
    description: "Mentor's Alcove — quiet mentorship corners reserved at the House.",
    purposeId: "mentorship"
  },
  {
    id: "community-salon",
    title: "Community Salon",
    description: "Community Salon — Timeless Gatherings for households and friends.",
    purposeId: "gatherings"
  }
];

export function getPreparedGreatRoomPurpose(
  purposeId: PreparedGreatRoomPurposeId
): PreparedGreatRoomPurposeDefinition | undefined {
  return PREPARED_GREAT_ROOM_PURPOSES.find((purpose) => purpose.id === purposeId);
}

export function getPreparedConversationArea(
  areaId: PreparedConversationAreaId
): PreparedConversationAreaDefinition | undefined {
  return PREPARED_CONVERSATION_AREAS.find((area) => area.id === areaId);
}
