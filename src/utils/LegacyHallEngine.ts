import { PREPARED_LEGACY_HALL_HONOURS } from "../constants/legacyHall";
import {
  listArchitectureFoundersFamilies,
  listArchitectureGoldenAnniversaries,
  listArchitectureLegacyCouples,
  type FoundersFamilyCardViewModel,
  type GoldenAnniversaryCardViewModel,
  type LegacyCoupleCardViewModel
} from "./legacyHallLogic";

export type LegacyHallBundle = {
  legacyCouples: LegacyCoupleCardViewModel[];
  goldenAnniversaries: GoldenAnniversaryCardViewModel[];
  foundersFamilies: FoundersFamilyCardViewModel[];
  honourCount: number;
};

export function getLegacyHallBundle(): LegacyHallBundle {
  return {
    legacyCouples: listArchitectureLegacyCouples(),
    goldenAnniversaries: listArchitectureGoldenAnniversaries(),
    foundersFamilies: listArchitectureFoundersFamilies(),
    honourCount: PREPARED_LEGACY_HALL_HONOURS.length
  };
}
