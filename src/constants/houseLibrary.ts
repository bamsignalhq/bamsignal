/** House Library™ — curated collections at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const HOUSE_LIBRARY_TITLE = "House Library™";
export const HOUSE_LIBRARY_LABEL = "House Library";
export const BOOK_COLLECTION_LABEL = "Book Collection";
export const RESEARCH_COLLECTION_LABEL = "Research Collection";
export const PODCAST_COLLECTION_LABEL = "Podcast Collection";

export const HOUSE_LIBRARY_SUBCOPY =
  "The House Library™ at The BamSignal House™ — books, research, podcasts, and legacy stories for Learning and Legacy.";
export const HOUSE_LIBRARY_PURPOSE_COPY =
  "Prepare House Library architecture — curated collections reserved, not lending or streaming yet.";
export const HOUSE_LIBRARY_RESERVED_COPY =
  "Architecture prepared. House Library collections are not enabled yet.";

export { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL, GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedHouseLibraryCollectionKind = "book" | "research" | "podcast";

export type PreparedHouseLibraryCollectionId =
  | "relationship-books"
  | "family-books"
  | "research-reports"
  | "podcasts"
  | "documentaries"
  | "legacy-stories";

export type PreparedHouseLibraryCollectionDefinition = {
  id: PreparedHouseLibraryCollectionId;
  title: string;
  description: string;
  kind: PreparedHouseLibraryCollectionKind;
};

export const PREPARED_HOUSE_LIBRARY_COLLECTIONS: PreparedHouseLibraryCollectionDefinition[] = [
  {
    id: "relationship-books",
    title: "Relationship Books",
    description: "Relationship Books — curated reading for understanding partnerships with dignity.",
    kind: "book"
  },
  {
    id: "family-books",
    title: "Family Books",
    description: "Family Books — household wisdom and multi-generational stories at the House.",
    kind: "book"
  },
  {
    id: "research-reports",
    title: "Research Reports",
    description: "Research Reports — Institute insights reserved for the House Library shelves.",
    kind: "research"
  },
  {
    id: "podcasts",
    title: "Podcasts",
    description: "Podcasts — audio learning for Community Gatherings, not headquarters broadcasts.",
    kind: "podcast"
  },
  {
    id: "documentaries",
    title: "Documentaries",
    description: "Documentaries — visual Legacy storytelling prepared for the House.",
    kind: "podcast"
  },
  {
    id: "legacy-stories",
    title: "Legacy Stories",
    description: "Legacy Stories — enduring narratives honoured in the House Library.",
    kind: "podcast"
  }
];

export function getPreparedHouseLibraryCollection(
  collectionId: PreparedHouseLibraryCollectionId
): PreparedHouseLibraryCollectionDefinition | undefined {
  return PREPARED_HOUSE_LIBRARY_COLLECTIONS.find((collection) => collection.id === collectionId);
}
