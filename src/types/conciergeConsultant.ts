import type {
  SignalConciergeConsultationChannel,
  SignalConciergeStatus,
  SignalConciergeTierId
} from "../constants/signalConcierge";
import type {
  ConciergeFollowUpTaskType,
  ConciergeIntroductionOutcome,
  ConciergeMemberFlag,
  ConciergeTimelineEventType
} from "../constants/conciergeConsultant";
import type { SignalConciergeApplication } from "./signalConcierge";
import type { ConciergeMemberConsultantSummary, ConciergeProfessionalChannel } from "./conciergeConsultantDirectory";
import type { JourneyArchiveMetadata } from "../constants/conciergeJourneyArchive";
import type { SuccessStoryConsentRecord } from "./conciergeSuccessStoryConsent";
import { CONCIERGE_MEMBER_OWNERSHIP } from "../constants/conciergeMemberOwnership";

export type ConciergeMemberOwnership = typeof CONCIERGE_MEMBER_OWNERSHIP;

export type ConciergeStewardshipTransfer = {
  id: string;
  fromConsultantId?: string;
  fromConsultantName?: string;
  toConsultantId: string;
  toConsultantName: string;
  transferredBy: string;
  transferredAt: string;
  note?: string;
  reason?: string;
  kind?: "journey-transition" | "continuity-support" | "exit-protocol";
};

export type ConciergeCommunicationJournalEntry = {
  id: string;
  memberId: string;
  consultantId: string;
  consultantName: string;
  date: string;
  durationMinutes?: number;
  platform: ConciergeProfessionalChannel;
  participants: string[];
  summary: string;
  outcome?: string;
  nextAction?: string;
  loggedAt: string;
  loggedBy: string;
};

export type ConciergePrivateNote = {
  id: string;
  memberId: string;
  consultantId: string;
  body: string;
  createdAt: string;
};

export type ConciergeTimelineEvent = {
  id: string;
  memberId: string;
  /** Permanent member journey reference — every timeline event carries it. */
  journeyId?: string;
  type: ConciergeTimelineEventType;
  label: string;
  at: string;
  detail?: string;
};

export type ConciergeIntroductionEntry = {
  id: string;
  memberId: string;
  introducedWithName: string;
  introducedWithId?: string;
  consultantId: string;
  date: string;
  outcome: ConciergeIntroductionOutcome;
  notes: string;
};

export type ConciergeFollowUpTask = {
  id: string;
  memberId: string;
  consultantId: string;
  type: ConciergeFollowUpTaskType;
  title: string;
  dueAt: string;
  completed: boolean;
  note?: string;
};

export type ConciergeMemberRecord = SignalConciergeApplication & {
  photos: string[];
  trustedMember: boolean;
  /** Always BamSignal — consultants never own members. */
  ownership: ConciergeMemberOwnership;
  /** Active journey steward (synced with assignedConsultantId). */
  currentConsultantId?: string;
  assignedBy?: string;
  assignedAt?: string;
  reassignedAt?: string;
  /** @deprecated use currentConsultantId — kept for compatibility */
  assignedConsultantId?: string;
  /** @deprecated use stewardship — kept for compatibility */
  assignedConsultantName?: string;
  stewardshipHistory: ConciergeStewardshipTransfer[];
  communicationJournal: ConciergeCommunicationJournalEntry[];
  flags: ConciergeMemberFlag[];
  privateNotes: ConciergePrivateNote[];
  timeline: ConciergeTimelineEvent[];
  introductions: ConciergeIntroductionEntry[];
  followUpTasks: ConciergeFollowUpTask[];
  /** Manual consultant summary — persists across steward transitions. Future AI-ready. */
  consultantSummary?: ConciergeMemberConsultantSummary;
  /** Permanent relationship archive metadata — journeys are never deleted. */
  journeyArchive?: JourneyArchiveMetadata;
  /** Success story sharing consent — dual approval required before publication. */
  successStoryConsent?: SuccessStoryConsentRecord;
  /** Permanent anniversary milestone timeline — part of Journey Archive. */
  journeyMilestoneTimeline?: import("./journeyMilestone").JourneyMilestoneTimeline;
};

export type ConciergeMemberFilters = {
  query: string;
  status: SignalConciergeStatus | "all";
  tier: SignalConciergeTierId | "all";
  consultant: string;
  city: string;
  religion: string;
  ageMin: string;
  ageMax: string;
  childrenPreference: string;
  relationshipGoal: string;
  relocation: boolean;
  diaspora: boolean;
  archiveStatus: import("../constants/conciergeJourneyArchive").RelationshipJourneyStatus | "all";
  marriageYear: string;
};

export const EMPTY_CONCIERGE_FILTERS: ConciergeMemberFilters = {
  query: "",
  status: "all",
  tier: "all",
  consultant: "",
  city: "",
  religion: "",
  ageMin: "",
  ageMax: "",
  childrenPreference: "",
  relationshipGoal: "",
  relocation: false,
  diaspora: false,
  archiveStatus: "all",
  marriageYear: ""
};

export type ConciergeMemberSummary = Pick<
  ConciergeMemberRecord,
  | "id"
  | "journeyId"
  | "status"
  | "preferredTier"
  | "aboutYou"
  | "flags"
  | "updatedAt"
  | "trustedMember"
  | "assignedConsultantName"
>;

export type ConciergeConsultantOperator = {
  id: string;
  name: string;
  title: string;
};

export type ConciergeConsultationChannel = SignalConciergeConsultationChannel;
