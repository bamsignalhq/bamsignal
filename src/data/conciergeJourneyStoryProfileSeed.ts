import type { JourneyStoryProfile } from "../types/JourneyStoryType";

const JOURNEY_ID = "BS-JR-2028-0045";

export const CONCIERGE_JOURNEY_STORY_PROFILE_SEED: JourneyStoryProfile[] = [
  {
    journeyId: JOURNEY_ID,
    categories: [
      {
        id: "wedding-story",
        assignedAt: "2030-04-18T00:00:00.000Z",
        assignedBy: "Ada Okafor",
        note: "Married through Signal Concierge"
      },
      {
        id: "diaspora-story",
        assignedAt: "2030-05-01T00:00:00.000Z",
        assignedBy: "Ada Okafor"
      },
      {
        id: "family-story",
        assignedAt: "2031-01-10T00:00:00.000Z",
        assignedBy: "Ada Okafor",
        note: "Family chapter celebrated privately"
      }
    ],
    updatedAt: "2031-06-15T00:00:00.000Z",
    futureFormats: {
      enabled: false,
      formats: ["podcast-stories", "video-documentaries", "magazine-features", "anniversary-features"]
    }
  }
];
