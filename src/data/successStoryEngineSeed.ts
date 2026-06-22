import type { SuccessStoryRecord } from "../constants/successStoryEngine";
import {
  createEmptySuccessStorySections,
  normalizeSuccessStoryRecord
} from "../utils/successStoryEngineLogic";

const JOURNEY_ID = "BS-JR-2028-0045";

export const SUCCESS_STORY_ENGINE_SEED: SuccessStoryRecord[] = [
  normalizeSuccessStoryRecord({
    journeyId: JOURNEY_ID,
    coupleLabel: "Amaka & Chidi",
    storyType: "first-name-only",
    visibility: "private",
    updatedAt: "2031-06-15T00:00:00.000Z",
    sections: [
      {
        id: "how-we-met",
        body: "We met through Signal Concierge with warmth, intention, and respect.",
        recordedAt: "2028-06-01T00:00:00.000Z"
      },
      {
        id: "first-conversation",
        body: "Our first conversation felt easy — values, family, and purpose aligned quickly.",
        recordedAt: "2028-06-05T00:00:00.000Z"
      },
      {
        id: "what-we-connected-over",
        body: "Faith, ambition, and a shared vision for building life together.",
        recordedAt: "2028-08-01T00:00:00.000Z"
      },
      {
        id: "the-proposal",
        body: "A private proposal surrounded by family blessings.",
        recordedAt: "2029-11-01T00:00:00.000Z"
      },
      {
        id: "the-wedding",
        body: "We married in April 2030 — celebrating love with dignity.",
        recordedAt: "2030-04-18T00:00:00.000Z"
      },
      {
        id: "life-together",
        body: "Life together continues with gratitude, communication, and hope.",
        recordedAt: "2031-06-15T00:00:00.000Z"
      }
    ],
    futureReady: {
      books: false,
      magazine: false,
      documentary: false,
      podcast: false
    }
  })
];

export function createEmptySuccessStoryRecord(journeyId: string, coupleLabel?: string): SuccessStoryRecord {
  return normalizeSuccessStoryRecord({
    journeyId,
    coupleLabel,
    storyType: "anonymous",
    visibility: "private",
    sections: createEmptySuccessStorySections(),
    updatedAt: new Date().toISOString(),
    futureReady: {
      books: false,
      magazine: false,
      documentary: false,
      podcast: false
    }
  });
}
