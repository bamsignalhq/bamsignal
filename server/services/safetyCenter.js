/**
 * Crisis & Safety Center™ — immutable case integrity (server-side).
 */

const IMMUTABLE_CASE_FIELDS = [
  "id",
  "caseRef",
  "incidentRef",
  "caseTypeId",
  "categoryId",
  "severity",
  "reportedAt",
  "reportedBy",
  "subjectRef",
  "subjectLabel",
  "summary"
];

export function assertSafetyTimelineAppendOnly(previous, next) {
  if (next.length < previous.length) {
    throw new Error("Safety integrity violation: timeline entries cannot be deleted");
  }

  for (let index = 0; index < previous.length; index += 1) {
    const prior = previous[index];
    const current = next[index];
    if (
      prior.id !== current.id ||
      prior.timestamp !== current.timestamp ||
      prior.workflow !== current.workflow ||
      prior.actor !== current.actor
    ) {
      throw new Error("Safety integrity violation: timeline history cannot be modified");
    }
  }
}

export function assertSafetyIncidentImmutable(previous, next) {
  if (next.length < previous.length) {
    throw new Error("Safety integrity violation: cases cannot be deleted");
  }

  for (let index = 0; index < previous.length; index += 1) {
    const prior = previous[index];
    const current = next[index];
    if (prior.id !== current.id) {
      throw new Error("Safety integrity violation: case identity cannot change");
    }

    for (const field of IMMUTABLE_CASE_FIELDS) {
      if (prior[field] !== undefined && current[field] !== undefined && prior[field] !== current[field]) {
        throw new Error(`Safety integrity violation: ${field} is immutable`);
      }
    }

    assertSafetyTimelineAppendOnly(prior.timeline ?? [], current.timeline ?? []);
  }
}

export function appendSafetyTimelineEntry(incident, input) {
  const entry = {
    ...input,
    id: `safety_tl_${String((incident.timeline?.length ?? 0) + 1).padStart(4, "0")}`,
    timestamp: new Date().toISOString()
  };
  const nextTimeline = [...(incident.timeline ?? []), entry];
  assertSafetyTimelineAppendOnly(incident.timeline ?? [], nextTimeline);
  return {
    ...incident,
    timeline: nextTimeline,
    status: input.toStatus ?? incident.status,
    investigator: input.investigator ?? incident.investigator,
    actionsTaken:
      input.actionId && !(incident.actionsTaken ?? []).includes(input.actionId)
        ? [...(incident.actionsTaken ?? []), input.actionId]
        : incident.actionsTaken ?? []
  };
}
