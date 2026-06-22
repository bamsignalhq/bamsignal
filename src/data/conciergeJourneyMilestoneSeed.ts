import type { JourneyMilestoneTimeline } from "../types/journeyMilestone";

const JOURNEY_ID = "BS-JR-2028-0045";

export const CONCIERGE_JOURNEY_MILESTONE_SEED: JourneyMilestoneTimeline[] = [
  {
    journeyId: JOURNEY_ID,
    milestones: [
      {
        id: "met",
        milestoneAt: "2028-05-20T00:00:00.000Z",
        recordedAt: "2028-05-20T10:00:00.000Z",
        recordedBy: "Ada Okafor",
        note: "First introduction through Signal Concierge"
      },
      {
        id: "relationship-formed",
        milestoneAt: "2028-06-01T00:00:00.000Z",
        recordedAt: "2028-06-01T00:00:00.000Z",
        recordedBy: "Ada Okafor"
      },
      {
        id: "engaged",
        milestoneAt: "2029-11-01T00:00:00.000Z",
        recordedAt: "2029-11-01T00:00:00.000Z",
        recordedBy: "Ada Okafor"
      },
      {
        id: "married",
        milestoneAt: "2030-04-18T00:00:00.000Z",
        recordedAt: "2030-04-18T00:00:00.000Z",
        recordedBy: "Ada Okafor",
        note: "Wedding celebrated with family"
      },
      {
        id: "first-anniversary",
        milestoneAt: "2031-04-18T00:00:00.000Z",
        recordedAt: "2031-04-18T00:00:00.000Z",
        recordedBy: "Ada Okafor"
      },
      {
        id: "five-years-together",
        milestoneAt: "2035-04-18T00:00:00.000Z",
        recordedAt: "2035-04-18T00:00:00.000Z",
        recordedBy: "Ada Okafor"
      },
      {
        id: "ten-years-together",
        milestoneAt: "2040-04-18T00:00:00.000Z",
        recordedAt: "2040-04-18T00:00:00.000Z",
        recordedBy: "Ada Okafor"
      }
    ],
    updatedAt: "2040-04-18T00:00:00.000Z",
    futureCelebrations: {
      enabled: false,
      kinds: ["anniversary-gifts", "couple-events", "marriage-celebrations", "family-milestones"]
    }
  }
];
