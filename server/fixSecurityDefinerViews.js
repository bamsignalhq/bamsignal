import { isDatabaseReady, query } from "./db.js";

const VIEWS = [
  "signals_vault",
  "truth_evidence_feed",
  "user_subscriptions",
  "match_master"
];

/** Supabase linter 0010 — convert SECURITY DEFINER views to SECURITY INVOKER. */
export async function fixSecurityDefinerViews() {
  if (!isDatabaseReady()) {
    return { ok: false, reason: "database_not_connected", fixed: [] };
  }

  const fixed = [];

  for (const viewName of VIEWS) {
    const exists = await query(
      `select 1
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public'
         and c.relkind = 'v'
         and c.relname = $1
       limit 1`,
      [viewName]
    );

    if (!exists.rows[0]) continue;

    await query(`alter view public.${viewName} set (security_invoker = true)`);
    fixed.push(viewName);
  }

  return { ok: true, fixed };
}
