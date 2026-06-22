/** Success Story Engine™ — preserve love stories with dignity. Privacy and consent first. */

import type { SuccessStoryVisibilityLevel } from "./conciergeSuccessStoryConsent";

export const SUCCESS_STORY_ENGINE_TITLE = "Success Story Engine™";
export const SUCCESS_STORY_ENGINE_SUBCOPY =
  "Preserve love stories with dignity — human, elegant, and never marketing-first.";
export const OUR_STORY_LABEL = "Our Story";
export const JOURNEY_TOGETHER_LABEL = "Journey Together";
export const CELEBRATING_LOVE_LABEL = "Celebrating Love";

export const SUCCESS_STORY_DEFAULT_PRIVATE_COPY =
  "Private by default. Nothing public without consent.";
export const SUCCESS_STORY_ENGINE_RESERVED_COPY =
  "Architecture prepared. Books, magazine, documentary, and podcast are not enabled yet.";

/** Engine story types — aligned with consent visibility levels. */
export const SUCCESS_STORY_TYPE_LABELS: Record<SuccessStoryVisibilityLevel, string> = {
  anonymous: "Anonymous",
  "first-name-only": "First Names Only",
  "full-story": "Full Story"
};

export type SuccessStorySectionId =
  | "how-we-met"
  | "first-conversation"
  | "what-we-connected-over"
  | "the-proposal"
  | "the-wedding"
  | "life-together";

export type SuccessStorySectionDefinition = {
  id: SuccessStorySectionId;
  label: string;
  order: number;
};

export const SUCCESS_STORY_SECTIONS: SuccessStorySectionDefinition[] = [
  { id: "how-we-met", label: "How We Met", order: 10 },
  { id: "first-conversation", label: "Our First Conversation", order: 20 },
  { id: "what-we-connected-over", label: "What We Connected Over", order: 30 },
  { id: "the-proposal", label: "The Proposal", order: 40 },
  { id: "the-wedding", label: "The Wedding", order: 50 },
  { id: "life-together", label: "Life Together", order: 60 }
];

export const SUCCESS_STORY_SECTION_LABELS: Record<SuccessStorySectionId, string> = Object.fromEntries(
  SUCCESS_STORY_SECTIONS.map((section) => [section.id, section.label])
) as Record<SuccessStorySectionId, string>;

export type SuccessStoryFutureFormat = "books" | "magazine" | "documentary" | "podcast";

export const SUCCESS_STORY_FUTURE_FORMATS: {
  id: SuccessStoryFutureFormat;
  label: string;
  description: string;
}[] = [
  {
    id: "books",
    label: "Books",
    description: "Reserved — printed love stories with consent and care."
  },
  {
    id: "magazine",
    label: "Magazine",
    description: "Reserved — editorial features celebrating real journeys."
  },
  {
    id: "documentary",
    label: "Documentary",
    description: "Reserved — long-form visual storytelling with dual consent."
  },
  {
    id: "podcast",
    label: "Podcast",
    description: "Reserved — audio journeys shared with warmth and privacy."
  }
];

export type SuccessStoryVisibility = "private";

export type SuccessStorySectionEntry = {
  id: SuccessStorySectionId;
  body?: string;
  recordedAt?: string;
};

export type SuccessStoryRecord = {
  journeyId: string;
  coupleLabel?: string;
  storyType: SuccessStoryVisibilityLevel;
  visibility: SuccessStoryVisibility;
  sections: SuccessStorySectionEntry[];
  updatedAt: string;
  futureReady?: {
    books: false;
    magazine: false;
    documentary: false;
    podcast: false;
  };
};

export function successStoryTypeLabel(storyType: SuccessStoryVisibilityLevel): string {
  return SUCCESS_STORY_TYPE_LABELS[storyType];
}

export function successStorySectionLabel(sectionId: SuccessStorySectionId): string {
  return SUCCESS_STORY_SECTION_LABELS[sectionId];
}

export function getSuccessStorySectionDefinition(
  sectionId: SuccessStorySectionId
): SuccessStorySectionDefinition | undefined {
  return SUCCESS_STORY_SECTIONS.find((section) => section.id === sectionId);
}
