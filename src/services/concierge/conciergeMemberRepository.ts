import type { ConciergeMemberRecord } from "../../types/conciergeConsultant";
import { normalizeConciergeMember } from "../../utils/conciergeMemberStewardship";
import {
  getConciergeMember,
  listConciergeMembers,
  updateConciergeMember
} from "../../utils/conciergeConsultantStore";
import { ensureMemberJourneyId } from "../../utils/conciergeJourneyRegistry";
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

const LOCAL_STORE_KEY = "bamsignal-concierge-consultant-store";

type ConciergeMemberStoreSnapshot = {
  members: ConciergeMemberRecord[];
  updatedAt: string;
};

function loadLocalSnapshot(): ConciergeMemberStoreSnapshot {
  const stored = readJson<ConciergeMemberStoreSnapshot | null>(LOCAL_STORE_KEY, null);
  if (stored?.members?.length) {
    return {
      ...stored,
      members: stored.members.map((member) => normalizeConciergeMember(member))
    };
  }
  return { members: listConciergeMembers(), updatedAt: new Date().toISOString() };
}

function saveLocalSnapshot(snapshot: ConciergeMemberStoreSnapshot): void {
  writeJson(LOCAL_STORE_KEY, { ...snapshot, updatedAt: new Date().toISOString() });
}

export const conciergeMemberRepository = {
  create(input: ConciergeMemberRecord): ConciergeMemberRecord {
    const snapshot = loadLocalSnapshot();
    const normalized = normalizeConciergeMember({
      ...input,
      journeyId: ensureMemberJourneyId(input.id, input.createdAt, input.journeyId),
      updatedAt: new Date().toISOString()
    });
    const index = snapshot.members.findIndex((member) => member.id === normalized.id);
    if (index >= 0) {
      snapshot.members[index] = normalized;
    } else {
      snapshot.members.unshift(normalized);
    }
    saveLocalSnapshot(snapshot);
    return normalized;
  },

  update(id: string, patch: Partial<ConciergeMemberRecord>): ConciergeMemberRecord | null {
    return updateConciergeMember(id, patch);
  },

  findById(id: string): ConciergeMemberRecord | null {
    return getConciergeMember(id);
  },

  list(): ConciergeMemberRecord[] {
    return listConciergeMembers();
  },

  delete(id: string): boolean {
    const member = getConciergeMember(id);
    if (!member || member.journeyArchive?.isLegacyArchive) return false;
    const snapshot = loadLocalSnapshot();
    const nextMembers = snapshot.members.filter((item) => item.id !== id);
    if (nextMembers.length === snapshot.members.length) return false;
    saveLocalSnapshot({ ...snapshot, members: nextMembers });
    return true;
  },

  normalize(raw: unknown): ConciergeMemberRecord {
    return normalizeConciergeMember(raw as ConciergeMemberRecord);
  },

  fromLocalStorage(): ConciergeMemberRecord[] {
    return loadLocalSnapshot().members;
  },

  async toSupabase(records: ConciergeMemberRecord[]): Promise<ConciergeSupabaseWriteResult> {
    if (!isSupabasePersistenceAvailable()) {
      return { ok: false, count: 0, reason: "supabase_unavailable" };
    }
    return noopSupabaseWrite(
      CONCIERGE_SUPABASE_TABLES.members,
      records.map((record) => this.serialize(record))
    );
  },

  async sync(): Promise<ConciergeSyncResult> {
    if (!isSupabasePersistenceAvailable()) {
      return { source: "local", synced: 0, ok: true, reason: "supabase_unavailable" };
    }
    return noopSupabaseSync(CONCIERGE_SUPABASE_TABLES.members);
  },

  async hydrate(): Promise<void> {
    if (!isSupabasePersistenceAvailable()) return;
    await noopSupabaseHydrate(CONCIERGE_SUPABASE_TABLES.members);
  },

  serialize(record: ConciergeMemberRecord): Record<string, unknown> {
    return serializeRecord(record);
  }
};

export type ConciergeMemberRepository = typeof conciergeMemberRepository;
