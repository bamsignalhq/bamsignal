import { CENTURY_ROOM_DISPLAYS } from "../constants/centuryRoom";
import {
  listArchitectureFoundingPrinciples,
  listArchitectureLegacyVision,
  type FoundingPrinciplesCardViewModel,
  type LegacyVisionCardViewModel
} from "./centuryRoomLogic";

export type CenturyRoomBundle = {
  foundingPrinciples: FoundingPrinciplesCardViewModel[];
  legacyVision: LegacyVisionCardViewModel[];
  displayCount: number;
};

export function getCenturyRoomBundle(): CenturyRoomBundle {
  return {
    foundingPrinciples: listArchitectureFoundingPrinciples(),
    legacyVision: listArchitectureLegacyVision(),
    displayCount: CENTURY_ROOM_DISPLAYS.length
  };
}
