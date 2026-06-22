import { ARCHIVE_REGIONS, PRESERVED_ARCHIVE_CATEGORIES } from "../constants/africanRelationshipArchive";
import {
  listArchitectureArchiveEntries,
  listArchitectureArchiveRegions,
  listCultureStoryEntries,
  listDiasporaJourneyEntries,
  listFaithInfluenceEntries,
  listTraditionEntries,
  type ArchiveEntryViewModel,
  type ArchiveRegionViewModel
} from "./africanRelationshipArchiveLogic";

export type AfricanRelationshipArchiveBundle = {
  regions: ArchiveRegionViewModel[];
  entries: ArchiveEntryViewModel[];
  cultureStories: ArchiveEntryViewModel[];
  traditions: ArchiveEntryViewModel[];
  diasporaJourneys: ArchiveEntryViewModel[];
  faithInfluences: ArchiveEntryViewModel[];
  categoryCount: number;
  regionCount: number;
};

export function getAfricanRelationshipArchiveBundle(): AfricanRelationshipArchiveBundle {
  return {
    regions: listArchitectureArchiveRegions(),
    entries: listArchitectureArchiveEntries(),
    cultureStories: listCultureStoryEntries(),
    traditions: listTraditionEntries(),
    diasporaJourneys: listDiasporaJourneyEntries(),
    faithInfluences: listFaithInfluenceEntries(),
    categoryCount: PRESERVED_ARCHIVE_CATEGORIES.length,
    regionCount: ARCHIVE_REGIONS.length
  };
}
