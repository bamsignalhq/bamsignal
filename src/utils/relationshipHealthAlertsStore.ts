import { RELATIONSHIP_HEALTH_ALERTS_SEED } from "../data/relationshipHealthAlertsSeed";
import type {
  AddRelationshipHealthAlertInput,
  RelationshipHealthAlertEntry
} from "../types/relationshipHealthAlerts";
import {
  acknowledgeHealthAlert,
  createHealthAlertEntry,
  filterOpenHealthAlerts,
  normalizeHealthAlertEntry,
  planHealthAlertSupport,
  sortHealthAlertQueue
} from "./relationshipHealthAlertsLogic";
import { readJson, writeJson } from "./storage";

const STORE_KEY = "bamsignal-concierge-relationship-health-alerts-store";

type RelationshipHealthAlertsStore = {
  alerts: RelationshipHealthAlertEntry[];
  updatedAt: string;
};

function loadStore(): RelationshipHealthAlertsStore {
  const stored = readJson<RelationshipHealthAlertsStore | null>(STORE_KEY, null);
  if (stored?.alerts?.length) {
    return {
      ...stored,
      alerts: stored.alerts.map((alert) => normalizeHealthAlertEntry(alert))
    };
  }
  const initial: RelationshipHealthAlertsStore = {
    alerts: RELATIONSHIP_HEALTH_ALERTS_SEED.map((alert) => normalizeHealthAlertEntry(alert)),
    updatedAt: new Date().toISOString()
  };
  writeJson(STORE_KEY, initial);
  return initial;
}

function saveStore(store: RelationshipHealthAlertsStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

export function listRelationshipHealthAlerts(): RelationshipHealthAlertEntry[] {
  return loadStore().alerts;
}

export function listRelationshipHealthAlertsForJourney(
  journeyId: string
): RelationshipHealthAlertEntry[] {
  return sortHealthAlertQueue(
    listRelationshipHealthAlerts().filter((alert) => alert.journeyId === journeyId)
  );
}

export function getRelationshipHealthAlert(id: string): RelationshipHealthAlertEntry | null {
  return listRelationshipHealthAlerts().find((alert) => alert.id === id) ?? null;
}

export function addRelationshipHealthAlertToStore(
  input: AddRelationshipHealthAlertInput
): RelationshipHealthAlertEntry {
  const store = loadStore();
  const entry = createHealthAlertEntry(input);
  store.alerts.unshift(entry);
  saveStore(store);
  return entry;
}

export function acknowledgeRelationshipHealthAlert(id: string): RelationshipHealthAlertEntry | null {
  const store = loadStore();
  const index = store.alerts.findIndex((alert) => alert.id === id);
  if (index < 0) return null;
  const updated = acknowledgeHealthAlert(store.alerts[index]);
  store.alerts[index] = updated;
  saveStore(store);
  return updated;
}

export function planRelationshipHealthAlertSupport(id: string): RelationshipHealthAlertEntry | null {
  const store = loadStore();
  const index = store.alerts.findIndex((alert) => alert.id === id);
  if (index < 0) return null;
  const updated = planHealthAlertSupport(store.alerts[index]);
  store.alerts[index] = updated;
  saveStore(store);
  return updated;
}

export function listRelationshipSupportQueue(): RelationshipHealthAlertEntry[] {
  return sortHealthAlertQueue(filterOpenHealthAlerts(listRelationshipHealthAlerts()));
}
