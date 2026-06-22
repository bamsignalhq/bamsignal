import type { RelationshipFollowUpRecord } from "../../types/relationshipFollowUp";
import {
  getRelationshipFollowUpRecord,
  listRelationshipFollowUpRecords,
  saveRelationshipFollowUpRecord
} from "../../utils/relationshipFollowUpStore";
import { normalizeRelationshipFollowUpRecord } from "../../utils/relationshipFollowUpLogic";
import { readJson, writeJson } from "../../utils/storage";
import {
  CONCIERGE_SUPABASE_TABLES,
  isSupabasePersistenceAvailable,
  noopSupabaseHydrate,
  noopSupabaseSync,
  noopSupabaseWrite,
  serializeRecord,
  type ConciergeSupabaseWriteResult,
  type ConciergeSyncResult
} from "./conciergeRepositoryShared";

const LOCAL_STORE_KEY = "bamsignal-concierge-relationship-follow-up-store";

type FollowUpStoreSnapshot = {
  records: RelationshipFollowUpRecord[];
  updatedAt: string;
};

function loadLocalSnapshot(): FollowUpStoreSnapshot {
  const stored = readJson<FollowUpStoreSnapshot | null>(LOCAL_STORE_KEY, null);
  if (stored?.records?.length) {
    return {
      ...stored,
      records: stored.records.map((record) => normalizeRelationshipFollowUpRecord(record))
    };
  }
  return { records: listRelationshipFollowUpRecords(), updatedAt: new Date().toISOString() };
}

function saveLocalSnapshot(snapshot: FollowUpStoreSnapshot): void {
  writeJson(LOCAL_STORE_KEY, { ...snapshot, updatedAt: new Date().toISOString() });
}

export const followupRepository = {
  create(input: RelationshipFollowUpRecord): RelationshipFollowUpRecord {
    return saveRelationshipFollowUpRecord({
      ...input,
      createdAt: input.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  },

  update(id: string, patch: Partial<RelationshipFollowUpRecord>): RelationshipFollowUpRecord | null {
    const existing = getRelationshipFollowUpRecord(id);
    if (!existing) return null;
    return saveRelationshipFollowUpRecord({
      ...existing,
      ...patch,
      id: existing.id,
      updatedAt: new Date().toISOString()
    });
  },

  findById(id: string): RelationshipFollowUpRecord | null {
    return getRelationshipFollowUpRecord(id);
  },

  list(): RelationshipFollowUpRecord[] {
    return listRelationshipFollowUpRecords();
  },

  delete(id: string): boolean {
    const snapshot = loadLocalSnapshot();
    const nextRecords = snapshot.records.filter(
      (record) => record.id !== id && record.introductionId !== id
    );
    if (nextRecords.length === snapshot.records.length) return false;
    saveLocalSnapshot({ ...snapshot, records: nextRecords });
    return true;
  },

  normalize(raw: unknown): RelationshipFollowUpRecord {
    return normalizeRelationshipFollowUpRecord(raw as RelationshipFollowUpRecord);
  },

  fromLocalStorage(): RelationshipFollowUpRecord[] {
    return loadLocalSnapshot().records;
  },

  async toSupabase(records: RelationshipFollowUpRecord[]): Promise<ConciergeSupabaseWriteResult> {
    if (!isSupabasePersistenceAvailable()) {
      return { ok: false, count: 0, reason: "supabase_unavailable" };
    }
    return noopSupabaseWrite(
      CONCIERGE_SUPABASE_TABLES.followups,
      records.map((record) => this.serialize(record))
    );
  },

  async sync(): Promise<ConciergeSyncResult> {
    if (!isSupabasePersistenceAvailable()) {
      return { source: "local", synced: 0, ok: true, reason: "supabase_unavailable" };
    }
    return noopSupabaseSync(CONCIERGE_SUPABASE_TABLES.followups);
  },

  async hydrate(): Promise<void> {
    if (!isSupabasePersistenceAvailable()) return;
    await noopSupabaseHydrate(CONCIERGE_SUPABASE_TABLES.followups);
  },

  serialize(record: RelationshipFollowUpRecord): Record<string, unknown> {
    return serializeRecord(record);
  }
};

export type FollowupRepository = typeof followupRepository;
