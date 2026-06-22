/** African Relationship Archive™ — preserve African relationship culture architecture. */

import { AFRICAN_RELATIONSHIP_CULTURE_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const AFRICAN_RELATIONSHIP_ARCHIVE_TITLE = "African Relationship Archive™";
export const AFRICAN_RELATIONSHIP_ARCHIVE_LABEL = "African Relationship Archive";
export const CULTURAL_HERITAGE_LABEL = "Cultural Heritage";
export const FAMILY_TRADITIONS_LABEL = "Family Traditions";
export const JOURNEY_STORIES_LABEL = "Journey Stories";

export const AFRICAN_RELATIONSHIP_ARCHIVE_SUBCOPY =
  "Preserve African relationship culture for generations — cultural heritage first, never a database or history log.";
export const AFRICAN_RELATIONSHIP_ARCHIVE_PURPOSE_COPY =
  "Preserve African relationship culture for generations — family traditions and journey stories with dignity.";
export const AFRICAN_RELATIONSHIP_ARCHIVE_RESERVED_COPY =
  "Architecture prepared. Museums, books, films, podcasts, and academic studies are not enabled yet.";

/** Reserved — never use in member-facing copy. */
export const AFRICAN_RELATIONSHIP_ARCHIVE_AVOID_COPY = ["Database", "Repository", "History Log"] as const;

export { AFRICAN_RELATIONSHIP_CULTURE_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreservedArchiveCategoryId =
  | "love-stories"
  | "wedding-traditions"
  | "family-values"
  | "diaspora-journeys"
  | "faith-influences"
  | "cultural-practices"
  | "language-traditions"
  | "courtship-customs"
  | "intertribal-marriages"
  | "cross-border-relationships";

export type PreservedArchiveCategoryDefinition = {
  id: PreservedArchiveCategoryId;
  label: string;
  description: string;
};

export const PRESERVED_ARCHIVE_CATEGORIES: PreservedArchiveCategoryDefinition[] = [
  {
    id: "love-stories",
    label: "Love stories",
    description: "Love stories preserved — journey stories with consent and dignity."
  },
  {
    id: "wedding-traditions",
    label: "Wedding traditions",
    description: "Wedding traditions — family traditions honored across generations."
  },
  {
    id: "family-values",
    label: "Family values",
    description: "Family values archived — cultural heritage first."
  },
  {
    id: "diaspora-journeys",
    label: "Diaspora journeys",
    description: "Diaspora journeys — Journey Across Borders with care."
  },
  {
    id: "faith-influences",
    label: "Faith influences",
    description: "Faith influences on relationships — respectful preservation."
  },
  {
    id: "cultural-practices",
    label: "Cultural practices",
    description: "Cultural practices — never a repository or history log."
  },
  {
    id: "language-traditions",
    label: "Language traditions",
    description: "Language traditions in courtship and marriage."
  },
  {
    id: "courtship-customs",
    label: "Courtship customs",
    description: "Courtship customs preserved for future generations."
  },
  {
    id: "intertribal-marriages",
    label: "Intertribal marriages",
    description: "Intertribal marriages — cultural heritage across communities."
  },
  {
    id: "cross-border-relationships",
    label: "Cross-border relationships",
    description: "Cross-border relationships — diaspora and corridor journeys."
  }
];

export type ArchiveRegionId =
  | "west-africa"
  | "east-africa"
  | "southern-africa"
  | "north-africa"
  | "central-africa"
  | "diaspora-communities";

export type ArchiveRegionDefinition = {
  id: ArchiveRegionId;
  label: string;
  description: string;
};

export const ARCHIVE_REGIONS: ArchiveRegionDefinition[] = [
  {
    id: "west-africa",
    label: "West Africa",
    description: "West African relationship culture — cultural heritage preserved."
  },
  {
    id: "east-africa",
    label: "East Africa",
    description: "East African traditions — family traditions for generations."
  },
  {
    id: "southern-africa",
    label: "Southern Africa",
    description: "Southern African journeys — journey stories with dignity."
  },
  {
    id: "north-africa",
    label: "North Africa",
    description: "North African relationship culture — respectful preservation."
  },
  {
    id: "central-africa",
    label: "Central Africa",
    description: "Central African heritage — never a database framing."
  },
  {
    id: "diaspora-communities",
    label: "Diaspora Communities",
    description: "Diaspora communities — cross-border relationship archives."
  }
];

export type ArchiveEntryKind =
  | "culture-story"
  | "tradition"
  | "diaspora-journey"
  | "faith-influence";

export type PreparedArchiveEntryDefinition = {
  id: string;
  title: string;
  summary: string;
  kind: ArchiveEntryKind;
  categoryId: PreservedArchiveCategoryId;
  regionId: ArchiveRegionId;
};

export const PREPARED_ARCHIVE_ENTRIES: PreparedArchiveEntryDefinition[] = [
  {
    id: "ara_love_stories",
    title: "Reserved love story",
    summary: "Love story archive — journey stories, not a history log.",
    kind: "culture-story",
    categoryId: "love-stories",
    regionId: "west-africa"
  },
  {
    id: "ara_wedding_traditions",
    title: "Reserved wedding tradition",
    summary: "Wedding tradition — family traditions preserved.",
    kind: "tradition",
    categoryId: "wedding-traditions",
    regionId: "east-africa"
  },
  {
    id: "ara_family_values",
    title: "Reserved family values",
    summary: "Family values — cultural heritage for generations.",
    kind: "faith-influence",
    categoryId: "family-values",
    regionId: "central-africa"
  },
  {
    id: "ara_diaspora_journeys",
    title: "Reserved diaspora journey",
    summary: "Diaspora journey — Journey Across Borders archived with care.",
    kind: "diaspora-journey",
    categoryId: "diaspora-journeys",
    regionId: "diaspora-communities"
  },
  {
    id: "ara_faith_influences",
    title: "Reserved faith influence",
    summary: "Faith influence on relationships — respectful preservation.",
    kind: "faith-influence",
    categoryId: "faith-influences",
    regionId: "north-africa"
  },
  {
    id: "ara_cultural_practices",
    title: "Reserved cultural practice",
    summary: "Cultural practice — never a repository.",
    kind: "tradition",
    categoryId: "cultural-practices",
    regionId: "southern-africa"
  },
  {
    id: "ara_language_traditions",
    title: "Reserved language tradition",
    summary: "Language tradition in courtship — cultural heritage.",
    kind: "tradition",
    categoryId: "language-traditions",
    regionId: "west-africa"
  },
  {
    id: "ara_courtship_customs",
    title: "Reserved courtship custom",
    summary: "Courtship custom preserved for future generations.",
    kind: "tradition",
    categoryId: "courtship-customs",
    regionId: "east-africa"
  },
  {
    id: "ara_intertribal_marriages",
    title: "Reserved intertribal marriage",
    summary: "Intertribal marriage — cultural heritage across communities.",
    kind: "tradition",
    categoryId: "intertribal-marriages",
    regionId: "central-africa"
  },
  {
    id: "ara_cross_border",
    title: "Reserved cross-border relationship",
    summary: "Cross-border relationship — diaspora journey archived.",
    kind: "diaspora-journey",
    categoryId: "cross-border-relationships",
    regionId: "diaspora-communities"
  }
];

export type AfricanRelationshipArchiveFutureCapabilityId =
  | "museums"
  | "books"
  | "films"
  | "podcasts"
  | "academic-studies";

export const AFRICAN_RELATIONSHIP_ARCHIVE_FUTURE_CAPABILITIES: {
  id: AfricanRelationshipArchiveFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "museums",
    label: "Museums",
    description: "Reserved — museum partnerships for cultural heritage."
  },
  {
    id: "books",
    label: "Books",
    description: "Reserved — books preserving African relationship culture."
  },
  {
    id: "films",
    label: "Films",
    description: "Reserved — films — journey stories with dignity."
  },
  {
    id: "podcasts",
    label: "Podcasts",
    description: "Reserved — podcasts on family traditions."
  },
  {
    id: "academic-studies",
    label: "Academic studies",
    description: "Reserved — academic studies — never database framing."
  }
];

export function getPreservedArchiveCategory(
  categoryId: PreservedArchiveCategoryId
): PreservedArchiveCategoryDefinition | undefined {
  return PRESERVED_ARCHIVE_CATEGORIES.find((category) => category.id === categoryId);
}

export function getArchiveRegion(regionId: ArchiveRegionId): ArchiveRegionDefinition | undefined {
  return ARCHIVE_REGIONS.find((region) => region.id === regionId);
}
