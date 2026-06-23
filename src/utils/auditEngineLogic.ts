import {
  INSTITUTIONAL_AUDIT_ACTION_LABELS,
  INSTITUTIONAL_COMPLIANCE_METRICS,
  type AuditActionId,
  type AuditSeverityId
} from "../constants/institutionalAuditCompliance";
import { INSTITUTIONAL_AUDIT_EVENTS_SEED } from "../data/institutionalAuditSeed";
import type {
  AuditEvent,
  InstitutionalComplianceFilters,
  InstitutionalComplianceMetric
} from "../types/auditEngine";

function isSameDay(left: string, right: string): boolean {
  return left.slice(0, 10) === right.slice(0, 10);
}

export function listInstitutionalAuditEvents(): AuditEvent[] {
  return [...INSTITUTIONAL_AUDIT_EVENTS_SEED];
}

export function sortAuditEventsByTimestamp(events: AuditEvent[]): AuditEvent[] {
  return [...events].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
  );
}

export function findInstitutionalAuditEvent(
  events: AuditEvent[],
  eventId: string | null
): AuditEvent | null {
  if (!eventId) return null;
  return events.find((event) => event.id === eventId) ?? null;
}

export function filterInstitutionalAuditEvents(
  events: AuditEvent[],
  filters: InstitutionalComplianceFilters
): AuditEvent[] {
  return events.filter((event) => {
    if (filters.date && !isSameDay(event.timestamp, filters.date)) {
      return false;
    }
    if (filters.actor) {
      const needle = filters.actor.toLowerCase();
      const haystack = `${event.actor.name} ${event.actor.email} ${event.actor.role}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    if (filters.action !== "all" && event.action !== filters.action) {
      return false;
    }
    if (filters.target) {
      const needle = filters.target.toLowerCase();
      const haystack = `${event.target.label} ${event.target.ref ?? ""} ${event.target.kind}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    if (filters.severity !== "all" && event.severity !== filters.severity) {
      return false;
    }
    return true;
  });
}

export function countEventsToday(events: AuditEvent[], now = new Date()): number {
  const today = now.toISOString().slice(0, 10);
  return events.filter((event) => event.timestamp.slice(0, 10) === today).length;
}

export function countByAction(events: AuditEvent[], action: AuditActionId): number {
  return events.filter((event) => event.action === action).length;
}

export function countBySeverity(events: AuditEvent[], severity: AuditSeverityId): number {
  return events.filter((event) => event.severity === severity).length;
}

export function countFailedActions(events: AuditEvent[]): number {
  return events.filter((event) => event.result === "failed").length;
}

export function buildInstitutionalComplianceMetrics(events: AuditEvent[]): InstitutionalComplianceMetric[] {
  const values: Record<string, string> = {
    "events-today": String(countEventsToday(events)),
    "critical-events": String(countBySeverity(events, "critical")),
    "permission-changes": String(countByAction(events, "permission-change")),
    "payment-events": String(
      countByAction(events, "payment-change") + countByAction(events, "refund")
    ),
    "safety-actions": String(countByAction(events, "safety-action")),
    "failed-actions": String(countFailedActions(events))
  };

  return INSTITUTIONAL_COMPLIANCE_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: values[metric.id] ?? "0",
    numericValue: Number(values[metric.id] ?? 0)
  }));
}

export function activeInstitutionalFilterFields(filters: InstitutionalComplianceFilters): string[] {
  const active: string[] = [];
  if (filters.date) active.push("date");
  if (filters.actor) active.push("actor");
  if (filters.action !== "all") active.push("action");
  if (filters.target) active.push("target");
  if (filters.severity !== "all") active.push("severity");
  return active;
}

export function emptyInstitutionalComplianceFilters(): InstitutionalComplianceFilters {
  return {
    date: "",
    actor: "",
    action: "all",
    target: "",
    severity: "all"
  };
}

export function createInstitutionalAuditEventId(sequence: number): string {
  return `inst_audit_${String(sequence).padStart(3, "0")}`;
}

export function assertInstitutionalAuditAppendOnly(previous: AuditEvent[], next: AuditEvent[]): void {
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
      prior.actor.email !== current.actor.email
    ) {
      throw new Error("Audit integrity violation: history cannot be modified");
    }
  }
}

export function appendInstitutionalAuditEvent(
  events: AuditEvent[],
  input: Omit<AuditEvent, "id" | "timestamp">
): AuditEvent[] {
  const record: AuditEvent = {
    ...input,
    id: createInstitutionalAuditEventId(events.length + 1),
    timestamp: new Date().toISOString()
  };
  const next = [...events, record];
  assertInstitutionalAuditAppendOnly(events, next);
  return next;
}

export function summarizeInstitutionalActions(events: AuditEvent[]) {
  const counts = new Map<AuditActionId, number>();
  for (const event of events) {
    counts.set(event.action, (counts.get(event.action) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([action, count]) => ({
      action,
      label: INSTITUTIONAL_AUDIT_ACTION_LABELS[action],
      count
    }))
    .sort((left, right) => right.count - left.count);
}
