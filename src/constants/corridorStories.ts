/** Corridor Stories™ — international love stories, consent-first. */

import type { CorridorDestinationId, CorridorOriginId } from "./diasporaCorridors";
import { CORRIDOR_DESTINATION_LABELS, CORRIDOR_ORIGIN_LABELS } from "./diasporaCorridors";

export const CORRIDOR_STORIES_TITLE = "Corridor Stories™";
export const CORRIDOR_STORIES_SUBCOPY =
  "Love Without Borders — diaspora stories preserved with dignity and consent.";
export const JOURNEY_ACROSS_BORDERS_LABEL = "Journey Across Borders";
export const LOVE_WITHOUT_BORDERS_LABEL = "Love Without Borders";
export const DIASPORA_STORY_LABEL = "Diaspora Story";

export const CORRIDOR_STORIES_PURPOSE_COPY =
  "Preserve international love stories — consent-first, private by default.";
export const CORRIDOR_STORIES_PRIVATE_COPY = "Private by default — nothing shared without consent.";
export const CORRIDOR_STORIES_CONSENT_COPY =
  "Consent required before any corridor story may be used beyond the archive.";
export const CORRIDOR_STORIES_RESERVED_COPY =
  "Architecture prepared. Documentaries, podcast stories, books, and magazine stories are not enabled yet.";

/** Reserved — never use in member-facing copy. */
export const CORRIDOR_STORIES_AVOID_COPY = ["International Match", "Migration Dating"] as const;

export type CorridorStoryConsentLevelId = "private" | "anonymous" | "first-names-only" | "full-story";

export type CorridorStoryConsentDefinition = {
  id: CorridorStoryConsentLevelId;
  label: string;
  description: string;
};

export const CORRIDOR_STORY_CONSENT_LEVELS: CorridorStoryConsentDefinition[] = [
  {
    id: "private",
    label: "Private",
    description: "Default — story preserved privately until consent is granted."
  },
  {
    id: "anonymous",
    label: "Anonymous",
    description: "Shared without names — gratitude preserved with care."
  },
  {
    id: "first-names-only",
    label: "First Names Only",
    description: "First names only — warm recognition without full exposure."
  },
  {
    id: "full-story",
    label: "Full Story",
    description: "Full story consent — photos and details only with dual approval."
  }
];

export const CORRIDOR_STORY_CONSENT_LABELS: Record<CorridorStoryConsentLevelId, string> =
  Object.fromEntries(CORRIDOR_STORY_CONSENT_LEVELS.map((level) => [level.id, level.label])) as Record<
    CorridorStoryConsentLevelId,
    string
  >;

export type CorridorStoryFutureCapability =
  | "documentaries"
  | "podcast-stories"
  | "books"
  | "magazine-stories";

export const CORRIDOR_STORY_FUTURE_CAPABILITIES: {
  id: CorridorStoryFutureCapability;
  label: string;
  description: string;
}[] = [
  {
    id: "documentaries",
    label: "Documentaries",
    description: "Reserved — long-form diaspora love documentaries with consent."
  },
  {
    id: "podcast-stories",
    label: "Podcast stories",
    description: "Reserved — podcast stories across corridors."
  },
  {
    id: "books",
    label: "Books",
    description: "Reserved — corridor story collections in print."
  },
  {
    id: "magazine-stories",
    label: "Magazine stories",
    description: "Reserved — magazine features with dignity and consent."
  }
];

export type PreparedCorridorStoryId =
  | "nigeria-uk"
  | "nigeria-canada"
  | "nigeria-usa"
  | "nigeria-uae"
  | "ghana-uk"
  | "ghana-canada";

export type CorridorStoryCategoryDefinition = {
  id: PreparedCorridorStoryId;
  title: string;
  originId: CorridorOriginId;
  destinationId: CorridorDestinationId;
  description: string;
};

export const CORRIDOR_STORY_CATEGORIES: CorridorStoryCategoryDefinition[] = [
  {
    id: "nigeria-uk",
    title: "Nigeria → UK Love Story",
    originId: "nigeria",
    destinationId: "united-kingdom",
    description: "A diaspora story across the Nigeria–UK corridor."
  },
  {
    id: "nigeria-canada",
    title: "Nigeria → Canada Love Story",
    originId: "nigeria",
    destinationId: "canada",
    description: "Love Without Borders — Nigeria to Canada."
  },
  {
    id: "nigeria-usa",
    title: "Nigeria → USA Love Story",
    originId: "nigeria",
    destinationId: "united-states",
    description: "Journey Across Borders — Nigeria to the United States."
  },
  {
    id: "nigeria-uae",
    title: "Nigeria → UAE Love Story",
    originId: "nigeria",
    destinationId: "uae",
    description: "A warm diaspora story along the Nigeria–UAE corridor."
  },
  {
    id: "ghana-uk",
    title: "Ghana → UK Love Story",
    originId: "ghana",
    destinationId: "united-kingdom",
    description: "Ghana to UK — shared dreams preserved privately."
  },
  {
    id: "ghana-canada",
    title: "Ghana → Canada Love Story",
    originId: "ghana",
    destinationId: "canada",
    description: "Ghana to Canada — consent-first storytelling."
  }
];

export type CorridorStoryEntry = {
  id: string;
  storyId: PreparedCorridorStoryId;
  title: string;
  routeLabel: string;
  body: string;
  recordedAt: string;
  consentLevel: CorridorStoryConsentLevelId;
  consentGranted: boolean;
};

export type CorridorStoryTimelineEntry = {
  id: string;
  storyId: PreparedCorridorStoryId;
  label: string;
  recordedAt: string;
  note?: string;
};

export const CORRIDOR_STORIES_ARCHITECTURE_SEED: CorridorStoryEntry[] =
  CORRIDOR_STORY_CATEGORIES.map((category, index) => ({
    id: `cs_seed_${category.id}`,
    storyId: category.id,
    title: category.title,
    routeLabel: `${CORRIDOR_ORIGIN_LABELS[category.originId]} → ${CORRIDOR_DESTINATION_LABELS[category.destinationId]}`,
    body: "A love story preserved with care — private until consent is granted.",
    recordedAt: new Date(Date.UTC(2026, index, 15)).toISOString(),
    consentLevel: "private" as const,
    consentGranted: false
  }));

export function corridorStoryConsentLabel(level: CorridorStoryConsentLevelId): string {
  return CORRIDOR_STORY_CONSENT_LABELS[level];
}

export function getCorridorStoryCategory(
  storyId: PreparedCorridorStoryId
): CorridorStoryCategoryDefinition | undefined {
  return CORRIDOR_STORY_CATEGORIES.find((category) => category.id === storyId);
}
