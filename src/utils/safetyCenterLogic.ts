import { SAFETY_METRICS } from "../constants/safetyCenter";
import { SAFETY_INCIDENTS_SEED } from "../data/safetyCenterSeed";
import type {
  SafetyFilterState,
  SafetyIncidentRecord,
  SafetyTimelineEntry
} from "../types/safetyCenter";
import type { SafetyCategoryId, SafetySeverityId, SafetyStatusId } from "../constants/safetyCenter";

const CLOSED_STATUSES: SafetyStatusId[] = ["resolved", "closed"];

export function listSafetyIncidents(): SafetyIncidentRecord[] {
  return [...SAFETY_INCIDENTS_SEED];
}

export function sortIncidentsByReportedAt(incidents: SafetyIncidentRecord[]): SafetyIncidentRecord[] {
  return [...incidents].sort(
    (left, right) => new Date(right.reportedAt).getTime() - new Date(left.reportedAt).getTime()
  );
}

export function findIncidentById(
  incidents: SafetyIncidentRecord[],
  incidentId: string | null
): SafetyIncidentRecord | null {
  if (!incidentId) return null;
  return incidents.find((incident) => incident.id === incidentId) ?? null;
}

export function filterSafetyIncidents(
  incidents: SafetyIncidentRecord[],
  filters: SafetyFilterState
): SafetyIncidentRecord[] {
  const query = filters.query.trim().toLowerCase();

  return incidents.filter((incident) => {
    if (filters.categoryId !== "all" && incident.categoryId !== filters.categoryId) return false;
    if (filters.severity !== "all" && incident.severity !== filters.severity) return false;
    if (filters.status !== "all" && incident.status !== filters.status) return false;
    if (!query) return true;

    const haystack = [
      incident.incidentRef,
      incident.summary,
      incident.subjectLabel,
      incident.subjectRef,
      incident.reportedBy,
      incident.investigator ?? ""
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function isOpenIncident(incident: SafetyIncidentRecord): boolean {
  return !CLOSED_STATUSES.includes(incident.status);
}

export function countOpenIncidents(incidents: SafetyIncidentRecord[]): number {
  return incidents.filter(isOpenIncident).length;
}

export function countCriticalIncidents(incidents: SafetyIncidentRecord[]): number {
  return incidents.filter(
    (incident) => incident.severity === "critical" && isOpenIncident(incident)
  ).length;
}

export function countEscalations(incidents: SafetyIncidentRecord[]): number {
  return incidents.filter((incident) => incident.status === "escalated").length;
}

export function countRepeatReports(incidents: SafetyIncidentRecord[]): number {
  const subjectCounts = new Map<string, number>();
  for (const incident of incidents) {
    subjectCounts.set(incident.subjectRef, (subjectCounts.get(incident.subjectRef) ?? 0) + 1);
  }
  return [...subjectCounts.values()].filter((count) => count > 1).length;
}

export function averageResolutionTimeHours(incidents: SafetyIncidentRecord[]): number | null {
  const resolved = incidents.filter((incident) => {
    return incident.timeline.some((entry) => entry.toStatus === "resolved");
  });

  if (!resolved.length) return null;

  let totalHours = 0;
  for (const incident of resolved) {
    const resolvedEntry = incident.timeline.find((entry) => entry.toStatus === "resolved");
    if (!resolvedEntry) continue;
    const reported = new Date(incident.reportedAt).getTime();
    const resolvedAt = new Date(resolvedEntry.timestamp).getTime();
    totalHours += (resolvedAt - reported) / (1000 * 60 * 60);
  }

  return Math.round(totalHours / resolved.length);
}

export function buildSafetyMetrics(incidents: SafetyIncidentRecord[]) {
  const resolutionHours = averageResolutionTimeHours(incidents);
  const values: Record<string, string> = {
    "open-incidents": String(countOpenIncidents(incidents)),
    "critical-incidents": String(countCriticalIncidents(incidents)),
    "resolution-time": resolutionHours === null ? "—" : `${resolutionHours}h avg`,
    escalations: String(countEscalations(incidents)),
    "repeat-reports": String(countRepeatReports(incidents))
  };

  return SAFETY_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: values[metric.id] ?? "0",
    numericValue: Number(values[metric.id]) || undefined
  }));
}

export function emptySafetyFilters(): SafetyFilterState {
  return {
    query: "",
    categoryId: "all",
    severity: "all",
    status: "all"
  };
}

/**
 * Immutable incident integrity — incidents cannot be deleted and report fields cannot be rewritten.
 */
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
  previous: SafetyIncidentRecord[],
  next: SafetyIncidentRecord[]
): void {
  if (next.length < previous.length) {
    throw new Error("Safety integrity violation: incidents cannot be deleted");
  }

  const immutableFields: (keyof SafetyIncidentRecord)[] = [
    "id",
    "incidentRef",
    "categoryId",
    "severity",
    "reportedAt",
    "reportedBy",
    "subjectRef",
    "subjectLabel",
    "summary"
  ];

  for (let index = 0; index < previous.length; index += 1) {
    const prior = previous[index];
    const current = next[index];
    if (prior.id !== current.id) {
      throw new Error("Safety integrity violation: incident identity cannot change");
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
  incident: SafetyIncidentRecord,
  input: Omit<SafetyTimelineEntry, "id" | "timestamp"> & { investigator?: string | null }
): SafetyIncidentRecord {
  const entry: SafetyTimelineEntry = {
    id: createTimelineEntryId(incident.timeline.length + 1),
    timestamp: new Date().toISOString(),
    workflow: input.workflow,
    actor: input.actor,
    note: input.note,
    fromStatus: input.fromStatus,
    toStatus: input.toStatus
  };

  const nextTimeline = [...incident.timeline, entry];
  assertSafetyTimelineAppendOnly(incident.timeline, nextTimeline);

  return {
    ...incident,
    timeline: nextTimeline,
    status: input.toStatus ?? incident.status,
    investigator: input.investigator !== undefined ? input.investigator : incident.investigator
  };
}
