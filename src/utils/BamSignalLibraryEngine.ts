import { PREPARED_LIBRARY_CATEGORIES } from "../constants/bamSignalLibrary";
import {
  listArchitectureBooks,
  listArchitecturePodcasts,
  listArchitectureResources,
  type BookViewModel,
  type PodcastViewModel,
  type ResourceViewModel
} from "./bamSignalLibraryLogic";

export type BamSignalLibraryBundle = {
  books: BookViewModel[];
  podcasts: PodcastViewModel[];
  resources: ResourceViewModel[];
  categoryCount: number;
};

export function getBamSignalLibraryBundle(): BamSignalLibraryBundle {
  return {
    books: listArchitectureBooks(),
    podcasts: listArchitecturePodcasts(),
    resources: listArchitectureResources(),
    categoryCount: PREPARED_LIBRARY_CATEGORIES.length
  };
}
