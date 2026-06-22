/** Journey story categories — permanent labels tied to Journey ID. */

export const STORY_CATEGORIES_TITLE = "Story Categories";
export const JOURNEY_STORY_LABEL = "Journey Story";
export const CELEBRATING_YOUR_JOURNEY = "Celebrating Your Journey";

export type JourneyStoryCategoryId =
  | "engagement-story"
  | "wedding-story"
  | "anniversary-story"
  | "family-story"
  | "relocation-story"
  | "second-chance-story"
  | "diaspora-story";

export type JourneyStoryCategoryDefinition = {
  id: JourneyStoryCategoryId;
  label: string;
  emoji: string;
  description: string;
};

export const JOURNEY_STORY_CATEGORIES: JourneyStoryCategoryDefinition[] = [
  {
    id: "engagement-story",
    label: "Engagement Story",
    emoji: "💫",
    description: "Celebrating the promise before marriage."
  },
  {
    id: "wedding-story",
    label: "Wedding Story",
    emoji: "💍",
    description: "Honoring the day you became one."
  },
  {
    id: "anniversary-story",
    label: "Anniversary Story",
    emoji: "🎉",
    description: "Marking years of intentional love."
  },
  {
    id: "family-story",
    label: "Family Story",
    emoji: "❤️",
    description: "Building home, faith, and family together."
  },
  {
    id: "relocation-story",
    label: "Relocation Story",
    emoji: "✈️",
    description: "Love that crossed cities or borders."
  },
  {
    id: "second-chance-story",
    label: "Second-Chance Story",
    emoji: "🌱",
    description: "A new chapter after heartbreak or pause."
  },
  {
    id: "diaspora-story",
    label: "Diaspora Story",
    emoji: "🌍",
    description: "Connection across Nigeria and the world."
  }
];

export const JOURNEY_STORY_CATEGORY_LABELS: Record<JourneyStoryCategoryId, string> =
  Object.fromEntries(JOURNEY_STORY_CATEGORIES.map((item) => [item.id, item.label])) as Record<
    JourneyStoryCategoryId,
    string
  >;

export const JOURNEY_STORY_CATEGORY_EMOJI: Record<JourneyStoryCategoryId, string> =
  Object.fromEntries(JOURNEY_STORY_CATEGORIES.map((item) => [item.id, item.emoji])) as Record<
    JourneyStoryCategoryId,
    string
  >;

export const JOURNEY_STORY_FUTURE_FORMATS = [
  { id: "podcast-stories", label: "Podcast stories" },
  { id: "video-documentaries", label: "Video documentaries" },
  { id: "magazine-features", label: "Magazine features" },
  { id: "anniversary-features", label: "Anniversary features" }
] as const;

export function getJourneyStoryCategory(id: JourneyStoryCategoryId) {
  return JOURNEY_STORY_CATEGORIES.find((item) => item.id === id) ?? null;
}
