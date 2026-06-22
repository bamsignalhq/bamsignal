import type {
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
  score: number;
  faith: string;
  lifestyle: string;
  marriageTimeline: string;
  familyValues: string;
  childrenPreference: string;
  location: string;
  relocationOpenness: string;
  communicationStyle: string;
  loveLanguage: string;
  dealBreakers: string;
};

export type IntroductionRecord = {
  /** Internal record key */
  id: string;
  /** Permanent — BS-IN-YYYY-#### */
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
  /** Private match notes — consultants only */
  matchNotes: string[];
  consultantMessage: string;
  memberAPreviewNote: string;
  memberBPreviewNote: string;
  memberAApproved: boolean | null;
  memberBApproved: boolean | null;
  memberAPresentedAt?: string;
  memberBPresentedAt?: string;
  followUpDate?: string;
  followUpInterval?: IntroductionFollowUpInterval;
  compatibilityScore?: number;
  compatibility?: IntroductionCompatibilitySnapshot;
  internalFlags: IntroductionInternalFlag[];
  outcome?: IntroductionOutcome;
  feedback: IntroductionFeedbackEntry[];
  history: IntroductionHistoryEntry[];
  bothConsented: boolean;
  /** @deprecated use compatibilityScore */
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
  consultantMessage?: string;
  memberAPreviewNote?: string;
  memberBPreviewNote?: string;
  internalFlags?: IntroductionInternalFlag[];
  compatibilityScore?: number;
  compatibility?: Partial<IntroductionCompatibilitySnapshot>;
};
