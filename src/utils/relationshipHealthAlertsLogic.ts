import {
  healthAlertSeverityOrder,
  type RelationshipHealthAlertStatus
} from "../constants/relationshipHealthAlerts";
import type {
  AddRelationshipHealthAlertInput,
  RelationshipHealthAlertEntry
} from "../types/relationshipHealthAlerts";

const CONSULTANT_ADMIN_VISIBILITY = "consultant-admin" as const;

export function normalizeHealthAlertEntry(
  entry: RelationshipHealthAlertEntry
): RelationshipHealthAlertEntry {
  return {
    ...entry,
    visibility: CONSULTANT_ADMIN_VISIBILITY
  };
}

export function assertHealthAlertVisibility(entry: RelationshipHealthAlertEntry): void {
  if (entry.visibility !== CONSULTANT_ADMIN_VISIBILITY) {
    throw new Error("Health alerts are visible to consultants and admin only");
  }
}

export function createHealthAlertEntry(
  input: AddRelationshipHealthAlertInput & {
    id?: string;
    createdAt?: string;
    status?: RelationshipHealthAlertStatus;
  }
): RelationshipHealthAlertEntry {
  const entry: RelationshipHealthAlertEntry = {
    id: input.id ?? `rha_${Date.now().toString(36)}`,
    journeyId: input.journeyId,
    introductionId: input.introductionId,
    coupleLabel: input.coupleLabel,
    alertType: input.alertType,
    severity: input.severity,
    supportNote: input.supportNote?.trim() || undefined,
    createdAt: input.createdAt ?? new Date().toISOString(),
    createdBy: input.createdBy,
    visibility: CONSULTANT_ADMIN_VISIBILITY,
    status: input.status ?? "open"
  };
  assertHealthAlertVisibility(entry);
  return entry;
}

export function sortHealthAlertQueue(
  alerts: RelationshipHealthAlertEntry[]
): RelationshipHealthAlertEntry[] {
  return [...alerts].sort((a, b) => {
    const severityDiff = healthAlertSeverityOrder(b.severity) - healthAlertSeverityOrder(a.severity);
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function filterOpenHealthAlerts(
  alerts: RelationshipHealthAlertEntry[]
): RelationshipHealthAlertEntry[] {
  return alerts.filter((alert) => alert.status === "open" || alert.status === "support-planned");
}

export function acknowledgeHealthAlert(
  entry: RelationshipHealthAlertEntry
): RelationshipHealthAlertEntry {
  return normalizeHealthAlertEntry({
    ...entry,
    status: "acknowledged"
  });
}

export function planHealthAlertSupport(
  entry: RelationshipHealthAlertEntry
): RelationshipHealthAlertEntry {
  return normalizeHealthAlertEntry({
    ...entry,
    status: "support-planned"
  });
}
