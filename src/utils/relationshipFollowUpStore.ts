import { RELATIONSHIP_FOLLOW_UP_SEED } from "../data/relationshipFollowUpSeed";
import type { RelationshipFollowUpRecord } from "../types/relationshipFollowUp";
import {
  assertNoDuplicateFollowUp,
  assertRelationshipTimelineIntegrity,
  normalizeRelationshipFollowUpRecord
} from "./relationshipFollowUpLogic";
import { readJson, writeJson } from "./storage";

const STORE_KEY = "bamsignal-concierge-relationship-follow-up-store";

type RelationshipFollowUpStore = {
  records: RelationshipFollowUpRecord[];
  updatedAt: string;
};

function loadStore(): RelationshipFollowUpStore {
  const stored = readJson<RelationshipFollowUpStore | null>(STORE_KEY, null);
  if (stored?.records?.length) {
    return {
      ...stored,
      records: stored.records.map((record) => normalizeRelationshipFollowUpRecord(record))
    };
  }
  const initial: RelationshipFollowUpStore = {
    records: RELATIONSHIP_FOLLOW_UP_SEED.map((record) => normalizeRelationshipFollowUpRecord(record)),
    updatedAt: new Date().toISOString()
  };
  writeJson(STORE_KEY, initial);
  return initial;
}

function saveStore(store: RelationshipFollowUpStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

export function listRelationshipFollowUpRecords(): RelationshipFollowUpRecord[] {
  return loadStore().records;
}

export function getRelationshipFollowUpRecord(id: string): RelationshipFollowUpRecord | null {
  return (
    listRelationshipFollowUpRecords().find(
      (record) => record.id === id || record.introductionId === id
    ) ?? null
  );
}

export function saveRelationshipFollowUpRecord(
  record: RelationshipFollowUpRecord
): RelationshipFollowUpRecord {
  const store = loadStore();
  const normalized = normalizeRelationshipFollowUpRecord(record);
  const index = store.records.findIndex((item) => item.id === normalized.id);

  if (index >= 0) {
    assertRelationshipTimelineIntegrity(store.records[index], normalized);
  } else {
    assertNoDuplicateFollowUp(store.records, normalized.introductionId);
  }

  const next = { ...normalized, updatedAt: new Date().toISOString() };
  if (index >= 0) store.records[index] = next;
  else store.records.unshift(next);
  saveStore(store);
  return next;
}
