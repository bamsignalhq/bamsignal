import type {
  RelationshipCelebrationKind,
  RelationshipCheckInRhythm,
  RelationshipCheckInType,
  RelationshipFollowUpOutcome,
  RelationshipHealthLevel,
  RelationshipMilestoneId,
  RelationshipPipelinePhaseId,
  RelationshipRecoveryReason,
  RelationshipStage
} from "../constants/relationshipFollowUp";

export type RelationshipTimelineEntry = {
  id: string;
  at: string;
  label: string;
  detail?: string;
  stage?: RelationshipStage;
  pipelinePhase?: RelationshipPipelinePhaseId;
  outcome?: RelationshipFollowUpOutcome;
};

export type RelationshipJournalEntry = {
  id: string;
  at: string;
  body: string;
  author: "consultant";
};

export type RelationshipCheckInEntry = {
  id: string;
  at: string;
  rhythm: RelationshipCheckInRhythm;
  checkInType: RelationshipCheckInType;
  notes: string;
  outcome?: RelationshipFollowUpOutcome;
  nextCheckInAt?: string;
};

export type RelationshipMilestoneEntry = {
  id: string;
  milestoneId: RelationshipMilestoneId;
  milestoneAt: string;
  recordedAt: string;
  note?: string;
};

export type RelationshipCelebrationEntry = {
  id: string;
  at: string;
  kind: RelationshipCelebrationKind;
  note?: string;
};

export type RelationshipRecoveryEntry = {
  id: string;
  at: string;
  reason: RelationshipRecoveryReason;
  notes: string;
  resolved?: boolean;
};

export type RelationshipFollowUpRecord = {
  id: string;
  introductionId: string;
  memberAId: string;
  memberBId: string;
  journeyAId?: string;
  journeyBId?: string;
  consultantId: string;
  consultantName?: string;
  createdAt: string;
  updatedAt: string;
  stage: RelationshipStage;
  pipelinePhase: RelationshipPipelinePhaseId;
  healthLevel?: RelationshipHealthLevel;
  paused: boolean;
  pauseNotes?: string;
  pausedAt?: string;
  resumedAt?: string;
  outcome?: RelationshipFollowUpOutcome;
  journal: RelationshipJournalEntry[];
  checkIns: RelationshipCheckInEntry[];
  milestones: RelationshipMilestoneEntry[];
  celebrations: RelationshipCelebrationEntry[];
  recoveryNotes: RelationshipRecoveryEntry[];
  timeline: RelationshipTimelineEntry[];
  nextCheckInRhythm?: RelationshipCheckInRhythm;
  nextCheckInAt?: string;
  legacyArchiveReady?: boolean;
};

export type CreateRelationshipFollowUpInput = {
  introductionId: string;
  memberAId: string;
  memberBId: string;
  journeyAId?: string;
  journeyBId?: string;
  consultantId?: string;
  stage?: RelationshipStage;
};
