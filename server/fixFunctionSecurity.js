import { isDatabaseReady, query } from "./db.js";

const SEARCH_PATH_FUNCTIONS = [
  "prevent_prediction_mutation_after_publish",
  "lock_public_ledger_prediction_fields",
  "set_updated_at",
  "sync_public_ledger_from_prediction",
  "sync_truth_ledger_from_public_ledger",
  "sync_truth_ledger_from_transparency"
];

const RPC_REVOKE_FUNCTIONS = ["handle_auth_user_sync", "rls_auto_enable"];

async function listPublicFunctions(names) {
  const result = await query(
    `select p.proname as name,
            pg_get_function_identity_arguments(p.oid) as args,
            p.oid::regprocedure as signature,
            p.prosecdef as security_definer,
            coalesce(p.proconfig, array[]::text[]) as config
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname = any($1::text[])
     order by p.proname, p.oid`,
    [names]
  );
  return result.rows;
}

function hasSearchPathPublic(config) {
  const options = Array.isArray(config) ? config : [];
  return options.some((entry) => /^search_path=public$/i.test(String(entry)));
}

export async function functionSecurityStatus() {
  if (!isDatabaseReady()) return null;

  const searchPathRows = await listPublicFunctions(SEARCH_PATH_FUNCTIONS);
  const rpcRows = await listPublicFunctions(RPC_REVOKE_FUNCTIONS);

  const searchPath = {};
  for (const name of SEARCH_PATH_FUNCTIONS) {
    searchPath[name] = { exists: false, searchPathPublic: false };
  }
  for (const row of searchPathRows) {
    searchPath[row.name] = {
      exists: true,
      searchPathPublic: hasSearchPathPublic(row.config),
      signature: String(row.signature)
    };
  }

  const rpcExecute = {};
  for (const name of RPC_REVOKE_FUNCTIONS) {
    rpcExecute[name] = { exists: false, anonExecute: null, authenticatedExecute: null };
  }

  for (const row of rpcRows) {
    const grants = await query(
      `select grantee, privilege_type
       from information_schema.role_routine_grants
       where routine_schema = 'public'
         and routine_name = $1
         and privilege_type = 'EXECUTE'`,
      [row.name]
    );
    const grantees = new Set(grants.rows.map((g) => String(g.grantee)));
    rpcExecute[row.name] = {
      exists: true,
      securityDefiner: Boolean(row.security_definer),
      signature: String(row.signature),
      anonExecute: grantees.has("anon"),
      authenticatedExecute: grantees.has("authenticated"),
      publicExecute: grantees.has("PUBLIC")
    };
  }

  return { searchPath, rpcExecute };
}

/** Supabase linter 0011 + 0028/0029 — harden legacy public functions. */
export async function fixFunctionSecurity() {
  if (!isDatabaseReady()) {
    return { ok: false, reason: "database_not_connected", searchPathFixed: [], rpcRevoked: [] };
  }

  const searchPathFixed = [];
  const rpcRevoked = [];

  const searchPathRows = await listPublicFunctions(SEARCH_PATH_FUNCTIONS);
  for (const row of searchPathRows) {
    if (hasSearchPathPublic(row.config)) continue;
    await query(`alter function ${row.signature} set search_path = public`);
    searchPathFixed.push(row.name);
  }

  const rpcRows = await listPublicFunctions(RPC_REVOKE_FUNCTIONS);
  for (const row of rpcRows) {
    const signature = String(row.signature);
    await query(`revoke all on function ${signature} from public`);
    await query(`revoke all on function ${signature} from anon`);
    await query(`revoke all on function ${signature} from authenticated`);
    await query(`grant execute on function ${signature} to service_role`);
    rpcRevoked.push(row.name);
  }

  return { ok: true, searchPathFixed, rpcRevoked };
}
