import type {
  IntroductionFollowUpInterval,
  IntroductionInternalFlag,
  IntroductionOutcome,
  IntroductionStatus
} from "../constants/conciergeIntroduction";
import type { SignalConciergeTierId } from "../constants/signalConcierge";

export type IntroductionFeedbackEntry = {
  id: string;
  at: string;
  author: "consultant" | "member-a" | "member-b";
  body: string;
  followUpNotes?: string;
};

export type IntroductionHistoryEntry = {
  id: string;
  at: string;
  label: string;
  detail?: string;
  outcome?: IntroductionOutcome;
};

export type IntroductionRecord = {
  id: string;
  memberAId: string;
  memberBId: string;
  consultantId: string;
  tier?: SignalConciergeTierId;
  createdAt: string;
  updatedAt: string;
  status: IntroductionStatus;
  notes: string;
  consultantMessage: string;
  memberAPreviewNote: string;
  memberBPreviewNote: string;
  memberAApproved: boolean | null;
  memberBApproved: boolean | null;
  followUpDate?: string;
  followUpInterval?: IntroductionFollowUpInterval;
  successProbability?: number;
  internalFlags: IntroductionInternalFlag[];
  outcome?: IntroductionOutcome;
  feedback: IntroductionFeedbackEntry[];
  history: IntroductionHistoryEntry[];
  bothConsented: boolean;
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
  consultantMessage?: string;
  memberAPreviewNote?: string;
  memberBPreviewNote?: string;
  internalFlags?: IntroductionInternalFlag[];
  successProbability?: number;
};
