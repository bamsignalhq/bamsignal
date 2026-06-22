import { STORAGE_KEYS } from "../../constants/limits";
import type { RelationshipLegacyIndexRecord } from "../../types/relationshipLegacyIndex";
import {
  getRelationshipLegacyIndex,
  importRelationshipLegacyIndexRecord,
  listRelationshipLegacyIndexRecords
} from "../../utils/relationshipLegacyIndexStore";
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

const LOCAL_STORE_KEY = STORAGE_KEYS.conciergeRelationshipLegacyIndex;

type LegacyProfileStoreSnapshot = {
  byJourneyId: Record<string, RelationshipLegacyIndexRecord>;
  updatedAt: string;
};

function loadLocalSnapshot(): LegacyProfileStoreSnapshot {
  return readJson<LegacyProfileStoreSnapshot>(LOCAL_STORE_KEY, {
    byJourneyId: {},
    updatedAt: new Date().toISOString()
  });
}

function saveLocalSnapshot(snapshot: LegacyProfileStoreSnapshot): void {
  writeJson(LOCAL_STORE_KEY, { ...snapshot, updatedAt: new Date().toISOString() });
}

function normalizeLegacyProfile(raw: RelationshipLegacyIndexRecord): RelationshipLegacyIndexRecord {
  return {
    ...raw,
    statusHistory: [...raw.statusHistory],
    legacyFamily: raw.legacyFamily
      ? { ...raw.legacyFamily, history: [...raw.legacyFamily.history] }
      : undefined
  };
}

export const legacyProfileRepository = {
  create(input: RelationshipLegacyIndexRecord): RelationshipLegacyIndexRecord {
    return importRelationshipLegacyIndexRecord(normalizeLegacyProfile(input));
  },

  update(
    journeyId: string,
    patch: Partial<RelationshipLegacyIndexRecord>
  ): RelationshipLegacyIndexRecord | null {
    const existing = getRelationshipLegacyIndex(journeyId);
    if (!existing) return null;
    return importRelationshipLegacyIndexRecord(
      normalizeLegacyProfile({
        ...existing,
        ...patch,
        journeyId: existing.journeyId
      })
    );
  },

  findById(journeyId: string): RelationshipLegacyIndexRecord | null {
    return getRelationshipLegacyIndex(journeyId);
  },

  list(): RelationshipLegacyIndexRecord[] {
    return listRelationshipLegacyIndexRecords().map((record) => normalizeLegacyProfile(record));
  },

  delete(journeyId: string): boolean {
    const snapshot = loadLocalSnapshot();
    if (!snapshot.byJourneyId[journeyId]) return false;
    const nextByJourneyId = { ...snapshot.byJourneyId };
    delete nextByJourneyId[journeyId];
    saveLocalSnapshot({ ...snapshot, byJourneyId: nextByJourneyId });
    return true;
  },

  normalize(raw: unknown): RelationshipLegacyIndexRecord {
    return normalizeLegacyProfile(raw as RelationshipLegacyIndexRecord);
  },

  fromLocalStorage(): RelationshipLegacyIndexRecord[] {
    return Object.values(loadLocalSnapshot().byJourneyId).map((record) =>
      normalizeLegacyProfile(record)
    );
  },

  async toSupabase(records: RelationshipLegacyIndexRecord[]): Promise<ConciergeSupabaseWriteResult> {
    if (!isSupabasePersistenceAvailable()) {
      return { ok: false, count: 0, reason: "supabase_unavailable" };
    }
    return noopSupabaseWrite(
      CONCIERGE_SUPABASE_TABLES.legacyProfiles,
      records.map((record) => this.serialize(record))
    );
  },

  async sync(): Promise<ConciergeSyncResult> {
    if (!isSupabasePersistenceAvailable()) {
      return { source: "local", synced: 0, ok: true, reason: "supabase_unavailable" };
    }
    return noopSupabaseSync(CONCIERGE_SUPABASE_TABLES.legacyProfiles);
  },

  async hydrate(): Promise<void> {
    if (!isSupabasePersistenceAvailable()) return;
    await noopSupabaseHydrate(CONCIERGE_SUPABASE_TABLES.legacyProfiles);
  },

  serialize(record: RelationshipLegacyIndexRecord): Record<string, unknown> {
    return serializeRecord(record);
  }
};

export type LegacyProfileRepository = typeof legacyProfileRepository;
