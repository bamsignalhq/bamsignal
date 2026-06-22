import {
  RELATIONSHIP_PIPELINE_PHASES,
  RELATIONSHIP_STAGE_LABELS,
  type RelationshipPipelinePhaseId,
  type RelationshipStage
} from "../constants/relationshipFollowUp";
import type {
  RelationshipFollowUpRecord,
  RelationshipMilestoneEntry,
  RelationshipTimelineEntry
} from "../types/relationshipFollowUp";

const STAGE_TO_PIPELINE: Partial<Record<RelationshipStage, RelationshipPipelinePhaseId>> = {
  "still-talking": "still-talking",
  "getting-to-know": "dating",
  exclusive: "exclusive",
  relationship: "relationship",
  engaged: "engaged",
  married: "married",
  archived: "legacy-archive"
};

export function normalizeRelationshipFollowUpRecord(
  record: RelationshipFollowUpRecord
): RelationshipFollowUpRecord {
  return {
    ...record,
    journal: record.journal ?? [],
    checkIns: record.checkIns ?? [],
    milestones: record.milestones ?? [],
    celebrations: record.celebrations ?? [],
    recoveryNotes: record.recoveryNotes ?? [],
    timeline: record.timeline ?? [],
    paused: record.paused ?? false,
    pipelinePhase: record.pipelinePhase ?? "introduction-made"
  };
}

export function assertRelationshipTimelineIntegrity(
  previous: RelationshipFollowUpRecord,
  next: RelationshipFollowUpRecord
): void {
  if (next.timeline.length < previous.timeline.length) {
    throw new Error("Relationship timeline cannot shrink");
  }
  if (previous.milestones.length > next.milestones.length) {
    throw new Error("Relationship milestones cannot be removed");
  }
  if (previous.introductionId && next.introductionId !== previous.introductionId) {
    throw new Error("Introduction ID cannot change on follow-up record");
  }
}

export function pushRelationshipTimeline(
  record: RelationshipFollowUpRecord,
  input: {
    label: string;
    detail?: string;
    stage?: RelationshipStage;
    pipelinePhase?: RelationshipPipelinePhaseId;
    outcome?: RelationshipFollowUpRecord["outcome"];
  }
): RelationshipTimelineEntry {
  const entry: RelationshipTimelineEntry = {
    id: `rt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    label: input.label,
    detail: input.detail,
    stage: input.stage,
    pipelinePhase: input.pipelinePhase,
    outcome: input.outcome
  };
  record.timeline.unshift(entry);
  if (input.pipelinePhase) record.pipelinePhase = input.pipelinePhase;
  if (input.stage) record.stage = input.stage;
  return entry;
}

export function deriveRelationshipPipelinePhases(record: RelationshipFollowUpRecord) {
  const historyPhases = new Set(record.timeline.map((item) => item.pipelinePhase).filter(Boolean));
  const milestoneIds = new Set(record.milestones.map((item) => item.milestoneId));

  const reachedByPhase: Record<RelationshipPipelinePhaseId, boolean> = {
    "introduction-made": true,
    "still-talking":
      historyPhases.has("still-talking") ||
      ["still-talking", "getting-to-know", "exclusive", "relationship", "engaged", "married", "archived"].includes(
        record.stage
      ),
    dating:
      historyPhases.has("dating") ||
      record.stage === "getting-to-know" ||
      milestoneIds.has("first-date"),
    exclusive:
      historyPhases.has("exclusive") ||
      record.stage === "exclusive" ||
      milestoneIds.has("exclusive"),
    relationship:
      historyPhases.has("relationship") ||
      record.stage === "relationship" ||
      milestoneIds.has("relationship"),
    engaged:
      historyPhases.has("engaged") ||
      record.stage === "engaged" ||
      milestoneIds.has("engagement"),
    married:
      historyPhases.has("married") ||
      record.stage === "married" ||
      milestoneIds.has("marriage"),
    "legacy-archive":
      historyPhases.has("legacy-archive") ||
      record.stage === "archived" ||
      record.legacyArchiveReady === true
  };

  return RELATIONSHIP_PIPELINE_PHASES.map((phase) => ({
    id: phase.id,
    label: phase.label,
    reached: reachedByPhase[phase.id]
  }));
}

export function pauseRelationshipJourney(
  record: RelationshipFollowUpRecord,
  pauseNotes?: string
): RelationshipFollowUpRecord {
  record.paused = true;
  record.pausedAt = new Date().toISOString();
  record.pauseNotes = pauseNotes;
  record.stage = "paused";
  record.outcome = "paused";
  pushRelationshipTimeline(record, {
    label: RELATIONSHIP_STAGE_LABELS.paused,
    detail: pauseNotes,
    stage: "paused"
  });
  return record;
}

export function resumeRelationshipJourney(
  record: RelationshipFollowUpRecord,
  resumeStage: RelationshipStage = "still-talking"
): RelationshipFollowUpRecord {
  record.paused = false;
  record.resumedAt = new Date().toISOString();
  record.stage = resumeStage;
  record.outcome = undefined;
  const pipelinePhase = STAGE_TO_PIPELINE[resumeStage] ?? record.pipelinePhase;
  pushRelationshipTimeline(record, {
    label: "Journey resumed",
    detail: `Returned to ${RELATIONSHIP_STAGE_LABELS[resumeStage]}`,
    stage: resumeStage,
    pipelinePhase
  });
  return record;
}

export function recordRelationshipMilestone(
  record: RelationshipFollowUpRecord,
  input: Omit<RelationshipMilestoneEntry, "id" | "recordedAt">
): RelationshipMilestoneEntry {
  const existing = record.milestones.find((item) => item.milestoneId === input.milestoneId);
  if (existing) return existing;

  const entry: RelationshipMilestoneEntry = {
    ...input,
    id: `rm_${Date.now().toString(36)}`,
    recordedAt: new Date().toISOString()
  };
  record.milestones.unshift(entry);
  pushRelationshipTimeline(record, {
    label: entry.milestoneId.replace(/-/g, " "),
    detail: entry.note,
    pipelinePhase: STAGE_TO_PIPELINE[record.stage]
  });
  return entry;
}

export function markLegacyArchiveReady(record: RelationshipFollowUpRecord): RelationshipFollowUpRecord {
  record.legacyArchiveReady = true;
  record.stage = "archived";
  record.pipelinePhase = "legacy-archive";
  pushRelationshipTimeline(record, {
    label: "Legacy Archive",
    detail: "Journey preserved permanently",
    stage: "archived",
    pipelinePhase: "legacy-archive"
  });
  return record;
}

export function findFollowUpByIntroduction(
  records: RelationshipFollowUpRecord[],
  introductionId: string
): RelationshipFollowUpRecord | null {
  return records.find((record) => record.introductionId === introductionId) ?? null;
}

export function assertNoDuplicateFollowUp(
  records: RelationshipFollowUpRecord[],
  introductionId: string
): void {
  const duplicate = findFollowUpByIntroduction(records, introductionId);
  if (duplicate) {
    throw new Error(`Follow-up already exists for introduction ${introductionId}`);
  }
}
