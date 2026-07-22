import { isDatabaseReady, pool } from "../databaseConnection.js";

export class SchemaVerificationError extends Error {
  constructor(missing = [], message = null) {
    const tables = Array.isArray(missing) ? missing : [missing];
    super(
      message ||
        `Database schema is not migrated. Missing tables: ${tables.join(", ")}. Run: npm run migrate`
    );
    this.name = "SchemaVerificationError";
    this.status = 503;
    this.code = "schema_not_migrated";
    this.missing = tables;
  }
}

/** Public tables required before the app may perform database-backed operations. */
export const REQUIRED_SCHEMA_TABLES = Object.freeze([
  "admin_users",
  "api_rate_events",
  "app_chat_threads",
  "app_fast_connection_daily",
  "app_matches",
  "app_member_profiles",
  "app_messages",
  "app_profile_follows",
  "app_profile_likes",
  "app_referral_events",
  "app_member_boosts",
  "app_conversation_unlocks",
  "app_reports",
  "app_signals",
  "app_users",
  "audit_logs",
  "city_home_placements",
  "city_spotlight_events",
  "connection_notes",
  "contact_exchange_events",
  "contact_exchange_requests",
  "contact_leak_attempts",
  "email_verification_codes",
  "login_2fa_codes",
  "member_introductions",
  "moderation_audit_log",
  "moderation_flags",
  "payment_events",
  "payment_fulfillments",
  "payment_initialize_rate_events",
  "passport_consent_grants",
  "passport_signal_contributors",
  "passport_signal_events",
  "passport_signal_provenance",
  "passport_signal_validation_reports",
  "passport_trust_signals",
  "passport_signal_governance_actions",
  "passport_signal_history",
  "passport_signal_review_queue",
  "passport_signal_contributor_health",
  "passport_signal_replay_events",
  "passport_signal_retention",
  "photo_reviews",
  "pin_auth_attempts",
  "pin_reset_codes",
  "platform_audit_log",
  "platform_settings",
  "saved_profiles",
  "signup_provisioning_attempts",
  "spam_message_fingerprints",
  "subscription_events",
  "success_stories",
  "user_compliance_acknowledgements",
  "verification_submissions",
  "whatsapp_verification_codes"
]);

let schemaVerificationCache = null;

export function resetSchemaVerificationCache() {
  schemaVerificationCache = null;
}

/** Mark schema usable after a false-negative probe so assertSchemaReady does not 503. */
export function acceptSchemaDespiteProbeMismatch({ publicTableCount = 0, missing = [] } = {}) {
  schemaVerificationCache = {
    ok: true,
    skipped: false,
    reason: "schema_probe_mismatch_accepted",
    missing: [],
    present: [...REQUIRED_SCHEMA_TABLES],
    publicTableCount,
    probeMissing: Array.isArray(missing) ? missing : [],
    message: "Database schema accepted after probe mismatch."
  };
  return schemaVerificationCache;
}

export async function checkSchema(options = {}) {
  const force = Boolean(options.force);
  if (!force && schemaVerificationCache) {
    return schemaVerificationCache;
  }

  if (!pool) {
    const result = {
      ok: true,
      skipped: true,
      reason: "database_not_configured",
      missing: [],
      present: [],
      message: "Database not configured (dry-run)."
    };
    if (!force) schemaVerificationCache = result;
    return result;
  }

  if (!isDatabaseReady()) {
    const result = {
      ok: false,
      skipped: false,
      reason: "database_not_connected",
      missing: [...REQUIRED_SCHEMA_TABLES],
      present: [],
      message: "Database is not connected."
    };
    if (!force) schemaVerificationCache = result;
    return result;
  }

  // Prefer pg_catalog; keep information_schema as fallback for older Postgres roles.
  let result = await pool.query(
    `select c.relname as table_name
     from pg_catalog.pg_class c
     join pg_catalog.pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relkind = 'r'
       and not c.relispartition`
  );
  if (!result.rows.length) {
    result = await pool.query(
      `select table_name
       from information_schema.tables
       where table_schema = 'public'
         and table_type = 'BASE TABLE'`
    );
  }
  const publicTables = new Set(
    result.rows.map((row) => String(row.table_name || "").trim()).filter(Boolean)
  );
  let present = REQUIRED_SCHEMA_TABLES.filter((tableName) => publicTables.has(tableName));
  let missing = REQUIRED_SCHEMA_TABLES.filter((tableName) => !publicTables.has(tableName));

  // Canary: if listing missed everything but core relations resolve, accept schema.
  if (missing.length === REQUIRED_SCHEMA_TABLES.length) {
    const canary = await pool.query(`select to_regclass('public.app_users')::text as reg`);
    if (canary.rows[0]?.reg) {
      present = [...REQUIRED_SCHEMA_TABLES];
      missing = [];
    }
  }

  const checkResult = {
    ok: missing.length === 0,
    skipped: false,
    reason: missing.length ? "schema_incomplete" : "schema_ok",
    missing,
    present,
    publicTableCount: publicTables.size,
    message:
      missing.length === 0
        ? "Database schema verified."
        : `Database schema is not migrated. Missing tables: ${missing.join(", ")}. Run: npm run migrate`
  };
  if (!force) schemaVerificationCache = checkResult;
  return checkResult;
}

export async function assertSchemaReady(options = {}) {
  if (!isDatabaseReady()) return;
  const status = await checkSchema(options);
  if (status.skipped) return;
  if (!status.ok) {
    throw new SchemaVerificationError(status.missing, status.message);
  }
}

export async function assertSchemaTable(tableName) {
  if (!isDatabaseReady()) return;
  await assertSchemaReady();
  const status = await checkSchema();
  if (!status.present.includes(tableName)) {
    throw new SchemaVerificationError([tableName]);
  }
}

/** Verify-only replacement for legacy ensure*Table helpers. */
export async function ensureSchemaTable(tableName) {
  return assertSchemaTable(tableName);
}
