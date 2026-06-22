import type {
  PreservedMuseumCollectionDefinition,
  PreservedMuseumCollectionId
} from "../constants/houseMuseum";
import {
  ARCHIVE_LABEL,
  EXHIBIT_LABEL,
  PRESERVED_ARCHIVES,
  PRESERVED_EXHIBITS
} from "../constants/houseMuseum";

export type ExhibitCardViewModel = {
  id: PreservedMuseumCollectionId;
  title: string;
  description: string;
  exhibitLabel: string;
  collectionOrder: number;
  statusLabel: string;
};

export type ArchiveCardViewModel = {
  id: PreservedMuseumCollectionId;
  title: string;
  description: string;
  archiveLabel: string;
  collectionOrder: number;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildExhibitCardViewModel(
  collection: PreservedMuseumCollectionDefinition
): ExhibitCardViewModel {
  return {
    id: collection.id,
    title: collection.title,
    description: collection.description,
    exhibitLabel: EXHIBIT_LABEL,
    collectionOrder: collection.collectionOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildArchiveCardViewModel(
  collection: PreservedMuseumCollectionDefinition
): ArchiveCardViewModel {
  return {
    id: collection.id,
    title: collection.title,
    description: collection.description,
    archiveLabel: ARCHIVE_LABEL,
    collectionOrder: collection.collectionOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureExhibits(): ExhibitCardViewModel[] {
  return [...PRESERVED_EXHIBITS]
    .sort((a, b) => a.collectionOrder - b.collectionOrder)
    .map(buildExhibitCardViewModel);
}

export function listArchitectureArchives(): ArchiveCardViewModel[] {
  return [...PRESERVED_ARCHIVES]
    .sort((a, b) => a.collectionOrder - b.collectionOrder)
    .map(buildArchiveCardViewModel);
}
