import { SAFETY_METRICS } from "../constants/safetyCenter";
import { SAFETY_CASES_SEED } from "../data/safetyCenterSeed";
import type {
  SafetyCaseRecord,
  SafetyFilterState,
  SafetyRiskAssessment,
  SafetyTimelineEntry
} from "../types/safetyCenter";
import type { SafetyCaseTypeId, SafetySeverityId, SafetyStatusId } from "../constants/safetyCenter";

const CLOSED_STATUSES: SafetyStatusId[] = ["resolved", "closed"];

function caseTypeId(record: SafetyCaseRecord): SafetyCaseTypeId {
  return record.caseTypeId ?? record.categoryId ?? "harassment";
}

function caseRef(record: SafetyCaseRecord): string {
  return record.caseRef ?? record.incidentRef ?? record.id;
}

function normalizeCase(record: SafetyCaseRecord): SafetyCaseRecord {
  return {
    ...record,
    caseRef: caseRef(record),
    caseTypeId: caseTypeId(record),
    actionsTaken: record.actionsTaken ?? []
  };
}

export function listSafetyCases(): SafetyCaseRecord[] {
  return SAFETY_CASES_SEED.map(normalizeCase);
}

/** @deprecated Use listSafetyCases */
export function listSafetyIncidents(): SafetyCaseRecord[] {
  return listSafetyCases();
}

export function sortCasesByReportedAt(cases: SafetyCaseRecord[]): SafetyCaseRecord[] {
  return [...cases].sort(
    (left, right) => new Date(right.reportedAt).getTime() - new Date(left.reportedAt).getTime()
  );
}

export function findCaseById(cases: SafetyCaseRecord[], caseId: string | null): SafetyCaseRecord | null {
  if (!caseId) return null;
  return cases.find((record) => record.id === caseId) ?? null;
}

/** @deprecated Use findCaseById */
export function findIncidentById(cases: SafetyCaseRecord[], incidentId: string | null): SafetyCaseRecord | null {
  return findCaseById(cases, incidentId);
}

export function filterSafetyCases(cases: SafetyCaseRecord[], filters: SafetyFilterState): SafetyCaseRecord[] {
  const query = filters.query.trim().toLowerCase();
  const typeFilter = filters.caseTypeId ?? filters.categoryId ?? "all";

  return cases.filter((record) => {
    const typeId = caseTypeId(record);
    if (typeFilter !== "all" && typeId !== typeFilter) return false;
    if (filters.severity !== "all" && record.severity !== filters.severity) return false;
    if (filters.status !== "all" && record.status !== filters.status) return false;
    if (!query) return true;

    const haystack = [
      caseRef(record),
      record.summary,
      record.subjectLabel,
      record.subjectRef,
      record.reportedBy,
      record.investigator ?? ""
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

/** @deprecated Use filterSafetyCases */
export function filterSafetyIncidents(cases: SafetyCaseRecord[], filters: SafetyFilterState): SafetyCaseRecord[] {
  return filterSafetyCases(cases, filters);
}

export function isOpenCase(record: SafetyCaseRecord): boolean {
  return !CLOSED_STATUSES.includes(record.status);
}

/** @deprecated Use isOpenCase */
export function isOpenIncident(record: SafetyCaseRecord): boolean {
  return isOpenCase(record);
}

export function countOpenCases(cases: SafetyCaseRecord[]): number {
  return cases.filter(isOpenCase).length;
}

export function countHighRiskCases(cases: SafetyCaseRecord[]): number {
  return cases.filter(
    (record) =>
      isOpenCase(record) &&
      (record.severity === "high" || record.severity === "critical" || record.status === "action-required")
  ).length;
}

export function filterEscalationQueue(cases: SafetyCaseRecord[]): SafetyCaseRecord[] {
  return cases.filter(
    (record) =>
      isOpenCase(record) &&
      (record.status === "action-required" || record.severity === "critical")
  );
}

export function countRepeatOffenders(cases: SafetyCaseRecord[]): number {
  const subjectCounts = new Map<string, number>();
  for (const record of cases) {
    subjectCounts.set(record.subjectRef, (subjectCounts.get(record.subjectRef) ?? 0) + 1);
  }
  return [...subjectCounts.values()].filter((count) => count > 1).length;
}

export function averageResolutionTimeHours(cases: SafetyCaseRecord[]): number | null {
  const resolved = cases.filter((record) => record.timeline.some((entry) => entry.toStatus === "resolved"));
  if (!resolved.length) return null;

  let totalHours = 0;
  for (const record of resolved) {
    const resolvedEntry = record.timeline.find((entry) => entry.toStatus === "resolved");
    if (!resolvedEntry) continue;
    const reported = new Date(record.reportedAt).getTime();
    const resolvedAt = new Date(resolvedEntry.timestamp).getTime();
    totalHours += (resolvedAt - reported) / (1000 * 60 * 60);
  }

  return Math.round(totalHours / resolved.length);
}

export function buildSafetyMetrics(cases: SafetyCaseRecord[]) {
  const resolutionHours = averageResolutionTimeHours(cases);
  const values: Record<string, string> = {
    "open-cases": String(countOpenCases(cases)),
    "average-resolution-time": resolutionHours === null ? "—" : `${resolutionHours}h avg`,
    "high-risk-cases": String(countHighRiskCases(cases)),
    "repeat-offenders": String(countRepeatOffenders(cases))
  };

  return SAFETY_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: values[metric.id] ?? "0",
    numericValue: Number(values[metric.id]) || undefined
  }));
}

export function assessCaseRisk(record: SafetyCaseRecord, allCases: SafetyCaseRecord[]): SafetyRiskAssessment {
  const factors: string[] = [];
  let score = 0;

  if (record.severity === "critical") {
    score += 40;
    factors.push("Critical severity");
  } else if (record.severity === "high") {
    score += 28;
    factors.push("High severity");
  } else if (record.severity === "medium") {
    score += 14;
  }

  if (record.status === "action-required") {
    score += 25;
    factors.push("Action required");
  }

  const priorCases = allCases.filter(
    (item) => item.subjectRef === record.subjectRef && item.id !== record.id
  );
  if (priorCases.length) {
    score += 20;
    factors.push("Repeat subject");
  }

  if (record.caseTypeId === "emergency-escalation" || record.caseTypeId === "threats") {
    score += 15;
    factors.push("High-priority case type");
  }

  const label = score >= 70 ? "Critical risk" : score >= 45 ? "Elevated risk" : score >= 25 ? "Moderate risk" : "Low risk";

  return { score: Math.min(score, 100), label, factors };
}

export function emptySafetyFilters(): SafetyFilterState {
  return {
    query: "",
    caseTypeId: "all",
    severity: "all",
    status: "all"
  };
}

export function assertSafetyTimelineAppendOnly(
  previous: SafetyTimelineEntry[],
  next: SafetyTimelineEntry[]
): void {
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

export function assertSafetyIncidentImmutable(
  previous: SafetyCaseRecord[],
  next: SafetyCaseRecord[]
): void {
  if (next.length < previous.length) {
    throw new Error("Safety integrity violation: cases cannot be deleted");
  }

  const immutableFields: (keyof SafetyCaseRecord)[] = [
    "id",
    "caseRef",
    "caseTypeId",
    "severity",
    "reportedAt",
    "reportedBy",
    "subjectRef",
    "subjectLabel",
    "summary"
  ];

  for (let index = 0; index < previous.length; index += 1) {
    const prior = normalizeCase(previous[index]);
    const current = normalizeCase(next[index]);
    if (prior.id !== current.id) {
      throw new Error("Safety integrity violation: case identity cannot change");
    }

    for (const field of immutableFields) {
      if (prior[field] !== current[field]) {
        throw new Error(`Safety integrity violation: ${field} is immutable`);
      }
    }

    assertSafetyTimelineAppendOnly(prior.timeline, current.timeline);
  }
}

export function createTimelineEntryId(sequence: number): string {
  return `safety_tl_${String(sequence).padStart(4, "0")}`;
}

export function appendTimelineEntry(
  record: SafetyCaseRecord,
  input: Omit<SafetyTimelineEntry, "id" | "timestamp"> & { investigator?: string | null }
): SafetyCaseRecord {
  const entry: SafetyTimelineEntry = {
    id: createTimelineEntryId(record.timeline.length + 1),
    timestamp: new Date().toISOString(),
    workflow: input.workflow,
    actor: input.actor,
    note: input.note,
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
    actionId: input.actionId
  };

  const nextTimeline = [...record.timeline, entry];
  assertSafetyTimelineAppendOnly(record.timeline, nextTimeline);

  const actionsTaken =
    input.actionId && !record.actionsTaken.includes(input.actionId)
      ? [...record.actionsTaken, input.actionId]
      : record.actionsTaken;

  return {
    ...normalizeCase(record),
    timeline: nextTimeline,
    status: input.toStatus ?? record.status,
    investigator: input.investigator !== undefined ? input.investigator : record.investigator,
    actionsTaken
  };
}
