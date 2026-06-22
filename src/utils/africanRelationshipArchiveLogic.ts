import type {
  ArchiveRegionDefinition,
  ArchiveRegionId,
  PreparedArchiveEntryDefinition
} from "../constants/africanRelationshipArchive";
import {
  ARCHIVE_REGIONS,
  PREPARED_ARCHIVE_ENTRIES,
  getArchiveRegion,
  getPreservedArchiveCategory
} from "../constants/africanRelationshipArchive";

export type ArchiveRegionViewModel = {
  id: ArchiveRegionId;
  label: string;
  description: string;
  statusLabel: string;
};

export type ArchiveEntryViewModel = {
  id: string;
  title: string;
  summary: string;
  categoryLabel: string;
  regionLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not published yet";

export function buildArchiveRegionViewModel(region: ArchiveRegionDefinition): ArchiveRegionViewModel {
  return {
    id: region.id,
    label: region.label,
    description: region.description,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildArchiveEntryViewModel(entry: PreparedArchiveEntryDefinition): ArchiveEntryViewModel {
  const category = getPreservedArchiveCategory(entry.categoryId);
  const region = getArchiveRegion(entry.regionId);
  return {
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    categoryLabel: category?.label ?? entry.categoryId,
    regionLabel: region?.label ?? entry.regionId,
    statusLabel: ARCHITECTURE_STATUS
  };
}

function sortEntriesByTitle(entries: ArchiveEntryViewModel[]): ArchiveEntryViewModel[] {
  return [...entries].sort((a, b) => a.title.localeCompare(b.title));
}

function sortRegionsByLabel(regions: ArchiveRegionViewModel[]): ArchiveRegionViewModel[] {
  return [...regions].sort((a, b) => a.label.localeCompare(b.label));
}

export function listArchitectureArchiveRegions(): ArchiveRegionViewModel[] {
  return sortRegionsByLabel(ARCHIVE_REGIONS.map(buildArchiveRegionViewModel));
}

export function listArchitectureArchiveEntries(): ArchiveEntryViewModel[] {
  return sortEntriesByTitle(PREPARED_ARCHIVE_ENTRIES.map(buildArchiveEntryViewModel));
}

function listEntriesByKind(kind: PreparedArchiveEntryDefinition["kind"]): ArchiveEntryViewModel[] {
  return sortEntriesByTitle(
    PREPARED_ARCHIVE_ENTRIES.filter((entry) => entry.kind === kind).map(buildArchiveEntryViewModel)
  );
}

export function listCultureStoryEntries(): ArchiveEntryViewModel[] {
  return listEntriesByKind("culture-story");
}

export function listTraditionEntries(): ArchiveEntryViewModel[] {
  return listEntriesByKind("tradition");
}

export function listDiasporaJourneyEntries(): ArchiveEntryViewModel[] {
  return listEntriesByKind("diaspora-journey");
}

export function listFaithInfluenceEntries(): ArchiveEntryViewModel[] {
  return listEntriesByKind("faith-influence");
}
