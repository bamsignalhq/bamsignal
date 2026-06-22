import type {
  PreparedHouseLibraryCollectionDefinition,
  PreparedHouseLibraryCollectionId
} from "../constants/houseLibrary";
import {
  BOOK_COLLECTION_LABEL,
  PODCAST_COLLECTION_LABEL,
  PREPARED_HOUSE_LIBRARY_COLLECTIONS,
  RESEARCH_COLLECTION_LABEL
} from "../constants/houseLibrary";

export type BookCollectionCardViewModel = {
  id: PreparedHouseLibraryCollectionId;
  title: string;
  description: string;
  collectionLabel: string;
  statusLabel: string;
};

export type ResearchCollectionCardViewModel = {
  id: PreparedHouseLibraryCollectionId;
  title: string;
  description: string;
  collectionLabel: string;
  statusLabel: string;
};

export type PodcastCollectionCardViewModel = {
  id: PreparedHouseLibraryCollectionId;
  title: string;
  description: string;
  collectionLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildBookCollectionCardViewModel(
  collection: PreparedHouseLibraryCollectionDefinition
): BookCollectionCardViewModel {
  return {
    id: collection.id,
    title: collection.title,
    description: collection.description,
    collectionLabel: BOOK_COLLECTION_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildResearchCollectionCardViewModel(
  collection: PreparedHouseLibraryCollectionDefinition
): ResearchCollectionCardViewModel {
  return {
    id: collection.id,
    title: collection.title,
    description: collection.description,
    collectionLabel: RESEARCH_COLLECTION_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildPodcastCollectionCardViewModel(
  collection: PreparedHouseLibraryCollectionDefinition
): PodcastCollectionCardViewModel {
  return {
    id: collection.id,
    title: collection.title,
    description: collection.description,
    collectionLabel: PODCAST_COLLECTION_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureBookCollections(): BookCollectionCardViewModel[] {
  return PREPARED_HOUSE_LIBRARY_COLLECTIONS.filter((collection) => collection.kind === "book").map(
    buildBookCollectionCardViewModel
  );
}

export function listArchitectureResearchCollections(): ResearchCollectionCardViewModel[] {
  return PREPARED_HOUSE_LIBRARY_COLLECTIONS.filter(
    (collection) => collection.kind === "research"
  ).map(buildResearchCollectionCardViewModel);
}

export function listArchitecturePodcastCollections(): PodcastCollectionCardViewModel[] {
  return PREPARED_HOUSE_LIBRARY_COLLECTIONS.filter(
    (collection) => collection.kind === "podcast"
  ).map(buildPodcastCollectionCardViewModel);
}

export function listArchitectureAllCollections(): PreparedHouseLibraryCollectionDefinition[] {
  return [...PREPARED_HOUSE_LIBRARY_COLLECTIONS].sort((a, b) => a.title.localeCompare(b.title));
}
