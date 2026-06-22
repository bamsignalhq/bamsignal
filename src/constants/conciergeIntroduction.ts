import type { SignalConciergeTierId } from "./signalConcierge";

export const INTRODUCTION_ENGINE_TITLE = "Introduction Engine";

export const CONSULTANT_INTRO_SUGGESTED_MESSAGE =
  "I'd love to introduce you to someone I believe you may enjoy getting to know.\n\nWould you be open to learning more?";

export const CONSULTANT_INTRO_NOTE_EXAMPLE =
  "I believe your shared values and relationship goals may make for a meaningful conversation.";

export type IntroductionStatus =
  | "candidate"
  | "consultant-review"
  | "member-a-approval"
  | "member-b-approval"
  | "introduction-scheduled"
  | "conversation-started"
  | "follow-up"
  | "successful"
  | "closed";

export const INTRODUCTION_STATUS_PIPELINE: IntroductionStatus[] = [
  "candidate",
  "consultant-review",
  "member-a-approval",
  "member-b-approval",
  "introduction-scheduled",
  "conversation-started",
  "follow-up",
  "successful",
  "closed"
];

export const INTRODUCTION_STATUS_LABELS: Record<IntroductionStatus, string> = {
  candidate: "Candidate",
  "consultant-review": "Consultant Review",
  "member-a-approval": "Member A Approval",
  "member-b-approval": "Member B Approval",
  "introduction-scheduled": "Introduction Scheduled",
  "conversation-started": "Conversation Started",
  "follow-up": "Follow-Up",
  successful: "Successful",
  closed: "Closed"
};

export type IntroductionOutcome =
  | "conversation-ongoing"
  | "friendship"
  | "relationship"
  | "engaged"
  | "married"
  | "not-a-fit"
  | "no-response";

export const INTRODUCTION_OUTCOME_LABELS: Record<IntroductionOutcome, string> = {
  "conversation-ongoing": "Conversation ongoing",
  friendship: "Friendship",
  relationship: "Relationship",
  engaged: "Engaged",
  married: "Married",
  "not-a-fit": "Not a fit",
  "no-response": "No response"
};

export type IntroductionFollowUpInterval =
  | "7-days"
  | "30-days"
  | "90-days"
  | "180-days"
  | "1-year";

export const INTRODUCTION_FOLLOW_UP_INTERVALS: {
  id: IntroductionFollowUpInterval;
  label: string;
  days: number;
}[] = [
  { id: "7-days", label: "7 days", days: 7 },
  { id: "30-days", label: "30 days", days: 30 },
  { id: "90-days", label: "90 days", days: 90 },
  { id: "180-days", label: "180 days", days: 180 },
  { id: "1-year", label: "1 year", days: 365 }
];

export type IntroductionInternalFlag =
  | "high-priority"
  | "sensitive-case"
  | "relocation"
  | "diaspora"
  | "family-involvement";

export const INTRODUCTION_INTERNAL_FLAGS: { id: IntroductionInternalFlag; label: string }[] = [
  { id: "high-priority", label: "High priority" },
  { id: "sensitive-case", label: "Sensitive case" },
  { id: "relocation", label: "Relocation" },
  { id: "diaspora", label: "Diaspora" },
  { id: "family-involvement", label: "Family involvement" }
];

/** Reserved for future products — not implemented. */
export type IntroductionEngineFutureTier =
  | "ai-recommendations"
  | "family-introductions"
  | "relationship-coaching"
  | "success-stories"
  | "private-events";

export type IntroductionEngineFutureConfig = {
  tier?: IntroductionEngineFutureTier;
  consultantId?: string;
  eventId?: string;
};

export function introductionTierLabel(tier?: SignalConciergeTierId): string {
  if (!tier) return "Tier pending";
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}
