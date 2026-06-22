import { AUDIT_EVENTS_SEED } from "../data/auditCenterSeed";
import type { AuditComplianceBundle, AuditEventRecord, AuditFilterState } from "../types/auditCenter";
import {
  activeFilterFields,
  appendAuditEventRecord,
  assertAuditLogAppendOnly,
  buildComplianceMetrics,
  emptyAuditFilters,
  filterAuditEvents,
  findAuditEventById,
  sortAuditEventsByTimestamp,
  summarizeActions
} from "./auditCenterLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.auditCenter.v1";

type AuditCenterState = {
  events: AuditEventRecord[];
  updatedAt: string;
};

function defaultState(): AuditCenterState {
  return {
    events: [...AUDIT_EVENTS_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): AuditCenterState {
  const stored = readJson<AuditCenterState>(STORAGE_KEY, defaultState());
  if (!stored?.events?.length) return defaultState();
  return stored;
}

function saveState(state: AuditCenterState): void {
  const previous = loadState().events;
  assertAuditLogAppendOnly(previous, state.events);
  writeJson(STORAGE_KEY, state);
}

export function listAuditCenterEvents(): AuditEventRecord[] {
  return loadState().events;
}

export function appendAuditCenterEvent(
  input: Omit<AuditEventRecord, "id" | "timestamp">
): AuditEventRecord {
  const state = loadState();
  const nextEvents = appendAuditEventRecord(state.events, input);
  const record = nextEvents[nextEvents.length - 1];
  state.events = nextEvents;
  state.updatedAt = new Date().toISOString();
  saveState(state);
  return record;
}

export function buildAuditComplianceBundle(
  filters: AuditFilterState = emptyAuditFilters(),
  selectedEventId?: string | null
): AuditComplianceBundle {
  const allEvents = sortAuditEventsByTimestamp(listAuditCenterEvents());
  const filtered = sortAuditEventsByTimestamp(filterAuditEvents(allEvents, filters));

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildComplianceMetrics(allEvents),
    summaries: summarizeActions(filtered),
    timeline: filtered,
    selectedEvent: findAuditEventById(filtered, selectedEventId ?? null),
    activeFilters: activeFilterFields(filters) as AuditComplianceBundle["activeFilters"]
  };
}
