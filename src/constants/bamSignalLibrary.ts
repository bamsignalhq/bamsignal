/** BamSignal Library™ — relationship resource architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const BAMSIGNAL_LIBRARY_TITLE = "BamSignal Library™";
export const BAMSIGNAL_LIBRARY_LABEL = "BamSignal Library";
export const LIBRARY_RESOURCE_LABEL = "Resource";

export const BAMSIGNAL_LIBRARY_SUBCOPY =
  "Relationship wisdom in one place — books, stories, and research prepared with dignity, not a content catalog.";
export const BAMSIGNAL_LIBRARY_PURPOSE_COPY =
  "Prepare BamSignal Library collections — relationship resources for every family, not downloads or streaming yet.";
export const BAMSIGNAL_LIBRARY_RESERVED_COPY =
  "Architecture prepared. Recommendations and bookmarks are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type LibraryResourceCategoryId =
  | "books"
  | "articles"
  | "podcasts"
  | "videos"
  | "research"
  | "family-stories";

export type PreparedLibraryCategoryDefinition = {
  id: LibraryResourceCategoryId;
  title: string;
  description: string;
};

export const PREPARED_LIBRARY_CATEGORIES: PreparedLibraryCategoryDefinition[] = [
  {
    id: "books",
    title: "Books",
    description: "Books — relationship wisdom curated with dignity."
  },
  {
    id: "articles",
    title: "Articles",
    description: "Articles — thoughtful reading, not clickbait."
  },
  {
    id: "podcasts",
    title: "Podcasts",
    description: "Podcasts — growing together through listening."
  },
  {
    id: "videos",
    title: "Videos",
    description: "Videos — visual learning with respectful framing."
  },
  {
    id: "research",
    title: "Research",
    description: "Research — evidence and insight for families."
  },
  {
    id: "family-stories",
    title: "Family Stories",
    description: "Family stories — legacy and wisdom preserved."
  }
];

export type PreparedBookId = "reserved-book-wisdom";

export type PreparedBookDefinition = {
  id: PreparedBookId;
  title: string;
  author: string;
  description: string;
  categoryId: "books";
};

export const PREPARED_BOOKS: PreparedBookDefinition[] = [
  {
    id: "reserved-book-wisdom",
    title: "Reserved title",
    author: "Reserved author",
    description: "Books collection — architecture prepared, not published yet.",
    categoryId: "books"
  }
];

export type PreparedPodcastId = "reserved-podcast-voices";

export type PreparedPodcastDefinition = {
  id: PreparedPodcastId;
  title: string;
  host: string;
  description: string;
  categoryId: "podcasts";
};

export const PREPARED_PODCASTS: PreparedPodcastDefinition[] = [
  {
    id: "reserved-podcast-voices",
    title: "Reserved series",
    host: "Reserved host",
    description: "Podcasts collection — architecture prepared, not streaming yet.",
    categoryId: "podcasts"
  }
];

export type PreparedResourceId =
  | "reserved-article-insight"
  | "reserved-video-guide"
  | "reserved-research-brief"
  | "reserved-family-story";

export type PreparedResourceDefinition = {
  id: PreparedResourceId;
  title: string;
  description: string;
  categoryId: Exclude<LibraryResourceCategoryId, "books" | "podcasts">;
  categoryTitle: string;
};

export const PREPARED_RESOURCES: PreparedResourceDefinition[] = [
  {
    id: "reserved-article-insight",
    title: "Reserved article",
    description: "Articles collection — thoughtful reading prepared, not live yet.",
    categoryId: "articles",
    categoryTitle: "Articles"
  },
  {
    id: "reserved-video-guide",
    title: "Reserved video",
    description: "Videos collection — visual learning prepared, not streaming yet.",
    categoryId: "videos",
    categoryTitle: "Videos"
  },
  {
    id: "reserved-research-brief",
    title: "Reserved research",
    description: "Research collection — evidence prepared, not published yet.",
    categoryId: "research",
    categoryTitle: "Research"
  },
  {
    id: "reserved-family-story",
    title: "Reserved family story",
    description: "Family stories collection — legacy prepared, not shared yet.",
    categoryId: "family-stories",
    categoryTitle: "Family Stories"
  }
];

export type BamSignalLibraryFutureCapabilityId = "recommendations" | "bookmarks";

export const BAMSIGNAL_LIBRARY_FUTURE_CAPABILITIES: {
  id: BamSignalLibraryFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "recommendations",
    label: "Recommendations",
    description: "Reserved — personalized recommendations with dignity, not algorithmic feeds."
  },
  {
    id: "bookmarks",
    label: "Bookmarks",
    description: "Reserved — saved resources — never surveillance or tracking framing."
  }
];

export function getPreparedLibraryCategory(
  categoryId: LibraryResourceCategoryId
): PreparedLibraryCategoryDefinition | undefined {
  return PREPARED_LIBRARY_CATEGORIES.find((category) => category.id === categoryId);
}
