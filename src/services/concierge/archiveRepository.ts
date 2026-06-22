import { STORAGE_KEYS } from "../../constants/limits";
import type { JourneyArchiveMetadata, RelationshipJourneyStatus } from "../../constants/conciergeJourneyArchive";
import type { ConciergeMemberRecord } from "../../types/conciergeConsultant";
import {
  archiveMemberJourney,
  listArchiveEligibleMembers,
  listArchivedMemberIds,
  normalizeJourneyArchive,
  type JourneyArchiveRegistryState
} from "../../utils/conciergeJourneyArchive";
import { getConciergeMember, listConciergeMembers, updateConciergeMember } from "../../utils/conciergeConsultantStore";
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

const LOCAL_REGISTRY_KEY = STORAGE_KEYS.conciergeJourneyArchive;

export type JourneyArchiveRecord = {
  memberId: string;
  journeyId?: string;
  relationshipStatus: RelationshipJourneyStatus;
  archivedAt?: string;
  marriedAt?: string;
  relationshipFormedAt?: string;
  isLegacyArchive: boolean;
  metadata: JourneyArchiveMetadata;
};

function memberToArchiveRecord(member: ConciergeMemberRecord): JourneyArchiveRecord | null {
  if (!member.journeyArchive) return null;
  return {
    memberId: member.id,
    journeyId: member.journeyId,
    relationshipStatus: member.journeyArchive.relationshipStatus,
    archivedAt: member.journeyArchive.archivedAt,
    marriedAt: member.journeyArchive.marriedAt,
    relationshipFormedAt: member.journeyArchive.relationshipFormedAt,
    isLegacyArchive: Boolean(member.journeyArchive.isLegacyArchive),
    metadata: member.journeyArchive
  };
}

function loadRegistry(): JourneyArchiveRegistryState {
  return readJson<JourneyArchiveRegistryState>(LOCAL_REGISTRY_KEY, {
    memberIds: [],
    updatedAt: new Date().toISOString()
  });
}

function saveRegistry(state: JourneyArchiveRegistryState): void {
  writeJson(LOCAL_REGISTRY_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export const archiveRepository = {
  create(input: JourneyArchiveRecord): JourneyArchiveRecord {
    const member = getConciergeMember(input.memberId);
    if (!member) return input;

    const archived = archiveMemberJourney(member, {
      relationshipStatus: input.relationshipStatus,
      relationshipFormedAt: input.relationshipFormedAt,
      marriedAt: input.marriedAt,
      archivedAt: input.archivedAt
    });
    updateConciergeMember(input.memberId, archived);

    const registry = loadRegistry();
    if (!registry.memberIds.includes(input.memberId)) {
      saveRegistry({ ...registry, memberIds: [...registry.memberIds, input.memberId] });
    }

    return memberToArchiveRecord(archived) ?? input;
  },

  update(memberId: string, patch: Partial<JourneyArchiveRecord>): JourneyArchiveRecord | null {
    const member = getConciergeMember(memberId);
    if (!member) return null;
    const next = normalizeJourneyArchive({
      ...member,
      journeyArchive: {
        ...member.journeyArchive,
        ...patch.metadata,
        relationshipStatus: patch.relationshipStatus ?? member.journeyArchive?.relationshipStatus ?? "active",
        archivedAt: patch.archivedAt ?? member.journeyArchive?.archivedAt,
        marriedAt: patch.marriedAt ?? member.journeyArchive?.marriedAt,
        relationshipFormedAt:
          patch.relationshipFormedAt ?? member.journeyArchive?.relationshipFormedAt,
        isLegacyArchive: patch.isLegacyArchive ?? member.journeyArchive?.isLegacyArchive ?? false
      }
    });
    const saved = updateConciergeMember(memberId, next);
    if (!saved) return null;
    return memberToArchiveRecord(saved);
  },

  findById(memberId: string): JourneyArchiveRecord | null {
    const member = getConciergeMember(memberId);
    if (!member) return null;
    return memberToArchiveRecord(member);
  },

  list(): JourneyArchiveRecord[] {
    return listArchiveEligibleMembers(listConciergeMembers())
      .map((member) => memberToArchiveRecord(member))
      .filter((record): record is JourneyArchiveRecord => record !== null);
  },

  delete(memberId: string): boolean {
    const registry = loadRegistry();
    if (!registry.memberIds.includes(memberId)) return false;
    saveRegistry({
      ...registry,
      memberIds: registry.memberIds.filter((id) => id !== memberId)
    });
    return true;
  },

  normalize(raw: unknown): JourneyArchiveRecord {
    const record = raw as JourneyArchiveRecord;
    return {
      ...record,
      metadata: {
        ...record.metadata,
        relationshipStatus: record.relationshipStatus,
        isLegacyArchive: Boolean(record.isLegacyArchive)
      }
    };
  },

  fromLocalStorage(): JourneyArchiveRecord[] {
    const registry = loadRegistry();
    void registry;
    return this.list();
  },

  async toSupabase(records: JourneyArchiveRecord[]): Promise<ConciergeSupabaseWriteResult> {
    if (!isSupabasePersistenceAvailable()) {
      return { ok: false, count: 0, reason: "supabase_unavailable" };
    }
    return noopSupabaseWrite(
      CONCIERGE_SUPABASE_TABLES.archives,
      records.map((record) => this.serialize(record))
    );
  },

  async sync(): Promise<ConciergeSyncResult> {
    if (!isSupabasePersistenceAvailable()) {
      return { source: "local", synced: 0, ok: true, reason: "supabase_unavailable" };
    }
    return noopSupabaseSync(CONCIERGE_SUPABASE_TABLES.archives);
  },

  async hydrate(): Promise<void> {
    if (!isSupabasePersistenceAvailable()) return;
    await noopSupabaseHydrate(CONCIERGE_SUPABASE_TABLES.archives);
  },

  serialize(record: JourneyArchiveRecord): Record<string, unknown> {
    return serializeRecord(record);
  },

  listArchivedMemberIds(): string[] {
    return listArchivedMemberIds();
  }
};

export type ArchiveRepository = typeof archiveRepository;
