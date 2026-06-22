import {
  GREAT_ROOM_STYLE_TRAITS,
  PREPARED_CONVERSATION_AREAS,
  PREPARED_GREAT_ROOM_PURPOSES
} from "../constants/greatRoom";
import {
  listArchitectureConversationAreas,
  listArchitectureGreatRooms,
  type ConversationAreaCardViewModel,
  type GreatRoomCardViewModel
} from "./greatRoomLogic";

export type GreatRoomBundle = {
  greatRooms: GreatRoomCardViewModel[];
  conversationAreas: ConversationAreaCardViewModel[];
  purposeCount: number;
  conversationAreaCount: number;
  styleTraits: readonly string[];
};

export function getGreatRoomBundle(): GreatRoomBundle {
  return {
    greatRooms: listArchitectureGreatRooms(),
    conversationAreas: listArchitectureConversationAreas(),
    purposeCount: PREPARED_GREAT_ROOM_PURPOSES.length,
    conversationAreaCount: PREPARED_CONVERSATION_AREAS.length,
    styleTraits: GREAT_ROOM_STYLE_TRAITS
  };
}

export function getGreatRoomPurpose(purposeId: string): GreatRoomCardViewModel | null {
  return listArchitectureGreatRooms().find((room) => room.id === purposeId) ?? null;
}
