/** Signal Concierge Relationship Follow-Up Engine — server regression helpers. */

export const RELATIONSHIP_CHECK_IN_RHYTHMS = [
  { id: "7-days", label: "7 days", days: 7 },
  { id: "30-days", label: "30 days", days: 30 },
  { id: "90-days", label: "90 days", days: 90 },
  { id: "6-months", label: "6 months", days: 182 },
  { id: "1-year", label: "1 year", days: 365 },
  { id: "annually", label: "Annually", days: 365 }
];

export function assertRelationshipTimelineIntegrity(previous, next) {
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

export function pushRelationshipTimeline(record, input) {
  const entry = {
    id: `rt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
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

export function recordRelationshipMilestone(record, input) {
  const existing = record.milestones.find((item) => item.milestoneId === input.milestoneId);
  if (existing) return existing;

  const entry = {
    ...input,
    id: `rm_${Date.now()}`,
    recordedAt: new Date().toISOString()
  };
  record.milestones.unshift(entry);
  pushRelationshipTimeline(record, {
    label: input.milestoneId.replace(/-/g, " "),
    detail: input.note
  });
  return entry;
}

export function pauseRelationshipJourney(record, pauseNotes) {
  record.paused = true;
  record.pausedAt = new Date().toISOString();
  record.pauseNotes = pauseNotes;
  record.stage = "paused";
  record.outcome = "paused";
  pushRelationshipTimeline(record, {
    label: "Paused",
    detail: pauseNotes,
    stage: "paused"
  });
  return record;
}

export function resumeRelationshipJourney(record, resumeStage = "still-talking") {
  record.paused = false;
  record.resumedAt = new Date().toISOString();
  record.stage = resumeStage;
  record.outcome = undefined;
  pushRelationshipTimeline(record, {
    label: "Journey resumed",
    detail: `Returned to ${resumeStage}`,
    stage: resumeStage
  });
  return record;
}

export function markLegacyArchiveReady(record) {
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

export function findFollowUpByIntroduction(records, introductionId) {
  return records.find((record) => record.introductionId === introductionId) ?? null;
}

export function assertNoDuplicateFollowUp(records, introductionId) {
  const duplicate = findFollowUpByIntroduction(records, introductionId);
  if (duplicate) {
    throw new Error(`Follow-up already exists for introduction ${introductionId}`);
  }
}
