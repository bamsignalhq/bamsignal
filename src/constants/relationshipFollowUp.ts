export const RELATIONSHIP_FOLLOW_UP_TITLE = "Signal Concierge Relationship Follow-Up Engine™";
export const RELATIONSHIP_FOLLOW_UP_SUBCOPY =
  "Help introductions become relationships, engagements, and marriages — human-first, warm, and private.";

export const RELATIONSHIP_JOURNAL_TITLE = "Relationship Journal";
export const RELATIONSHIP_HEALTH_TITLE = "Relationship Health™";
export const CELEBRATING_JOURNEY_LABEL = "Celebrating Your Journey";
export const GROWING_TOGETHER_LABEL = "Growing Together";

export const RELATIONSHIP_JOURNAL_EXAMPLES = [
  "Both optimistic.",
  "Families aware.",
  "Planning relocation.",
  "Strong communication.",
  "Discussing engagement."
] as const;

export type RelationshipPipelinePhaseId =
  | "introduction-made"
  | "still-talking"
  | "dating"
  | "exclusive"
  | "relationship"
  | "engaged"
  | "married"
  | "legacy-archive";

export const RELATIONSHIP_PIPELINE_PHASES: {
  id: RelationshipPipelinePhaseId;
  label: string;
  order: number;
}[] = [
  { id: "introduction-made", label: "Introduction Made", order: 10 },
  { id: "still-talking", label: "Still Talking", order: 20 },
  { id: "dating", label: "Dating", order: 30 },
  { id: "exclusive", label: "Exclusive", order: 40 },
  { id: "relationship", label: "Relationship", order: 50 },
  { id: "engaged", label: "Engaged", order: 60 },
  { id: "married", label: "Married", order: 70 },
  { id: "legacy-archive", label: "Legacy Archive", order: 80 }
];

export type RelationshipStage =
  | "still-talking"
  | "getting-to-know"
  | "exclusive"
  | "relationship"
  | "engaged"
  | "married"
  | "paused"
  | "ended"
  | "archived";

export const RELATIONSHIP_STAGE_LABELS: Record<RelationshipStage, string> = {
  "still-talking": "Still Talking",
  "getting-to-know": "Getting To Know Each Other",
  exclusive: "Exclusive",
  relationship: "Relationship",
  engaged: "Engaged",
  married: "Married",
  paused: "Paused",
  ended: "Ended",
  archived: "Archived"
};

export type RelationshipCheckInRhythm =
  | "7-days"
  | "30-days"
  | "90-days"
  | "6-months"
  | "1-year"
  | "annually";

export const RELATIONSHIP_CHECK_IN_RHYTHMS: {
  id: RelationshipCheckInRhythm;
  label: string;
  days: number;
}[] = [
  { id: "7-days", label: "7 days", days: 7 },
  { id: "30-days", label: "30 days", days: 30 },
  { id: "90-days", label: "90 days", days: 90 },
  { id: "6-months", label: "6 months", days: 182 },
  { id: "1-year", label: "1 year", days: 365 },
  { id: "annually", label: "Annually", days: 365 }
];

export type RelationshipCheckInType =
  | "conversation-progressing"
  | "family-reactions"
  | "communication-quality"
  | "shared-goals"
  | "relocation-plans"
  | "marriage-discussions"
  | "general-happiness";

export const RELATIONSHIP_CHECK_IN_TYPES: {
  id: RelationshipCheckInType;
  label: string;
}[] = [
  { id: "conversation-progressing", label: "Conversation progressing?" },
  { id: "family-reactions", label: "Family reactions?" },
  { id: "communication-quality", label: "Communication quality?" },
  { id: "shared-goals", label: "Shared goals?" },
  { id: "relocation-plans", label: "Relocation plans?" },
  { id: "marriage-discussions", label: "Marriage discussions?" },
  { id: "general-happiness", label: "General happiness?" }
];

export type RelationshipFollowUpOutcome =
  | "positive-progress"
  | "needs-more-time"
  | "family-concerns"
  | "distance-challenges"
  | "communication-issues"
  | "paused"
  | "ended-respectfully"
  | "relationship-formed"
  | "engaged"
  | "married";

export const RELATIONSHIP_FOLLOW_UP_OUTCOME_LABELS: Record<RelationshipFollowUpOutcome, string> = {
  "positive-progress": "Positive Progress",
  "needs-more-time": "Needs More Time",
  "family-concerns": "Family Concerns",
  "distance-challenges": "Distance Challenges",
  "communication-issues": "Communication Issues",
  paused: "Paused",
  "ended-respectfully": "Ended Respectfully",
  "relationship-formed": "Relationship Formed",
  engaged: "Engaged",
  married: "Married"
};

export type RelationshipMilestoneId =
  | "first-date"
  | "exclusive"
  | "relationship"
  | "family-introduction"
  | "proposal"
  | "engagement"
  | "marriage"
  | "first-anniversary"
  | "five-years"
  | "ten-years";

export const RELATIONSHIP_MILESTONES: { id: RelationshipMilestoneId; label: string }[] = [
  { id: "first-date", label: "First Date" },
  { id: "exclusive", label: "Exclusive" },
  { id: "relationship", label: "Relationship" },
  { id: "family-introduction", label: "Family Introduction" },
  { id: "proposal", label: "Proposal" },
  { id: "engagement", label: "Engagement" },
  { id: "marriage", label: "Marriage" },
  { id: "first-anniversary", label: "First Anniversary" },
  { id: "five-years", label: "5 Years Together" },
  { id: "ten-years", label: "10 Years Together" }
];

export type RelationshipHealthLevel =
  | "thriving"
  | "healthy"
  | "growing"
  | "needs-support"
  | "requires-attention";

export const RELATIONSHIP_HEALTH_LEVELS: { id: RelationshipHealthLevel; label: string }[] = [
  { id: "thriving", label: "Thriving" },
  { id: "healthy", label: "Healthy" },
  { id: "growing", label: "Growing" },
  { id: "needs-support", label: "Needs Support" },
  { id: "requires-attention", label: "Requires Attention" }
];

export const RELATIONSHIP_HEALTH_LABELS: Record<RelationshipHealthLevel, string> = {
  thriving: "Thriving",
  healthy: "Healthy",
  growing: "Growing",
  "needs-support": "Needs Support",
  "requires-attention": "Requires Attention"
};

export type RelationshipCelebrationKind =
  | "relationship-formed"
  | "engaged"
  | "married"
  | "anniversary"
  | "relocation"
  | "family-milestones";

export const RELATIONSHIP_CELEBRATION_KINDS: { id: RelationshipCelebrationKind; label: string }[] = [
  { id: "relationship-formed", label: "Relationship Formed" },
  { id: "engaged", label: "Engaged" },
  { id: "married", label: "Married" },
  { id: "anniversary", label: "Anniversary" },
  { id: "relocation", label: "Relocation" },
  { id: "family-milestones", label: "Family Milestones" }
];

export type RelationshipRecoveryReason =
  | "timing-issue"
  | "distance-challenge"
  | "family-concerns"
  | "communication-challenges"
  | "life-transitions";

export const RELATIONSHIP_RECOVERY_REASONS: { id: RelationshipRecoveryReason; label: string }[] = [
  { id: "timing-issue", label: "Timing issue" },
  { id: "distance-challenge", label: "Distance challenge" },
  { id: "family-concerns", label: "Family concerns" },
  { id: "communication-challenges", label: "Communication challenges" },
  { id: "life-transitions", label: "Life transitions" }
];

export const ACTIVE_RELATIONSHIP_STAGES = new Set<RelationshipStage>([
  "still-talking",
  "getting-to-know",
  "exclusive",
  "relationship",
  "engaged",
  "married",
  "paused"
]);

export function relationshipStageLabel(stage: RelationshipStage): string {
  return RELATIONSHIP_STAGE_LABELS[stage];
}
