import type { JourneyMilestoneId } from "../constants/journeyMilestones";

export type JourneyMilestoneEntry = {
  id: JourneyMilestoneId;
  milestoneAt: string;
  note?: string;
  recordedAt: string;
  recordedBy?: string;
};

/** Reserved — anniversary gifts, couple events, not implemented. */
export type JourneyMilestoneFutureCelebration =
  | "anniversary-gifts"
  | "couple-events"
  | "marriage-celebrations"
  | "family-milestones";

export type JourneyMilestoneFutureCelebrations = {
  enabled?: boolean;
  kinds?: JourneyMilestoneFutureCelebration[];
};

export type JourneyMilestoneTimeline = {
  journeyId: string;
  milestones: JourneyMilestoneEntry[];
  updatedAt: string;
  futureCelebrations?: JourneyMilestoneFutureCelebrations;
};
