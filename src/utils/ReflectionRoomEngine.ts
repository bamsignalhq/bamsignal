import {
  PREPARED_FAITH_RESPECT_TRADITIONS,
  PREPARED_REFLECTION_PURPOSES
} from "../constants/reflectionRoom";
import {
  listArchitectureMeditationPurposes,
  listArchitecturePrayerPurposes,
  listArchitectureReflectionPurposes,
  type MeditationCardViewModel,
  type PrayerCardViewModel,
  type ReflectionCardViewModel
} from "./reflectionRoomLogic";

export type ReflectionRoomBundle = {
  prayerPurposes: PrayerCardViewModel[];
  reflectionPurposes: ReflectionCardViewModel[];
  meditationPurposes: MeditationCardViewModel[];
  purposeCount: number;
  faithTraditionCount: number;
};

export function getReflectionRoomBundle(): ReflectionRoomBundle {
  return {
    prayerPurposes: listArchitecturePrayerPurposes(),
    reflectionPurposes: listArchitectureReflectionPurposes(),
    meditationPurposes: listArchitectureMeditationPurposes(),
    purposeCount: PREPARED_REFLECTION_PURPOSES.length,
    faithTraditionCount: PREPARED_FAITH_RESPECT_TRADITIONS.length
  };
}
