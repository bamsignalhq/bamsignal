import {
  RELATIONSHIP_CHECK_IN_RHYTHMS,
  RELATIONSHIP_FOLLOW_UP_OUTCOME_LABELS,
  RELATIONSHIP_STAGE_LABELS,
  type RelationshipCheckInRhythm,
  type RelationshipCheckInType,
  type RelationshipCelebrationKind,
  type RelationshipFollowUpOutcome,
  type RelationshipHealthLevel,
  type RelationshipMilestoneId,
  type RelationshipRecoveryReason,
  type RelationshipStage
} from "../constants/relationshipFollowUp";
import type {
  CreateRelationshipFollowUpInput,
  RelationshipCelebrationEntry,
  RelationshipCheckInEntry,
  RelationshipJournalEntry,
  RelationshipRecoveryEntry
} from "../types/relationshipFollowUp";
import { getConciergeMember } from "./conciergeConsultantStore";
import { getConciergeConsultant } from "./conciergeConsultantDirectoryStore";
import {
  getRelationshipFollowUpRecord,
  listRelationshipFollowUpRecords,
  saveRelationshipFollowUpRecord
} from "./relationshipFollowUpStore";
import {
  assertNoDuplicateFollowUp,
  markLegacyArchiveReady,
  pauseRelationshipJourney,
  pushRelationshipTimeline,
  recordRelationshipMilestone,
  resumeRelationshipJourney
} from "./relationshipFollowUpLogic";

const DEFAULT_CONSULTANT_ID = "consultant_ada";

export function listActiveRelationshipFollowUps() {
  return listRelationshipFollowUpRecords().filter(
    (record) => !record.paused && record.stage !== "ended" && record.stage !== "archived"
  );
}

export function listRelationshipFollowUpHistory() {
  return [...listRelationshipFollowUpRecords()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function createRelationshipFollowUp(input: CreateRelationshipFollowUpInput) {
  const existing = listRelationshipFollowUpRecords();
  try {
    assertNoDuplicateFollowUp(existing, input.introductionId);
  } catch {
    return null;
  }

  const memberA = getConciergeMember(input.memberAId);
  const memberB = getConciergeMember(input.memberBId);
  if (!memberA || !memberB) return null;

  const now = new Date().toISOString();
  const consultantId = input.consultantId ?? DEFAULT_CONSULTANT_ID;
  const consultant = getConciergeConsultant(consultantId);
  const recordId = `rfu_${Date.now().toString(36)}`;

  const record = {
    id: recordId,
    introductionId: input.introductionId,
    memberAId: input.memberAId,
    memberBId: input.memberBId,
    journeyAId: input.journeyAId ?? memberA.journeyId,
    journeyBId: input.journeyBId ?? memberB.journeyId,
    consultantId,
    consultantName: consultant?.name,
    createdAt: now,
    updatedAt: now,
    stage: input.stage ?? ("still-talking" as RelationshipStage),
    pipelinePhase: "introduction-made" as const,
    paused: false,
    journal: [],
    checkIns: [],
    milestones: [],
    celebrations: [],
    recoveryNotes: [],
    timeline: []
  };

  pushRelationshipTimeline(record, {
    label: "Introduction Made",
    pipelinePhase: "introduction-made",
    stage: record.stage
  });

  if (record.stage !== "still-talking") {
    pushRelationshipTimeline(record, {
      label: RELATIONSHIP_STAGE_LABELS[record.stage],
      stage: record.stage
    });
  }

  return saveRelationshipFollowUpRecord(record);
}

export function advanceRelationshipStage(id: string, stage: RelationshipStage) {
  const record = getRelationshipFollowUpRecord(id);
  if (!record || record.paused) return null;
  record.stage = stage;
  pushRelationshipTimeline(record, {
    label: RELATIONSHIP_STAGE_LABELS[stage],
    stage
  });
  return saveRelationshipFollowUpRecord(record);
}

export function setRelationshipHealth(id: string, healthLevel: RelationshipHealthLevel) {
  const record = getRelationshipFollowUpRecord(id);
  if (!record) return null;
  record.healthLevel = healthLevel;
  return saveRelationshipFollowUpRecord(record);
}

export function addRelationshipJournalEntry(
  id: string,
  body: string
): RelationshipJournalEntry | null {
  const record = getRelationshipFollowUpRecord(id);
  if (!record) return null;
  const entry: RelationshipJournalEntry = {
    id: `rj_${Date.now().toString(36)}`,
    at: new Date().toISOString(),
    author: "consultant",
    body: body.trim()
  };
  record.journal.unshift(entry);
  saveRelationshipFollowUpRecord(record);
  return entry;
}

export function scheduleRelationshipCheckIn(id: string, rhythm: RelationshipCheckInRhythm) {
  const record = getRelationshipFollowUpRecord(id);
  if (!record) return null;
  const config = RELATIONSHIP_CHECK_IN_RHYTHMS.find((item) => item.id === rhythm);
  if (!config) return null;
  const next = new Date();
  next.setDate(next.getDate() + config.days);
  record.nextCheckInRhythm = rhythm;
  record.nextCheckInAt = next.toISOString();
  return saveRelationshipFollowUpRecord(record);
}

export function recordRelationshipCheckIn(
  id: string,
  input: {
    rhythm: RelationshipCheckInRhythm;
    checkInType: RelationshipCheckInType;
    notes: string;
    outcome?: RelationshipFollowUpOutcome;
  }
): RelationshipCheckInEntry | null {
  const record = getRelationshipFollowUpRecord(id);
  if (!record) return null;
  const config = RELATIONSHIP_CHECK_IN_RHYTHMS.find((item) => item.id === input.rhythm);
  const nextCheckInAt = config
    ? new Date(Date.now() + config.days * 86400000).toISOString()
    : undefined;

  const entry: RelationshipCheckInEntry = {
    id: `rc_${Date.now().toString(36)}`,
    at: new Date().toISOString(),
    rhythm: input.rhythm,
    checkInType: input.checkInType,
    notes: input.notes.trim(),
    outcome: input.outcome,
    nextCheckInAt
  };
  record.checkIns.unshift(entry);
  if (input.outcome) record.outcome = input.outcome;
  if (config) {
    record.nextCheckInRhythm = input.rhythm;
    record.nextCheckInAt = nextCheckInAt;
  }
  pushRelationshipTimeline(record, {
    label: "Check-in recorded",
    detail: input.notes.slice(0, 80),
    outcome: input.outcome
  });
  saveRelationshipFollowUpRecord(record);
  return entry;
}

export function addRelationshipMilestone(
  id: string,
  milestoneId: RelationshipMilestoneId,
  milestoneAt: string,
  note?: string
) {
  const record = getRelationshipFollowUpRecord(id);
  if (!record) return null;
  recordRelationshipMilestone(record, { milestoneId, milestoneAt, note });
  return saveRelationshipFollowUpRecord(record);
}

export function addRelationshipCelebration(
  id: string,
  kind: RelationshipCelebrationKind,
  note?: string
): RelationshipCelebrationEntry | null {
  const record = getRelationshipFollowUpRecord(id);
  if (!record) return null;
  const entry: RelationshipCelebrationEntry = {
    id: `rce_${Date.now().toString(36)}`,
    at: new Date().toISOString(),
    kind,
    note
  };
  record.celebrations.unshift(entry);
  pushRelationshipTimeline(record, {
    label: "Celebrating Your Journey",
    detail: note ?? kind
  });
  saveRelationshipFollowUpRecord(record);
  return entry;
}

export function pauseRelationshipFollowUp(id: string, pauseNotes?: string) {
  const record = getRelationshipFollowUpRecord(id);
  if (!record) return null;
  pauseRelationshipJourney(record, pauseNotes);
  return saveRelationshipFollowUpRecord(record);
}

export function resumeRelationshipFollowUp(id: string, resumeStage?: RelationshipStage) {
  const record = getRelationshipFollowUpRecord(id);
  if (!record) return null;
  resumeRelationshipJourney(record, resumeStage);
  return saveRelationshipFollowUpRecord(record);
}

export function addRelationshipRecoveryNote(
  id: string,
  reason: RelationshipRecoveryReason,
  notes: string
): RelationshipRecoveryEntry | null {
  const record = getRelationshipFollowUpRecord(id);
  if (!record) return null;
  const entry: RelationshipRecoveryEntry = {
    id: `rr_${Date.now().toString(36)}`,
    at: new Date().toISOString(),
    reason,
    notes: notes.trim()
  };
  record.recoveryNotes.unshift(entry);
  pushRelationshipTimeline(record, {
    label: "Recovery support",
    detail: notes.slice(0, 80)
  });
  saveRelationshipFollowUpRecord(record);
  return entry;
}

export function setRelationshipFollowUpOutcome(id: string, outcome: RelationshipFollowUpOutcome) {
  const record = getRelationshipFollowUpRecord(id);
  if (!record) return null;
  record.outcome = outcome;
  if (outcome === "paused") {
    pauseRelationshipJourney(record);
  } else if (outcome === "ended-respectfully") {
    record.stage = "ended";
  } else if (outcome === "engaged") {
    record.stage = "engaged";
  } else if (outcome === "married") {
    record.stage = "married";
  } else if (outcome === "relationship-formed") {
    record.stage = "relationship";
  }
  pushRelationshipTimeline(record, {
    label: RELATIONSHIP_FOLLOW_UP_OUTCOME_LABELS[outcome],
    outcome
  });
  return saveRelationshipFollowUpRecord(record);
}

export function archiveRelationshipFollowUp(id: string) {
  const record = getRelationshipFollowUpRecord(id);
  if (!record) return null;
  markLegacyArchiveReady(record);
  return saveRelationshipFollowUpRecord(record);
}

export function getFollowUpMemberDisplayName(memberId: string): string {
  return getConciergeMember(memberId)?.aboutYou.name ?? memberId;
}
