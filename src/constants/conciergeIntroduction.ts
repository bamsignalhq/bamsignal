import type { SignalConciergeTierId } from "./signalConcierge";

export const INTRODUCTION_ENGINE_TITLE = "Signal Concierge Introduction Engine™";
export const INTRODUCTION_LABEL = "Introduction";
export const COMPATIBILITY_REVIEW_LABEL = "Compatibility Review";
export const JOURNEY_MATCH_LABEL = "Journey Match";
export const SHARED_VALUES_LABEL = "Shared Values";

export const CONSULTANT_INTRO_SUGGESTED_MESSAGE =
  "I'd love to introduce you to someone I believe you may enjoy getting to know.\n\nWould you be open to learning more?";

export const CONSULTANT_INTRO_NOTE_EXAMPLE =
  "I believe your shared values and relationship goals may make for a meaningful conversation.";

export const MATCH_NOTE_EXAMPLES = [
  "Strong values alignment.",
  "Both open to relocation.",
  "Family-oriented.",
  "Good communication styles."
] as const;

export type IntroductionPipelinePhaseId =
  | "candidate-identified"
  | "internal-review"
  | "compatibility-review"
  | "approved"
  | "member-a-presented"
  | "member-b-presented"
  | "mutual-acceptance"
  | "introduction-made"
  | "follow-up"
  | "outcome-recorded";

export const INTRODUCTION_PIPELINE_PHASES: {
  id: IntroductionPipelinePhaseId;
  label: string;
  order: number;
}[] = [
  { id: "candidate-identified", label: "Candidate Identified", order: 10 },
  { id: "internal-review", label: "Internal Review", order: 20 },
  { id: "compatibility-review", label: "Compatibility Review", order: 30 },
  { id: "approved", label: "Approved", order: 40 },
  { id: "member-a-presented", label: "Member A Presented", order: 50 },
  { id: "member-b-presented", label: "Member B Presented", order: 60 },
  { id: "mutual-acceptance", label: "Mutual Acceptance", order: 70 },
  { id: "introduction-made", label: "Introduction Made", order: 80 },
  { id: "follow-up", label: "Follow-Up", order: 90 },
  { id: "outcome-recorded", label: "Outcome Recorded", order: 100 }
];

export type IntroductionStatus =
  | "pending-review"
  | "presented"
  | "awaiting-response"
  | "accepted"
  | "declined"
  | "active-conversation"
  | "exclusive"
  | "relationship"
  | "engaged"
  | "married"
  | "paused"
  | "closed";

export const INTRODUCTION_STATUS_LABELS: Record<IntroductionStatus, string> = {
  "pending-review": "Pending Review",
  presented: "Presented",
  "awaiting-response": "Awaiting Response",
  accepted: "Accepted",
  declined: "Declined",
  "active-conversation": "Active Conversation",
  exclusive: "Exclusive",
  relationship: "Relationship",
  engaged: "Engaged",
  married: "Married",
  paused: "Paused",
  closed: "Closed"
};

/** Legacy statuses normalized on load. */
export const LEGACY_INTRODUCTION_STATUS_MAP: Record<string, IntroductionStatus> = {
  candidate: "pending-review",
  "consultant-review": "pending-review",
  "member-a-approval": "presented",
  "member-b-approval": "awaiting-response",
  "introduction-scheduled": "accepted",
  "conversation-started": "active-conversation",
  "follow-up": "active-conversation",
  successful: "relationship",
  closed: "closed"
};

export type IntroductionOutcome =
  | "still-talking"
  | "friendship"
  | "relationship"
  | "exclusive"
  | "engaged"
  | "married"
  | "no-chemistry"
  | "no-response"
  | "not-a-fit";

export const INTRODUCTION_OUTCOME_LABELS: Record<IntroductionOutcome, string> = {
  "still-talking": "Still Talking",
  friendship: "Friendship",
  relationship: "Relationship",
  exclusive: "Exclusive",
  engaged: "Engaged",
  married: "Married",
  "no-chemistry": "No Chemistry",
  "no-response": "No Response",
  "not-a-fit": "Not a Fit"
};

export const LEGACY_INTRODUCTION_OUTCOME_MAP: Record<string, IntroductionOutcome> = {
  "conversation-ongoing": "still-talking"
};

export type IntroductionFeedbackCategory =
  | "positive"
  | "neutral"
  | "not-compatible"
  | "timing-issue"
  | "family-concerns"
  | "relocation-challenge";

export const INTRODUCTION_FEEDBACK_CATEGORIES: {
  id: IntroductionFeedbackCategory;
  label: string;
}[] = [
  { id: "positive", label: "Positive" },
  { id: "neutral", label: "Neutral" },
  { id: "not-compatible", label: "Not compatible" },
  { id: "timing-issue", label: "Timing issue" },
  { id: "family-concerns", label: "Family concerns" },
  { id: "relocation-challenge", label: "Relocation challenge" }
];

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

export const INTRODUCTION_HISTORY_EVENTS = [
  "Presented",
  "Accepted",
  "Declined",
  "Relationship formed",
  "Engagement",
  "Marriage"
] as const;

/** Reserved — permissions not implemented. */
export const INTRODUCTION_FUTURE_SPECIALISTS = [
  { id: "senior-matchmaker", label: "Senior Matchmaker rankings" },
  { id: "diaspora-specialist", label: "Diaspora specialists" },
  { id: "family-advisor", label: "Family advisors" },
  { id: "relationship-coach", label: "Relationship coaches" }
] as const;

export type IntroductionEngineFutureTier =
  | "ai-recommendations"
  | "family-introductions"
  | "relationship-coaching"
  | "success-stories"
  | "private-events";

export function introductionTierLabel(tier?: SignalConciergeTierId): string {
  if (!tier) return "Tier pending";
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export const CLOSED_INTRODUCTION_STATUSES = new Set<IntroductionStatus>(["declined", "closed", "married"]);
