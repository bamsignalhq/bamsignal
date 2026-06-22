import { STORAGE_KEYS } from "../../constants/limits";
import type { SuccessStoryConsentRecord } from "../../types/conciergeSuccessStoryConsent";
import {
  ensureSuccessStoryConsent,
  getSuccessStoryConsent,
  listSuccessStoryConsents
} from "../../utils/conciergeSuccessStoryConsentStore";
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

const LOCAL_STORE_KEY = STORAGE_KEYS.conciergeSuccessStoryConsent;

type SuccessStoryConsentStoreSnapshot = {
  byJourneyId: Record<string, SuccessStoryConsentRecord>;
  updatedAt: string;
};

function loadLocalSnapshot(): SuccessStoryConsentStoreSnapshot {
  return readJson<SuccessStoryConsentStoreSnapshot>(LOCAL_STORE_KEY, {
    byJourneyId: {},
    updatedAt: new Date().toISOString()
  });
}

function saveLocalSnapshot(snapshot: SuccessStoryConsentStoreSnapshot): void {
  writeJson(LOCAL_STORE_KEY, { ...snapshot, updatedAt: new Date().toISOString() });
}

function normalizeConsent(raw: SuccessStoryConsentRecord): SuccessStoryConsentRecord {
  return {
    ...raw,
    history: [...raw.history],
    partyApprovals: {
      memberA: { ...raw.partyApprovals.memberA },
      memberB: { ...raw.partyApprovals.memberB }
    },
    storyProfile: raw.storyProfile
      ? { ...raw.storyProfile, categories: [...raw.storyProfile.categories] }
      : undefined,
    storyCategories: raw.storyCategories ? [...raw.storyCategories] : undefined
  };
}

function persistConsent(record: SuccessStoryConsentRecord): SuccessStoryConsentRecord {
  const snapshot = loadLocalSnapshot();
  const normalized = normalizeConsent(record);
  saveLocalSnapshot({
    ...snapshot,
    byJourneyId: { ...snapshot.byJourneyId, [normalized.journeyId]: normalized }
  });
  return normalized;
}

export const successStoryConsentRepository = {
  create(input: SuccessStoryConsentRecord): SuccessStoryConsentRecord {
    const existing = getSuccessStoryConsent(input.journeyId);
    if (existing) return normalizeConsent(existing);
    return persistConsent({
      ...input,
      createdAt: input.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  },

  update(
    journeyId: string,
    patch: Partial<SuccessStoryConsentRecord>
  ): SuccessStoryConsentRecord | null {
    const existing = getSuccessStoryConsent(journeyId);
    if (!existing) return null;
    return persistConsent(
      normalizeConsent({
        ...existing,
        ...patch,
        journeyId: existing.journeyId,
        updatedAt: new Date().toISOString()
      })
    );
  },

  findById(journeyId: string): SuccessStoryConsentRecord | null {
    return getSuccessStoryConsent(journeyId);
  },

  list(): SuccessStoryConsentRecord[] {
    return listSuccessStoryConsents().map((record) => normalizeConsent(record));
  },

  delete(journeyId: string): boolean {
    const snapshot = loadLocalSnapshot();
    if (!snapshot.byJourneyId[journeyId]) return false;
    const nextByJourneyId = { ...snapshot.byJourneyId };
    delete nextByJourneyId[journeyId];
    saveLocalSnapshot({ ...snapshot, byJourneyId: nextByJourneyId });
    return true;
  },

  normalize(raw: unknown): SuccessStoryConsentRecord {
    return normalizeConsent(raw as SuccessStoryConsentRecord);
  },

  fromLocalStorage(): SuccessStoryConsentRecord[] {
    return Object.values(loadLocalSnapshot().byJourneyId).map((record) => normalizeConsent(record));
  },

  async toSupabase(records: SuccessStoryConsentRecord[]): Promise<ConciergeSupabaseWriteResult> {
    if (!isSupabasePersistenceAvailable()) {
      return { ok: false, count: 0, reason: "supabase_unavailable" };
    }
    return noopSupabaseWrite(
      CONCIERGE_SUPABASE_TABLES.successStoryConsents,
      records.map((record) => this.serialize(record))
    );
  },

  async sync(): Promise<ConciergeSyncResult> {
    if (!isSupabasePersistenceAvailable()) {
      return { source: "local", synced: 0, ok: true, reason: "supabase_unavailable" };
    }
    return noopSupabaseSync(CONCIERGE_SUPABASE_TABLES.successStoryConsents);
  },

  async hydrate(): Promise<void> {
    if (!isSupabasePersistenceAvailable()) return;
    await noopSupabaseHydrate(CONCIERGE_SUPABASE_TABLES.successStoryConsents);
  },

  serialize(record: SuccessStoryConsentRecord): Record<string, unknown> {
    return serializeRecord(record);
  },

  ensure(input: {
    journeyId: string;
    memberAId: string;
    memberBId: string;
    memberAName: string;
    memberBName: string;
  }): SuccessStoryConsentRecord {
    return normalizeConsent(ensureSuccessStoryConsent(input));
  }
};

export type SuccessStoryConsentRepository = typeof successStoryConsentRepository;
