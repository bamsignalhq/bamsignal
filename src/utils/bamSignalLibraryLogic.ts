import type {
  PreparedBookDefinition,
  PreparedBookId,
  PreparedPodcastDefinition,
  PreparedPodcastId,
  PreparedResourceDefinition,
  PreparedResourceId
} from "../constants/bamSignalLibrary";
import { PREPARED_BOOKS, PREPARED_PODCASTS, PREPARED_RESOURCES } from "../constants/bamSignalLibrary";

export type BookViewModel = {
  id: PreparedBookId;
  title: string;
  author: string;
  description: string;
  statusLabel: string;
};

export type PodcastViewModel = {
  id: PreparedPodcastId;
  title: string;
  host: string;
  description: string;
  statusLabel: string;
};

export type ResourceViewModel = {
  id: PreparedResourceId;
  title: string;
  description: string;
  categoryTitle: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildBookViewModel(book: PreparedBookDefinition): BookViewModel {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildPodcastViewModel(podcast: PreparedPodcastDefinition): PodcastViewModel {
  return {
    id: podcast.id,
    title: podcast.title,
    host: podcast.host,
    description: podcast.description,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildResourceViewModel(resource: PreparedResourceDefinition): ResourceViewModel {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    categoryTitle: resource.categoryTitle,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureBooks(): BookViewModel[] {
  return [...PREPARED_BOOKS.map(buildBookViewModel)].sort((a, b) => a.title.localeCompare(b.title));
}

export function listArchitecturePodcasts(): PodcastViewModel[] {
  return [...PREPARED_PODCASTS.map(buildPodcastViewModel)].sort((a, b) => a.title.localeCompare(b.title));
}

export function listArchitectureResources(): ResourceViewModel[] {
  return [...PREPARED_RESOURCES.map(buildResourceViewModel)].sort((a, b) =>
    a.categoryTitle.localeCompare(b.categoryTitle)
  );
}
