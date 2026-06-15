import { isDatabaseReady, query } from "./db.js";

const VIEWS = [
  "signals_vault",
  "truth_evidence_feed",
  "user_subscriptions",
  "match_master"
];

export async function securityInvokerViewStatus() {
  if (!isDatabaseReady()) return null;

  const result = await query(
    `select c.relname as viewname, c.reloptions
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relkind = 'v'
       and c.relname = any($1::text[])`,
    [VIEWS]
  );

  const status = {};
  for (const name of VIEWS) {
    status[name] = { exists: false, securityInvoker: false };
  }

  for (const row of result.rows) {
    const options = Array.isArray(row.reloptions) ? row.reloptions : [];
    status[row.viewname] = {
      exists: true,
      securityInvoker: options.some((opt) => /^security_invoker=(true|on)$/i.test(String(opt)))
    };
  }

  return status;
}

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

    try {
      await query(`alter view public.${viewName} set (security_invoker = true)`);
    } catch (alterError) {
      const definition = await query(
        `select pg_get_viewdef(c.oid, true) as definition
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
         where n.nspname = 'public' and c.relkind = 'v' and c.relname = $1`,
        [viewName]
      );
      const sql = definition.rows[0]?.definition;
      if (!sql) throw alterError;
      await query(
        `create or replace view public.${viewName} with (security_invoker = true) as ${sql}`
      );
    }

    fixed.push(viewName);
  }

  return { ok: true, fixed };
}
