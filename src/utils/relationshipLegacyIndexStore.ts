import type { LegacyStatusId } from "../constants/relationshipLegacyIndex";
import type { RelationshipLegacyIndexRecord } from "../types/relationshipLegacyIndex";
import {
  assertLegacyIndexIntegrity,
  assertLegacyFamilyIntegrity,
  createEmptyLegacyIndexRecord,
  evolveLegacyStatus,
  mergeLegacyIndexRecords,
  recordLegacyFamilyProfile
} from "./relationshipLegacyIndexLogic";
import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

type RelationshipLegacyIndexStore = {
  byJourneyId: Record<string, RelationshipLegacyIndexRecord>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeRelationshipLegacyIndex;

function loadStore(): RelationshipLegacyIndexStore {
  return readJson<RelationshipLegacyIndexStore>(STORE_KEY, {
    byJourneyId: {},
    updatedAt: new Date().toISOString()
  });
}

function saveStore(store: RelationshipLegacyIndexStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function persistRecord(record: RelationshipLegacyIndexRecord): RelationshipLegacyIndexRecord {
  const store = loadStore();
  const existing = store.byJourneyId[record.journeyId];
  if (existing) {
    assertLegacyIndexIntegrity(existing, record);
    if (existing.legacyFamily && record.legacyFamily) {
      assertLegacyFamilyIntegrity(existing.legacyFamily, record.legacyFamily);
    }
  }
  saveStore({
    ...store,
    byJourneyId: { ...store.byJourneyId, [record.journeyId]: record }
  });
  return record;
}

export function getRelationshipLegacyIndex(journeyId: string): RelationshipLegacyIndexRecord | null {
  return loadStore().byJourneyId[journeyId] ?? null;
}

export function registerRelationshipLegacyIndex(input: {
  journeyId: string;
  memberId: string;
  country?: string;
  legacyStatus?: LegacyStatusId;
  registeredBy?: string;
}): RelationshipLegacyIndexRecord {
  const store = loadStore();
  const existing = store.byJourneyId[input.journeyId];
  if (existing) return existing;

  const record = createEmptyLegacyIndexRecord(input);
  saveStore({
    ...store,
    byJourneyId: { ...store.byJourneyId, [record.journeyId]: record }
  });
  return record;
}

export function ensureRelationshipLegacyIndex(input: {
  journeyId: string;
  memberId: string;
  country?: string;
  legacyStatus?: LegacyStatusId;
}): RelationshipLegacyIndexRecord {
  return (
    getRelationshipLegacyIndex(input.journeyId) ??
    registerRelationshipLegacyIndex(input)
  );
}

export function updateRelationshipLegacyStatus(
  journeyId: string,
  input: { legacyStatus: LegacyStatusId; by?: string }
): RelationshipLegacyIndexRecord | null {
  const existing = getRelationshipLegacyIndex(journeyId);
  if (!existing) return null;
  return persistRecord(evolveLegacyStatus(existing, input));
}

export function recordRelationshipLegacyFamily(
  journeyId: string,
  input: { childrenCount: number; currentCountry: string; recordedBy?: string }
): RelationshipLegacyIndexRecord | null {
  const existing = getRelationshipLegacyIndex(journeyId);
  if (!existing) return null;
  return persistRecord(recordLegacyFamilyProfile(existing, input));
}

export function bootstrapRelationshipLegacyIndexSeeds(
  seeds: RelationshipLegacyIndexRecord[]
): void {
  const store = loadStore();
  if (Object.keys(store.byJourneyId).length) return;

  const byJourneyId = { ...store.byJourneyId };
  for (const seed of seeds) {
    byJourneyId[seed.journeyId] = seed;
  }
  saveStore({ ...store, byJourneyId });
}

export function listRelationshipLegacyIndexRecords(): RelationshipLegacyIndexRecord[] {
  return Object.values(loadStore().byJourneyId);
}

export function getRelationshipLegacyIndexMap(): Record<string, RelationshipLegacyIndexRecord> {
  return loadStore().byJourneyId;
}

export function importRelationshipLegacyIndexRecord(
  incoming: RelationshipLegacyIndexRecord
): RelationshipLegacyIndexRecord {
  const existing = getRelationshipLegacyIndex(incoming.journeyId);
  if (!existing) return persistRecord(incoming);
  return persistRecord(mergeLegacyIndexRecords(existing, incoming));
}
