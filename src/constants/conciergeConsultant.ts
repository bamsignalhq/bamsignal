import type { SignalConciergeStatus } from "./signalConcierge";

export const CONCIERGE_PIPELINE: SignalConciergeStatus[] = [
  "applied",
  "consultation-scheduled",
  "under-review",
  "accepted",
  "active-search",
  "introductions-in-progress",
  "relationship",
  "matched",
  "exclusive",
  "engaged",
  "married",
  "paused",
  "closed",
  "legacy-archive"
];

export const CONCIERGE_DASHBOARD_TITLE = "Signal Concierge™";
export const CONCIERGE_DASHBOARD_SUBTITLE = "Consultant operating system — private member management.";

export const CONCIERGE_MEMBER_JOURNEY_TITLE = "Journey";
export const CONCIERGE_PRIVATE_NOTES_TITLE = "Private Notes";
export const CONCIERGE_INTRODUCTIONS_TITLE = "Introduction History";
export const CONCIERGE_FOLLOW_UP_TITLE = "Follow-Up";

export type ConciergeMemberFlag =
  | "high-priority"
  | "sensitive-case"
  | "relocation"
  | "diaspora"
  | "family-involvement";

export const CONCIERGE_MEMBER_FLAGS: { id: ConciergeMemberFlag; label: string }[] = [
  { id: "high-priority", label: "High priority" },
  { id: "sensitive-case", label: "Sensitive case" },
  { id: "relocation", label: "Relocation" },
  { id: "diaspora", label: "Diaspora" },
  { id: "family-involvement", label: "Family involvement" }
];

export type ConciergeFollowUpTaskType =
  | "pending-call"
  | "schedule-consultation"
  | "needs-profile-review"
  | "awaiting-feedback"
  | "pause-search"
  | "resume-search"
  | "awaiting-response"
  | "needs-profile-update"
  | "consultation-reminder"
  | "check-in-after-introduction";

export const CONCIERGE_FOLLOW_UP_TASK_TYPES: { id: ConciergeFollowUpTaskType; label: string }[] = [
  { id: "pending-call", label: "Pending call" },
  { id: "schedule-consultation", label: "Schedule consultation" },
  { id: "needs-profile-review", label: "Needs profile review" },
  { id: "awaiting-feedback", label: "Awaiting feedback" },
  { id: "pause-search", label: "Pause search" },
  { id: "resume-search", label: "Resume search" }
];

export const CONCIERGE_FOLLOW_UP_TASK_LEGACY_LABELS: Partial<Record<ConciergeFollowUpTaskType, string>> = {
  "awaiting-response": "Awaiting feedback",
  "needs-profile-update": "Needs profile review",
  "consultation-reminder": "Schedule consultation",
  "check-in-after-introduction": "Awaiting feedback"
};

export type ConciergeTimelineEventType =
  | "application-received"
  | "consultation-completed"
  | "accepted"
  | "profile-reviewed"
  | "introduction"
  | "follow-up-call"
  | "feedback-received"
  | "relationship-update"
  | "engagement"
  | "marriage"
  | "archived"
  | "success-story";

export const CONCIERGE_TIMELINE_EVENT_LABELS: Record<ConciergeTimelineEventType, string> = {
  "application-received": "Application received",
  "consultation-completed": "Consultation completed",
  accepted: "Accepted",
  "profile-reviewed": "Profile reviewed",
  introduction: "Introduction",
  "follow-up-call": "Follow-up",
  "feedback-received": "Feedback",
  "relationship-update": "Relationship update",
  engagement: "Engagement",
  marriage: "Marriage",
  archived: "Archived",
  "success-story": "Success story"
};

export type ConciergeIntroductionOutcome =
  | "still-talking"
  | "friendship"
  | "relationship"
  | "exclusive"
  | "engaged"
  | "married"
  | "not-a-fit"
  | "no-response"
  | "mutual-interest"
  | "member-declined"
  | "match-declined"
  | "ongoing"
  | "paused"
  | "completed";

export const CONCIERGE_INTRO_OUTCOME_LABELS: Record<ConciergeIntroductionOutcome, string> = {
  "still-talking": "Still talking",
  friendship: "Friendship",
  relationship: "Relationship",
  exclusive: "Exclusive",
  engaged: "Engaged",
  married: "Married",
  "not-a-fit": "Not a fit",
  "no-response": "No response",
  "mutual-interest": "Still talking",
  "member-declined": "Not a fit",
  "match-declined": "Not a fit",
  ongoing: "Still talking",
  paused: "Still talking",
  completed: "Relationship"
};

/** Reserved for future products — not implemented. */
export type ConciergeConsultantFutureRole =
  | "relationship-coach"
  | "family-value-advisor"
  | "diaspora-consultant"
  | "ai-compatibility-summary"
  | "relationship-counseling";

export type ConciergeConsultantFutureConfig = {
  role?: ConciergeConsultantFutureRole;
  consultantId?: string;
  memberId?: string;
  enabled?: boolean;
};

export const CONCIERGE_FUTURE_ROLES: { id: ConciergeConsultantFutureRole; label: string }[] = [
  { id: "relationship-coach", label: "Relationship coaches" },
  { id: "family-value-advisor", label: "Family-value advisors" },
  { id: "diaspora-consultant", label: "Diaspora consultants" },
  { id: "ai-compatibility-summary", label: "AI summaries" },
  { id: "relationship-counseling", label: "Relationship counseling" }
];
