import { supabase } from "../supabase";

/** Future Supabase table names — schema not created yet. */
export const CONCIERGE_SUPABASE_TABLES = {
  members: "concierge_members",
  consultants: "consultants",
  introductions: "introductions",
  followups: "relationship_followups",
  archives: "journey_archives",
  legacyProfiles: "legacy_profiles",
  successStoryConsents: "success_story_consents"
} as const;

export type ConciergeSupabaseTable =
  (typeof CONCIERGE_SUPABASE_TABLES)[keyof typeof CONCIERGE_SUPABASE_TABLES];

export type ConciergePersistenceSource = "local" | "supabase";

export type ConciergeSyncResult = {
  source: ConciergePersistenceSource;
  synced: number;
  ok: boolean;
  reason?: string;
};

export type ConciergeSupabaseWriteResult = {
  ok: boolean;
  count: number;
  reason?: string;
};

export function isSupabasePersistenceAvailable(): boolean {
  return Boolean(supabase);
}

export async function noopSupabaseWrite(
  table: ConciergeSupabaseTable,
  records: unknown[]
): Promise<ConciergeSupabaseWriteResult> {
  if (!isSupabasePersistenceAvailable()) {
    return { ok: false, count: 0, reason: "supabase_unavailable" };
  }
  void table;
  void records;
  return { ok: false, count: 0, reason: "migration_not_enabled" };
}

export async function noopSupabaseSync(
  table: ConciergeSupabaseTable
): Promise<ConciergeSyncResult> {
  if (!isSupabasePersistenceAvailable()) {
    return { source: "local", synced: 0, ok: true, reason: "supabase_unavailable" };
  }
  void table;
  return { source: "local", synced: 0, ok: true, reason: "migration_not_enabled" };
}

export async function noopSupabaseHydrate(table: ConciergeSupabaseTable): Promise<void> {
  void table;
}

export function serializeRecord<T extends object>(record: T): Record<string, unknown> {
  return JSON.parse(JSON.stringify(record)) as Record<string, unknown>;
}
