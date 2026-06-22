import { PREPARED_HOUSE_LIBRARY_COLLECTIONS } from "../constants/houseLibrary";
import {
  listArchitectureAllCollections,
  listArchitectureBookCollections,
  listArchitecturePodcastCollections,
  listArchitectureResearchCollections,
  type BookCollectionCardViewModel,
  type PodcastCollectionCardViewModel,
  type ResearchCollectionCardViewModel
} from "./houseLibraryLogic";

export type HouseLibraryBundle = {
  bookCollections: BookCollectionCardViewModel[];
  researchCollections: ResearchCollectionCardViewModel[];
  podcastCollections: PodcastCollectionCardViewModel[];
  allCollections: ReturnType<typeof listArchitectureAllCollections>;
  collectionCount: number;
};

export function getHouseLibraryBundle(): HouseLibraryBundle {
  return {
    bookCollections: listArchitectureBookCollections(),
    researchCollections: listArchitectureResearchCollections(),
    podcastCollections: listArchitecturePodcastCollections(),
    allCollections: listArchitectureAllCollections(),
    collectionCount: PREPARED_HOUSE_LIBRARY_COLLECTIONS.length
  };
}
