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

export type WorkloadHealth = "healthy" | "busy" | "full" | "paused";

export type AssignmentReason = {
  code: ConsultantAssignmentRule;
  label: string;
  detail: string;
};

export type WorkloadProfile = {
  consultantId: string;
  consultantName: string;
  health: WorkloadHealth;
  activeMembers: number;
  pendingFollowUps: number;
  upcomingMeetings: number;
  summary: string;
};

export type ConsultantRecommendation = {
  consultantId: string;
  consultantName: string;
  primaryRole: ConciergeConsultantRoleId;
  confidence: AssignmentConfidence;
  reason: AssignmentReason;
  workload: WorkloadProfile;
};

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
  reason: AssignmentReason;
  workloadHealth: WorkloadHealth;
  narrative: string;
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
