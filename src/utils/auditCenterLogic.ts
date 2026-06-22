import { AUDIT_COMPLIANCE_METRICS, AUDIT_ACTION_LABELS } from "../constants/auditCenter";
import { AUDIT_EVENTS_SEED } from "../data/auditCenterSeed";
import type { AuditEventRecord, AuditFilterState } from "../types/auditCenter";
import type { AuditActionId, AuditEntityId } from "../constants/auditCenter";

function isSameDay(left: string, right: string): boolean {
  return left.slice(0, 10) === right.slice(0, 10);
}

export function listAuditEvents(): AuditEventRecord[] {
  return [...AUDIT_EVENTS_SEED];
}

export function sortAuditEventsByTimestamp(events: AuditEventRecord[]): AuditEventRecord[] {
  return [...events].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
  );
}

export function findAuditEventById(events: AuditEventRecord[], eventId: string | null): AuditEventRecord | null {
  if (!eventId) return null;
  return events.find((event) => event.id === eventId) ?? null;
}

export function filterAuditEvents(events: AuditEventRecord[], filters: AuditFilterState): AuditEventRecord[] {
  return events.filter((event) => {
    if (filters.journeyId && !(event.journeyId ?? "").toLowerCase().includes(filters.journeyId.toLowerCase())) {
      return false;
    }
    if (
      filters.consultant &&
      !(event.consultantId ?? event.actor).toLowerCase().includes(filters.consultant.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.member &&
      !(event.memberId ?? "").toLowerCase().includes(filters.member.toLowerCase())
    ) {
      return false;
    }
    if (filters.date && !isSameDay(event.timestamp, filters.date)) {
      return false;
    }
    if (filters.action !== "all" && event.action !== filters.action) {
      return false;
    }
    if (filters.entity !== "all" && event.entity !== filters.entity) {
      return false;
    }
    return true;
  });
}

export function countEventsToday(events: AuditEventRecord[], now = new Date()): number {
  const today = now.toISOString().slice(0, 10);
  return events.filter((event) => event.timestamp.slice(0, 10) === today).length;
}

export function countByAction(events: AuditEventRecord[], action: AuditActionId): number {
  return events.filter((event) => event.action === action).length;
}

export function countFailedActions(events: AuditEventRecord[]): number {
  return events.filter((event) => event.result === "failed").length;
}

export function summarizeActions(events: AuditEventRecord[]) {
  const counts = new Map<AuditActionId, number>();
  for (const event of events) {
    counts.set(event.action, (counts.get(event.action) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([action, count]) => ({
      action,
      label: AUDIT_ACTION_LABELS[action],
      count
    }))
    .sort((left, right) => right.count - left.count);
}

export function buildComplianceMetrics(events: AuditEventRecord[]) {
  const values: Record<string, string> = {
    "events-today": String(countEventsToday(events)),
    assignments: String(countByAction(events, "consultant-assignment")),
    payments: String(countByAction(events, "payment-changes")),
    "permission-changes": String(countByAction(events, "permissions-updates")),
    exports: String(countByAction(events, "exports")),
    "failed-actions": String(countFailedActions(events))
  };

  return AUDIT_COMPLIANCE_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: values[metric.id] ?? "0",
    numericValue: Number(values[metric.id] ?? 0)
  }));
}

export function activeFilterFields(filters: AuditFilterState): string[] {
  const active: string[] = [];
  if (filters.journeyId) active.push("journeyId");
  if (filters.consultant) active.push("consultant");
  if (filters.member) active.push("member");
  if (filters.date) active.push("date");
  if (filters.action !== "all") active.push("action");
  if (filters.entity !== "all") active.push("entity");
  return active;
}

export function emptyAuditFilters(): AuditFilterState {
  return {
    journeyId: "",
    consultant: "",
    member: "",
    date: "",
    action: "all",
    entity: "all"
  };
}

/**
 * Append-only integrity — audit history cannot be deleted or rewritten.
 */
export function assertAuditLogAppendOnly(
  previous: AuditEventRecord[],
  next: AuditEventRecord[]
): void {
  if (next.length < previous.length) {
    throw new Error("Audit integrity violation: events cannot be deleted");
  }

  for (let index = 0; index < previous.length; index += 1) {
    const prior = previous[index];
    const current = next[index];
    if (
      prior.id !== current.id ||
      prior.timestamp !== current.timestamp ||
      prior.action !== current.action ||
      prior.actor !== current.actor
    ) {
      throw new Error("Audit integrity violation: history cannot be modified");
    }
  }
}

export function createAuditEventId(sequence: number): string {
  return `audit_${String(sequence).padStart(4, "0")}`;
}

export function appendAuditEventRecord(
  events: AuditEventRecord[],
  input: Omit<AuditEventRecord, "id" | "timestamp">
): AuditEventRecord[] {
  const record: AuditEventRecord = {
    ...input,
    id: createAuditEventId(events.length + 1),
    timestamp: new Date().toISOString()
  };
  const next = [...events, record];
  assertAuditLogAppendOnly(events, next);
  return next;
}

export function entityMatchesFilter(entity: AuditEntityId, filter: AuditEntityId | "all"): boolean {
  return filter === "all" || entity === filter;
}
