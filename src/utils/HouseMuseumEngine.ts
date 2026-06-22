import { PRESERVED_MUSEUM_COLLECTIONS } from "../constants/houseMuseum";
import {
  listArchitectureArchives,
  listArchitectureExhibits,
  type ArchiveCardViewModel,
  type ExhibitCardViewModel
} from "./houseMuseumLogic";

export type HouseMuseumBundle = {
  exhibits: ExhibitCardViewModel[];
  archives: ArchiveCardViewModel[];
  collectionCount: number;
};

export function getHouseMuseumBundle(): HouseMuseumBundle {
  return {
    exhibits: listArchitectureExhibits(),
    archives: listArchitectureArchives(),
    collectionCount: PRESERVED_MUSEUM_COLLECTIONS.length
  };
}
