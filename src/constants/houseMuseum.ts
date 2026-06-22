/** House Museum™ — preserved exhibits and archives at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const HOUSE_MUSEUM_TITLE = "House Museum™";
export const HOUSE_MUSEUM_LABEL = "House Museum";
export const EXHIBIT_LABEL = "Exhibit";
export const ARCHIVE_LABEL = "Archive";

export const HOUSE_MUSEUM_SUBCOPY =
  "House Museum™ at The BamSignal House™ — Love Stories, Wedding Traditions, Legacy Families, Diaspora Journeys, and African Family Culture preserved with dignity.";
export const HOUSE_MUSEUM_PURPOSE_COPY =
  "Prepare House Museum architecture — exhibits and archives documented, not physical collections yet.";
export const HOUSE_MUSEUM_RESERVED_COPY =
  "Architecture prepared. House Museum exhibits and archives are not enabled yet.";

export {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
};

export type PreservedMuseumCollectionId =
  | "love-stories"
  | "wedding-traditions"
  | "legacy-families"
  | "diaspora-journeys"
  | "african-family-culture";

export type PreservedMuseumCollectionDefinition = {
  id: PreservedMuseumCollectionId;
  title: string;
  description: string;
  collectionOrder: number;
};

export const PRESERVED_EXHIBITS: PreservedMuseumCollectionDefinition[] = [
  {
    id: "love-stories",
    title: "Love Stories",
    description: "Love Stories — relationship narratives preserved at The BamSignal House™.",
    collectionOrder: 1
  },
  {
    id: "wedding-traditions",
    title: "Wedding Traditions",
    description: "Wedding Traditions — ceremonial heritage exhibit architecture reserved.",
    collectionOrder: 2
  },
  {
    id: "legacy-families",
    title: "Legacy Families",
    description: "Legacy Families — multi-generational family exhibits prepared, not pedigree theatre.",
    collectionOrder: 3
  }
];

export const PRESERVED_ARCHIVES: PreservedMuseumCollectionDefinition[] = [
  {
    id: "diaspora-journeys",
    title: "Diaspora Journeys",
    description: "Diaspora Journeys — corridor and migration archives preserved with dignity.",
    collectionOrder: 4
  },
  {
    id: "african-family-culture",
    title: "African Family Culture",
    description: "African Family Culture — cultural archive architecture at the House, not folklore storage.",
    collectionOrder: 5
  }
];

export const PRESERVED_MUSEUM_COLLECTIONS: PreservedMuseumCollectionDefinition[] = [
  ...PRESERVED_EXHIBITS,
  ...PRESERVED_ARCHIVES
].sort((a, b) => a.collectionOrder - b.collectionOrder);

export function getPreservedMuseumCollection(
  collectionId: PreservedMuseumCollectionId
): PreservedMuseumCollectionDefinition | undefined {
  return PRESERVED_MUSEUM_COLLECTIONS.find((collection) => collection.id === collectionId);
}
