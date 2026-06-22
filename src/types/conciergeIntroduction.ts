import type {
  IntroductionConfidenceLevel,
  IntroductionFeedbackCategory,
  IntroductionFollowUpInterval,
  IntroductionInternalFlag,
  IntroductionOutcome,
  IntroductionPipelinePhaseId,
  IntroductionStatus
} from "../constants/conciergeIntroduction";
import type { SignalConciergeTierId } from "../constants/signalConcierge";

export type IntroductionFeedbackEntry = {
  id: string;
  at: string;
  author: "consultant" | "member-a" | "member-b";
  body: string;
  category?: IntroductionFeedbackCategory;
  followUpNotes?: string;
};

export type IntroductionHistoryEntry = {
  id: string;
  at: string;
  label: string;
  detail?: string;
  outcome?: IntroductionOutcome;
  pipelinePhase?: IntroductionPipelinePhaseId;
};

export type IntroductionCompatibilitySnapshot = {
  faith: string;
  lifestyle: string;
  marriageTimeline: string;
  familyValues: string;
  childrenPreference: string;
  communicationStyle: string;
  loveLanguage: string;
  careerCompatibility: string;
  location: string;
  relocationOpenness: string;
  dealBreakers: string;
  /** @deprecated internal only — never show members */
  score?: number;
};

export type IntroductionRecord = {
  id: string;
  introductionId: string;
  memberAId: string;
  memberBId: string;
  journeyAId?: string;
  journeyBId?: string;
  consultantId: string;
  consultantName?: string;
  tier?: SignalConciergeTierId;
  createdAt: string;
  updatedAt: string;
  status: IntroductionStatus;
  pipelinePhase: IntroductionPipelinePhaseId;
  notes: string;
  matchNotes: string[];
  /** Member-visible warm reasons */
  connectionReasons: string[];
  compatibilitySummary?: string;
  confidenceLevel?: IntroductionConfidenceLevel;
  consultantMessage: string;
  memberAPreviewNote: string;
  memberBPreviewNote: string;
  memberAApproved: boolean | null;
  memberBApproved: boolean | null;
  memberAPresentedAt?: string;
  memberBPresentedAt?: string;
  followUpDate?: string;
  followUpInterval?: IntroductionFollowUpInterval;
  compatibility?: IntroductionCompatibilitySnapshot;
  internalFlags: IntroductionInternalFlag[];
  outcome?: IntroductionOutcome;
  feedback: IntroductionFeedbackEntry[];
  history: IntroductionHistoryEntry[];
  bothConsented: boolean;
  /** Internal candidate — consultants only until presented */
  isInternalCandidate?: boolean;
  /** @deprecated use confidenceLevel */
  compatibilityScore?: number;
  /** @deprecated use confidenceLevel */
  successProbability?: number;
};

export type MemberIntroductionPreview = {
  firstName: string;
  age: string;
  city: string;
  occupation: string;
  voiceVibeAvailable: boolean;
  trustedMember: boolean;
  relationshipGoalsSummary: string;
  consultantNote: string;
  connectionReasons: string[];
};

export type MemberIntroductionReveal = MemberIntroductionPreview & {
  photos: string[];
  voiceVibeUrl?: string;
  voiceVibeDuration?: number;
  videoIntroUrl?: string;
  videoIntroDuration?: number;
  contactBridgeReady: boolean;
};

export type CreateIntroductionInput = {
  memberAId: string;
  memberBId: string;
  consultantId?: string;
  tier?: SignalConciergeTierId;
  notes?: string;
  matchNotes?: string[];
  connectionReasons?: string[];
  confidenceLevel?: IntroductionConfidenceLevel;
  consultantMessage?: string;
  memberAPreviewNote?: string;
  memberBPreviewNote?: string;
  internalFlags?: IntroductionInternalFlag[];
  compatibility?: Partial<IntroductionCompatibilitySnapshot>;
};

export type MemberCooldownSnapshot = {
  memberId: string;
  activeCount: number;
  maxActive: number;
  blocked: boolean;
  activeIntroductionIds: string[];
};
