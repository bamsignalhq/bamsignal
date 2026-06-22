import type { IntroductionRecord } from "../../types/conciergeIntroduction";
import {
  getIntroductionRecord,
  listIntroductionRecords,
  saveIntroductionRecord
} from "../../utils/conciergeIntroductionStore";
import { normalizeIntroductionRecord } from "../../utils/introductionEngineLogic";
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

const LOCAL_STORE_KEY = "bamsignal-concierge-introduction-store";

type IntroductionStoreSnapshot = {
  introductions: IntroductionRecord[];
  updatedAt: string;
};

function loadLocalSnapshot(): IntroductionStoreSnapshot {
  const stored = readJson<IntroductionStoreSnapshot | null>(LOCAL_STORE_KEY, null);
  if (stored?.introductions?.length) {
    return {
      ...stored,
      introductions: stored.introductions.map((record) => normalizeIntroductionRecord(record))
    };
  }
  return { introductions: listIntroductionRecords(), updatedAt: new Date().toISOString() };
}

function saveLocalSnapshot(snapshot: IntroductionStoreSnapshot): void {
  writeJson(LOCAL_STORE_KEY, { ...snapshot, updatedAt: new Date().toISOString() });
}

export const introductionRepository = {
  create(input: IntroductionRecord): IntroductionRecord {
    return saveIntroductionRecord({
      ...input,
      createdAt: input.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  },

  update(id: string, patch: Partial<IntroductionRecord>): IntroductionRecord | null {
    const existing = getIntroductionRecord(id);
    if (!existing) return null;
    return saveIntroductionRecord({
      ...existing,
      ...patch,
      id: existing.id,
      updatedAt: new Date().toISOString()
    });
  },

  findById(id: string): IntroductionRecord | null {
    return getIntroductionRecord(id);
  },

  list(): IntroductionRecord[] {
    return listIntroductionRecords();
  },

  delete(id: string): boolean {
    const snapshot = loadLocalSnapshot();
    const nextRecords = snapshot.introductions.filter(
      (record) => record.id !== id && record.introductionId !== id
    );
    if (nextRecords.length === snapshot.introductions.length) return false;
    saveLocalSnapshot({ ...snapshot, introductions: nextRecords });
    return true;
  },

  normalize(raw: unknown): IntroductionRecord {
    return normalizeIntroductionRecord(raw as IntroductionRecord);
  },

  fromLocalStorage(): IntroductionRecord[] {
    return loadLocalSnapshot().introductions;
  },

  async toSupabase(records: IntroductionRecord[]): Promise<ConciergeSupabaseWriteResult> {
    if (!isSupabasePersistenceAvailable()) {
      return { ok: false, count: 0, reason: "supabase_unavailable" };
    }
    return noopSupabaseWrite(
      CONCIERGE_SUPABASE_TABLES.introductions,
      records.map((record) => this.serialize(record))
    );
  },

  async sync(): Promise<ConciergeSyncResult> {
    if (!isSupabasePersistenceAvailable()) {
      return { source: "local", synced: 0, ok: true, reason: "supabase_unavailable" };
    }
    return noopSupabaseSync(CONCIERGE_SUPABASE_TABLES.introductions);
  },

  async hydrate(): Promise<void> {
    if (!isSupabasePersistenceAvailable()) return;
    await noopSupabaseHydrate(CONCIERGE_SUPABASE_TABLES.introductions);
  },

  serialize(record: IntroductionRecord): Record<string, unknown> {
    return serializeRecord(record);
  }
};

export type IntroductionRepository = typeof introductionRepository;
