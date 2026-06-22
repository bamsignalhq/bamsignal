import type {
  PreparedConversationAreaDefinition,
  PreparedGreatRoomPurposeDefinition,
  PreparedConversationAreaId,
  PreparedGreatRoomPurposeId
} from "../constants/greatRoom";
import {
  CONVERSATION_AREA_LABEL,
  GREAT_ROOM_CARD_LABEL,
  PREPARED_CONVERSATION_AREAS,
  PREPARED_GREAT_ROOM_PURPOSES
} from "../constants/greatRoom";

export type GreatRoomCardViewModel = {
  id: PreparedGreatRoomPurposeId;
  title: string;
  description: string;
  roomLabel: string;
  statusLabel: string;
};

export type ConversationAreaCardViewModel = {
  id: PreparedConversationAreaId;
  title: string;
  description: string;
  purposeTitle: string;
  areaLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildGreatRoomCardViewModel(
  purpose: PreparedGreatRoomPurposeDefinition
): GreatRoomCardViewModel {
  return {
    id: purpose.id,
    title: purpose.title,
    description: purpose.description,
    roomLabel: GREAT_ROOM_CARD_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildConversationAreaCardViewModel(
  area: PreparedConversationAreaDefinition
): ConversationAreaCardViewModel {
  const purpose = PREPARED_GREAT_ROOM_PURPOSES.find((item) => item.id === area.purposeId);
  return {
    id: area.id,
    title: area.title,
    description: area.description,
    purposeTitle: purpose?.title ?? area.purposeId,
    areaLabel: CONVERSATION_AREA_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureGreatRooms(): GreatRoomCardViewModel[] {
  return PREPARED_GREAT_ROOM_PURPOSES.map(buildGreatRoomCardViewModel);
}

export function listArchitectureConversationAreas(): ConversationAreaCardViewModel[] {
  return PREPARED_CONVERSATION_AREAS.map(buildConversationAreaCardViewModel);
}
