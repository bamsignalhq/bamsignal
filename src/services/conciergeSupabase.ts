import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConciergeConsultantRecord } from "../types/conciergeConsultantDirectory";
import { buildConciergePersistenceBootstrapPayload } from "../data/conciergePersistenceSeed";
import { normalizeConciergeMember } from "../utils/conciergeMemberStewardship";
import { readJson, writeJson } from "../utils/storage";
import { apiUrl } from "./supabase";
import { readResponseJson } from "../utils/httpJson";

const ADMIN_STORE_KEY = "bamsignal-concierge-consultant-store";
const DIRECTORY_STORE_KEY = "bamsignal-concierge-consultant-directory";

type PersistenceStatus = {
  ok?: boolean;
  ready?: boolean;
  database?: string;
  memberCount?: number;
  consultantCount?: number;
  bootstrapped?: boolean;
};

type MembersPayload = {
  ok?: boolean;
  members?: ConciergeMemberRecord[];
  error?: string;
};

type ConsultantsPayload = {
  ok?: boolean;
  consultants?: ConciergeConsultantRecord[];
  error?: string;
};

let hydrationPromise: Promise<boolean> | null = null;
let persistenceReady = false;

async function postConciergePersistence(
  action: string,
  body: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
  const response = await fetch(apiUrl(`/api/concierge-persistence?action=${action}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body)
  });
  return (await readResponseJson<Record<string, unknown>>(response)) ?? {};
}

export async function fetchConciergePersistenceStatus(): Promise<PersistenceStatus> {
  const payload = await postConciergePersistence("status");
  return payload as PersistenceStatus;
}

export async function bootstrapConciergeDemoRecords(force = false): Promise<{ ok: boolean; skipped?: boolean }> {
  const payload = buildConciergePersistenceBootstrapPayload();
  const result = await postConciergePersistence("bootstrap", {
    force,
    consultants: payload.consultants,
    members: payload.members,
    introductions: payload.introductions,
    successStoryConsents: payload.successStoryConsents,
    legacyProfiles: payload.legacyProfiles,
    relationshipHealthAlerts: payload.relationshipHealthAlerts,
    archives: payload.archives,
    followups: payload.followups
  });

  if (result.ok) {
    return { ok: true, skipped: Boolean(result.skipped) };
  }

  return { ok: false, skipped: Boolean(result.skipped) };
}

export async function fetchConciergeMembersFromSupabase(): Promise<ConciergeMemberRecord[]> {
  const payload = (await postConciergePersistence("list-members")) as MembersPayload;
  return payload.members ?? [];
}

export async function fetchConciergeConsultantsFromSupabase(): Promise<ConciergeConsultantRecord[]> {
  const payload = (await postConciergePersistence("list-consultants")) as ConsultantsPayload;
  return payload.consultants ?? [];
}

export async function upsertConciergeMemberToSupabase(
  member: ConciergeMemberRecord
): Promise<{ ok: boolean; error?: string }> {
  const result = await postConciergePersistence("upsert-member", { member });
  return { ok: Boolean(result.ok), error: result.error ? String(result.error) : undefined };
}

export async function appendConciergeMemberTimelineEntry(
  memberId: string,
  entry: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  const result = await postConciergePersistence("append-timeline", {
    table: "members",
    recordId: memberId,
    entry
  });
  return { ok: Boolean(result.ok), error: result.error ? String(result.error) : undefined };
}

export function isConciergeSupabaseReady(): boolean {
  return persistenceReady;
}

export async function ensureConciergePersistenceHydrated(): Promise<boolean> {
  if (persistenceReady) return true;
  if (hydrationPromise) return hydrationPromise;

  hydrationPromise = (async () => {
    try {
      const status = await fetchConciergePersistenceStatus();
      if (!status.ready) {
        return false;
      }

      if (!status.bootstrapped) {
        await bootstrapConciergeDemoRecords(false);
      }

      const [members, consultants] = await Promise.all([
        fetchConciergeMembersFromSupabase(),
        fetchConciergeConsultantsFromSupabase()
      ]);

      if (members.length > 0) {
        writeJson(ADMIN_STORE_KEY, {
          members: members.map((member) => normalizeConciergeMember(member)),
          updatedAt: new Date().toISOString()
        });
      }
      if (consultants.length > 0) {
        const directory = readJson(DIRECTORY_STORE_KEY, {
          consultants: [],
          activity: [],
          meetings: [],
          updatedAt: new Date().toISOString()
        });
        writeJson(DIRECTORY_STORE_KEY, {
          ...directory,
          consultants,
          updatedAt: new Date().toISOString()
        });
      }

      persistenceReady = members.length > 0;
      return persistenceReady;
    } catch {
      return false;
    } finally {
      hydrationPromise = null;
    }
  })();

  return hydrationPromise;
}

export async function syncConciergeMemberToSupabase(
  member: ConciergeMemberRecord
): Promise<void> {
  const hydrated = await ensureConciergePersistenceHydrated();
  if (!hydrated) return;
  await upsertConciergeMemberToSupabase(member);
}
