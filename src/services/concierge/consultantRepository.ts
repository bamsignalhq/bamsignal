import type {
  ConciergeConsultantDirectoryStore,
  ConciergeConsultantRecord
} from "../../types/conciergeConsultantDirectory";
import {
  getConciergeConsultant,
  listConciergeConsultants
} from "../../utils/conciergeConsultantDirectoryStore";
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

const LOCAL_STORE_KEY = "bamsignal-concierge-consultant-directory";

function loadLocalSnapshot(): ConciergeConsultantDirectoryStore {
  const stored = readJson<ConciergeConsultantDirectoryStore | null>(LOCAL_STORE_KEY, null);
  if (stored?.consultants?.length) return stored;
  return {
    consultants: listConciergeConsultants(),
    activity: [],
    meetings: [],
    updatedAt: new Date().toISOString()
  };
}

function saveLocalSnapshot(snapshot: ConciergeConsultantDirectoryStore): void {
  writeJson(LOCAL_STORE_KEY, { ...snapshot, updatedAt: new Date().toISOString() });
}

function normalizeConsultant(raw: ConciergeConsultantRecord): ConciergeConsultantRecord {
  return {
    ...raw,
    email: raw.email.trim().toLowerCase(),
    roles: [...raw.roles],
    tierFocus: [...(raw.tierFocus ?? [])],
    updatedAt: raw.updatedAt ?? new Date().toISOString()
  };
}

export const consultantRepository = {
  create(input: ConciergeConsultantRecord): ConciergeConsultantRecord {
    const snapshot = loadLocalSnapshot();
    const normalized = normalizeConsultant({
      ...input,
      createdAt: input.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const index = snapshot.consultants.findIndex((consultant) => consultant.id === normalized.id);
    if (index >= 0) snapshot.consultants[index] = normalized;
    else snapshot.consultants.unshift(normalized);
    saveLocalSnapshot(snapshot);
    return normalized;
  },

  update(id: string, patch: Partial<ConciergeConsultantRecord>): ConciergeConsultantRecord | null {
    const snapshot = loadLocalSnapshot();
    const index = snapshot.consultants.findIndex((consultant) => consultant.id === id);
    if (index < 0) return null;
    const next = normalizeConsultant({
      ...snapshot.consultants[index],
      ...patch,
      id,
      updatedAt: new Date().toISOString()
    });
    snapshot.consultants[index] = next;
    saveLocalSnapshot(snapshot);
    return next;
  },

  findById(id: string): ConciergeConsultantRecord | null {
    return getConciergeConsultant(id);
  },

  list(): ConciergeConsultantRecord[] {
    return listConciergeConsultants().map((consultant) => normalizeConsultant(consultant));
  },

  delete(id: string): boolean {
    const snapshot = loadLocalSnapshot();
    const nextConsultants = snapshot.consultants.filter((consultant) => consultant.id !== id);
    if (nextConsultants.length === snapshot.consultants.length) return false;
    saveLocalSnapshot({ ...snapshot, consultants: nextConsultants });
    return true;
  },

  normalize(raw: unknown): ConciergeConsultantRecord {
    return normalizeConsultant(raw as ConciergeConsultantRecord);
  },

  fromLocalStorage(): ConciergeConsultantRecord[] {
    return loadLocalSnapshot().consultants.map((consultant) => normalizeConsultant(consultant));
  },

  async toSupabase(records: ConciergeConsultantRecord[]): Promise<ConciergeSupabaseWriteResult> {
    if (!isSupabasePersistenceAvailable()) {
      return { ok: false, count: 0, reason: "supabase_unavailable" };
    }
    return noopSupabaseWrite(
      CONCIERGE_SUPABASE_TABLES.consultants,
      records.map((record) => this.serialize(record))
    );
  },

  async sync(): Promise<ConciergeSyncResult> {
    if (!isSupabasePersistenceAvailable()) {
      return { source: "local", synced: 0, ok: true, reason: "supabase_unavailable" };
    }
    return noopSupabaseSync(CONCIERGE_SUPABASE_TABLES.consultants);
  },

  async hydrate(): Promise<void> {
    if (!isSupabasePersistenceAvailable()) return;
    await noopSupabaseHydrate(CONCIERGE_SUPABASE_TABLES.consultants);
  },

  serialize(record: ConciergeConsultantRecord): Record<string, unknown> {
    return serializeRecord(record);
  }
};

export type ConsultantRepository = typeof consultantRepository;
