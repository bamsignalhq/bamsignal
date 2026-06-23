import { INSTITUTIONAL_AUDIT_EVENTS_SEED } from "../data/institutionalAuditSeed";
import type { AuditEvent, InstitutionalAuditBundle, InstitutionalComplianceFilters } from "../types/auditEngine";
import {
  activeInstitutionalFilterFields,
  appendInstitutionalAuditEvent,
  assertInstitutionalAuditAppendOnly,
  buildInstitutionalComplianceMetrics,
  emptyInstitutionalComplianceFilters,
  filterInstitutionalAuditEvents,
  findInstitutionalAuditEvent,
  listInstitutionalAuditEvents,
  sortAuditEventsByTimestamp
} from "./auditEngineLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.institutionalAudit.v1";

type InstitutionalAuditState = {
  events: AuditEvent[];
  updatedAt: string;
};

function defaultState(): InstitutionalAuditState {
  return {
    events: [...INSTITUTIONAL_AUDIT_EVENTS_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): InstitutionalAuditState {
  const stored = readJson<InstitutionalAuditState>(STORAGE_KEY, defaultState());
  if (!stored?.events?.length) return defaultState();
  return stored;
}

function saveState(state: InstitutionalAuditState): void {
  const previous = loadState().events;
  assertInstitutionalAuditAppendOnly(previous, state.events);
  writeJson(STORAGE_KEY, state);
}

export function listInstitutionalAuditCenterEvents(): AuditEvent[] {
  return loadState().events;
}

export function appendInstitutionalAuditCenterEvent(
  input: Omit<AuditEvent, "id" | "timestamp">
): AuditEvent {
  const state = loadState();
  const nextEvents = appendInstitutionalAuditEvent(state.events, input);
  const record = nextEvents[nextEvents.length - 1];
  state.events = nextEvents;
  state.updatedAt = new Date().toISOString();
  saveState(state);
  return record;
}

export function buildInstitutionalAuditBundle(
  filters: InstitutionalComplianceFilters = emptyInstitutionalComplianceFilters(),
  selectedEventId?: string | null
): InstitutionalAuditBundle {
  const allEvents = sortAuditEventsByTimestamp(listInstitutionalAuditCenterEvents());
  const filtered = sortAuditEventsByTimestamp(filterInstitutionalAuditEvents(allEvents, filters));

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildInstitutionalComplianceMetrics(allEvents),
    timeline: filtered,
    selectedEvent: findInstitutionalAuditEvent(filtered, selectedEventId ?? null),
    activeFilters: activeInstitutionalFilterFields(filters) as InstitutionalAuditBundle["activeFilters"]
  };
}

export {
  assertInstitutionalAuditAppendOnly,
  appendInstitutionalAuditEvent,
  emptyInstitutionalComplianceFilters,
  listInstitutionalAuditEvents
};
