import type { ConciergeConsultantRoleId } from "../constants/conciergeConsultantRoles";
import type { SignalConciergeStatus, SignalConciergeTierId } from "../constants/signalConcierge";

export type ConsultantAssignmentRule =
  | "legacy-member"
  | "global-member"
  | "compatibility-review"
  | "family-journey"
  | "default-stewardship";

export type AssignmentMemberType =
  | "legacy"
  | "global"
  | "compatibility-review"
  | "family-journey"
  | "standard";

export type AssignmentConfidence = "strong-fit" | "good-fit" | "available-fit";

export type RecommendationLevel =
  | "highly-recommended"
  | "recommended"
  | "available"
  | "limited-capacity"
  | "unavailable";

export type WorkloadHealth = "healthy" | "busy" | "full" | "paused";

export type AssignmentMatchFactor =
  | "low-workload"
  | "matching-specialization"
  | "matching-location"
  | "matching-tier"
  | "matching-relationship-goals";

export type AssignmentReason = {
  code: ConsultantAssignmentRule;
  label: string;
  detail: string;
};

export type WorkloadProfile = {
  consultantId: string;
  consultantName: string;
  health: WorkloadHealth;
  capacityLevel: RecommendationLevel;
  activeMembers: number;
  pendingConsultations: number;
  introductionsInProgress: number;
  pendingFollowUps: number;
  upcomingMeetings: number;
  responseTimeHours: number | null;
  specializations: ConciergeConsultantRoleId[];
  region: string;
  regionLabel: string;
  workloadScore: number;
  summary: string;
};

export type AssignmentRecommendation = {
  consultantId: string;
  consultantName: string;
  primaryRole: ConciergeConsultantRoleId;
  confidence: AssignmentConfidence;
  level: RecommendationLevel;
  matchFactors: AssignmentMatchFactor[];
  reason: AssignmentReason;
  workload: WorkloadProfile;
  score: number;
  narrative: string;
};

/** @deprecated use AssignmentRecommendation */
export type ConsultantRecommendation = AssignmentRecommendation;

export type AssignmentSummary = {
  memberId: string;
  journeyId?: string;
  memberName: string;
  memberType: AssignmentMemberType;
  journeyStage: SignalConciergeStatus;
  city: string;
  tier: SignalConciergeTierId | "pending";
  currentStewardId?: string;
  currentStewardName?: string;
  recommendedConsultantId: string;
  recommendedConsultantName: string;
  confidence: AssignmentConfidence;
  level: RecommendationLevel;
  reason: AssignmentReason;
  workloadHealth: WorkloadHealth;
  matchFactors: AssignmentMatchFactor[];
  narrative: string;
};

export type AssignmentDecision = {
  memberId: string;
  memberName: string;
  journeyId?: string;
  consultantId: string;
  consultantName: string;
  level: RecommendationLevel;
  requiresAdminConfirm: true;
  narrative: string;
  recommendation: AssignmentRecommendation;
};

/** Reserved — not implemented. */
export type ConsultantAssignmentFutureCapability =
  | "automatic-balancing"
  | "ai-recommendations"
  | "regional-consultant-teams"
  | "cross-border-specialists";

export type ConsultantAssignmentFutureConfig = {
  capability?: ConsultantAssignmentFutureCapability;
  enabled?: boolean;
};
