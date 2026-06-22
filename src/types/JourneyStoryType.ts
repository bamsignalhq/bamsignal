/** Permanent journey story types — categories evolve; publishing not implemented. */

import type { JourneyStoryCategoryId } from "../constants/journeyStoryCategories";

export type JourneyStoryCategoryEntry = {
  id: JourneyStoryCategoryId;
  assignedAt: string;
  assignedBy?: string;
  note?: string;
};

/** Reserved future story formats — not implemented. */
export type JourneyStoryFutureFormat =
  | "podcast-stories"
  | "video-documentaries"
  | "magazine-features"
  | "anniversary-features";

export type JourneyStoryFutureFormats = {
  enabled?: boolean;
  formats?: JourneyStoryFutureFormat[];
};

export type JourneyStoryProfile = {
  journeyId: string;
  /** Multiple categories allowed — may grow over time. */
  categories: JourneyStoryCategoryEntry[];
  updatedAt: string;
  /** Reserved for podcast, documentaries, magazine, anniversary features. */
  futureFormats?: JourneyStoryFutureFormats;
};

export type JourneyStoryCategoryChange = {
  id: string;
  journeyId: string;
  categoryId: JourneyStoryCategoryId;
  action: "added" | "updated";
  at: string;
  by?: string;
};
