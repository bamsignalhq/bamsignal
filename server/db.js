import pg from "pg";
import { config } from "./config.js";
import { logRetryExhausted, logThresholdedAlert } from "./services/observability.js";
import { sanitizeApiErrorForLog } from "./services/errorResponse.js";
import {
  assertSchemaReady,
  assertSchemaTable,
  checkSchema,
  resetSchemaVerificationCache,
  acceptSchemaDespiteProbeMismatch
} from "./services/schemaVerification.js";

export { checkSchema } from "./services/schemaVerification.js";

const { Pool } = pg;

export const pool = config.databaseUrl
  ? new Pool({
      connectionString: config.databaseUrl,
      ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
    })
  : null;

/** @type {"dry-run" | "connected" | "disconnected"} */
let dbConnectionStatus = config.databaseUrl ? "disconnected" : "dry-run";
let dbConnectionError = null;

function databaseErrorSummary(error, fallback = "Database unavailable") {
  const sanitized = sanitizeApiErrorForLog(error);
  return sanitized.category === "application_error" ? sanitized.message : fallback;
}

if (pool) {
  pool.on("error", (error) => {
    const sanitized = sanitizeApiErrorForLog(error);
    dbConnectionStatus = "disconnected";
    dbConnectionError = databaseErrorSummary(error, "Database pool error");
    logThresholdedAlert("db_unavailable", {
      reason: "pool_error",
      error: sanitized.message,
      errorCategory: sanitized.category
    });
  });
}

export const dbEnabled = Boolean(pool);

export function getDatabaseStatus() {
  if (!config.databaseUrl) return "dry-run";
  return dbConnectionStatus;
}

export function getDatabaseError() {
  return dbConnectionError;
}

export function isDatabaseReady() {
  return Boolean(pool) && dbConnectionStatus === "connected";
}

export async function query(text, params = []) {
  if (!pool || !isDatabaseReady()) return { rows: [], rowCount: 0 };
  return pool.query(text, params);
}

export function normalizeUserKey({ email, phone } = {}) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (normalizedEmail.includes("@")) return `email:${normalizedEmail}`;

  const digits = String(phone || "")
    .replace(/\D/g, "")
    .replace(/^234/, "");
  if (digits) return `phone:${digits}`;
  return null;
}

export async function ensureSubscriptionEventsTable() {
  return assertSchemaTable("subscription_events");
}

export async function ensurePaymentFulfillmentsTable() {
  return assertSchemaTable("payment_fulfillments");
}

export async function ensureAppSignalsTable() {
  return assertSchemaTable("app_signals");
}

export async function ensureAppMatchesTable() {
  return assertSchemaTable("app_matches");
}

export async function ensureAppMessagesTable() {
  return assertSchemaTable("app_messages");
}

export async function ensureAppChatThreadsTable() {
  return assertSchemaTable("app_chat_threads");
}

export async function ensureAppReportsTable() {
  return assertSchemaTable("app_reports");
}

export async function ensureAllTables() {
  return assertSchemaReady();
}

export async function initDatabase() {
  if (!pool) {
    dbConnectionStatus = "dry-run";
    dbConnectionError = null;
    return { ok: false, reason: "DATABASE_URL is not set" };
  }

  try {
    await pool.query("select 1 as ok");
    dbConnectionStatus = "connected";
    dbConnectionError = null;
    resetSchemaVerificationCache();
    const schema = await checkSchema({ force: true });
    if (!schema.ok && !schema.skipped) {
      // Fail-closed only when the public schema is actually empty.
      // A false-negative required-table probe must not take production offline.
      let publicTableCount = 0;
      try {
        const countResult = await pool.query(
          `select count(*)::int as n
           from information_schema.tables
           where table_schema = 'public' and table_type = 'BASE TABLE'`
        );
        publicTableCount = Number(countResult.rows[0]?.n || 0);
      } catch {
        publicTableCount = 0;
      }

      console.warn("[bamsignal] schema_verification_mismatch", {
        missingCount: schema.missing?.length || 0,
        presentCount: schema.present?.length || 0,
        publicTableCount,
        missingSample: (schema.missing || []).slice(0, 8)
      });

      if (publicTableCount > 10) {
        logThresholdedAlert("schema_incomplete", {
          reason: "schema_probe_mismatch",
          missing: schema.missing,
          publicTableCount
        });
        console.warn(
          `[bamsignal] Keeping database connected despite schema probe mismatch (public_tables=${publicTableCount}).`
        );
        acceptSchemaDespiteProbeMismatch({
          publicTableCount,
          missing: schema.missing
        });
        console.log("[bamsignal] Database connected successfully");
        return { ok: true, schemaVerified: false, publicTableCount, missing: schema.missing };
      }

      dbConnectionStatus = "disconnected";
      dbConnectionError = schema.message;
      logThresholdedAlert("schema_incomplete", {
        reason: "schema_not_migrated",
        missing: schema.missing,
        publicTableCount
      });
      console.warn(`[bamsignal] ${schema.message}`);
      return { ok: false, reason: schema.message, missing: schema.missing, publicTableCount };
    }
    console.log("[bamsignal] Database connected successfully");
    return { ok: true, schemaVerified: schema.ok && !schema.skipped };
  } catch (error) {
    const sanitized = sanitizeApiErrorForLog(error);
    dbConnectionStatus = "disconnected";
    dbConnectionError = databaseErrorSummary(error, "Database connection failed");
    logThresholdedAlert("db_unavailable", {
      reason: "init_failed",
      error: sanitized.message,
      errorCategory: sanitized.category
    });
    console.warn("[bamsignal] Server will continue without database persistence.");
    return { ok: false, reason: dbConnectionError };
  }
}

export async function closeDatabase() {
  if (!pool) return { ok: true, skipped: true };
  try {
    await pool.end();
    dbConnectionStatus = "disconnected";
    dbConnectionError = null;
    return { ok: true };
  } catch (error) {
    const sanitized = sanitizeApiErrorForLog(error);
    dbConnectionError = databaseErrorSummary(error, "Database pool close failed");
    return { ok: false, reason: sanitized.message };
  }
}

export async function pingDatabase() {
  if (!pool) return false;
  if (dbConnectionStatus !== "connected") return false;
  try {
    await pool.query("select 1 as ok");
    return true;
  } catch (error) {
    dbConnectionStatus = "disconnected";
    dbConnectionError = databaseErrorSummary(error, "Database ping failed");
    return false;
  }
}

export async function withDbRetry(task, attempts = 3, context = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }
  logRetryExhausted("database", {
    attempts,
    operation: context.operation || null,
    error: lastError instanceof Error ? lastError.message : String(lastError || "unknown")
  });
  throw lastError;
}

export async function ensureAppUsersTable() {
  return assertSchemaTable("app_users");
}

export async function ensurePlatformSettingsTable() {
  return assertSchemaTable("platform_settings");
}

export async function getPlatformSetting(key, fallback = null) {
  if (!pool) return fallback;
  await ensurePlatformSettingsTable();

  const result = await query("select value from platform_settings where key = $1 limit 1", [key]);
  return result.rows[0]?.value ?? fallback;
}

export async function setPlatformSetting(key, value) {
  if (!pool) return value;
  await ensurePlatformSettingsTable();

  const result = await query(
    `insert into platform_settings (key, value, updated_at)
     values ($1, $2, now())
     on conflict (key)
     do update set value = excluded.value, updated_at = now()
     returning value`,
    [key, value]
  );
  return result.rows[0]?.value ?? value;
}

export async function ensureAdminUsersTable() {
  return assertSchemaTable("admin_users");
}

export async function isPlatformAdminEmail(email) {
  if (!pool || !email) return false;
  const record = await getPlatformAdminByEmail(email);
  return Boolean(record?.active);
}

export async function getPlatformAdminByEmail(email) {
  if (!pool || !email) return null;
  await ensureAdminUsersTable();

  const result = await query(
    "select email, role, active, created_at, updated_at from admin_users where lower(email) = lower($1) limit 1",
    [email]
  );
  return result.rows[0] || null;
}

export async function listPlatformAdmins() {
  if (!pool) return [];
  await ensureAdminUsersTable();

  const result = await query(
    "select email, role, active, created_at, updated_at from admin_users order by created_at asc"
  );
  return result.rows;
}

export async function upsertPlatformAdmin(email, role = "admin") {
  if (!pool) return null;
  await ensureAdminUsersTable();

  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized.includes("@")) throw new Error("Enter a valid admin email address.");

  const result = await query(
    `insert into admin_users (email, role, active, updated_at)
     values ($1, $2, true, now())
     on conflict (email)
     do update set role = excluded.role, active = true, updated_at = now()
     returning email, role, active, created_at, updated_at`,
    [normalized, role || "admin"]
  );
  return result.rows[0];
}

export async function deactivatePlatformAdmin(email) {
  if (!pool) return null;
  await ensureAdminUsersTable();

  const result = await query(
    `update admin_users
     set active = false, updated_at = now()
     where lower(email) = lower($1)
     returning email, role, active, created_at, updated_at`,
    [String(email || "").trim().toLowerCase()]
  );
  return result.rows[0] || null;
}

export async function findAppUserIdentity({ email, phone }) {
  if (!isDatabaseReady()) return null;
  await ensureAppUsersTable();

  const result = await query(
    `select *
     from app_users
     where ($1::text is not null and lower(email) = lower($1::text))
        or ($2::text is not null and phone = $2::text)
     limit 1`,
    [email || null, phone || null]
  );
  return result.rows[0] || null;
}

export async function upsertAppUserIdentity({ email, phone, name, referralCode }) {
  if (!isDatabaseReady()) return null;
  await ensureAppUsersTable();

  const userKey = normalizeUserKey({ email, phone });
  const existing = await findAppUserIdentity({ email, phone });
  const result = existing
    ? await query(
        `update app_users
         set email = coalesce($1, email),
             phone = coalesce($2, phone),
             name = coalesce($3, name),
             referral_code = coalesce($4, referral_code),
             user_key = coalesce(user_key, $5),
             updated_at = now()
         where lower(email) = lower($1::text) or phone = $2
         returning *`,
        [email || null, phone || null, name || null, referralCode || null, userKey]
      )
    : await query(
        `insert into app_users (email, phone, name, referral_code, user_key)
         values ($1, $2, $3, $4, $5)
         returning *`,
        [email || null, phone || null, name || null, referralCode || null, userKey]
      );
  return result.rows[0];
}

export async function activateAppUserPremium({ email, phone, name, premiumUntil, paystackReference, inviteLink }) {
  if (!isDatabaseReady()) return null;
  await ensureAppUsersTable();

  if (paystackReference) {
    const duplicate = await query("select * from app_users where paystack_reference = $1 limit 1", [
      paystackReference
    ]);
    if (duplicate.rows[0]) {
      return duplicate.rows[0];
    }
  }

  const existing = await findAppUserIdentity({ email, phone });
  const result = existing
    ? await query(
        `update app_users
         set email = coalesce($1, email),
             phone = coalesce($2, phone),
             name = coalesce($3, name),
             is_premium = true,
             premium_until = $4,
             paystack_reference = coalesce($5, paystack_reference),
             telegram_vip_invite_link = coalesce($6, telegram_vip_invite_link),
             updated_at = now()
         where ($1::text is not null and lower(email) = lower($1::text))
            or ($2::text is not null and phone = $2::text)
         returning *`,
        [email || null, phone || null, name || null, premiumUntil, paystackReference || null, inviteLink || null]
      )
    : await query(
        `insert into app_users (email, phone, name, is_premium, premium_until, paystack_reference, telegram_vip_invite_link)
         values ($1, $2, $3, true, $4, $5, $6)
         returning *`,
        [email || null, phone || null, name || null, premiumUntil, paystackReference || null, inviteLink || null]
      );
  return result.rows[0];
}

export async function activateAppUserFastConnectionPass({
  email,
  phone,
  name,
  passUntil,
  paystackReference
}) {
  if (!isDatabaseReady()) return null;
  await ensureAppUsersTable();

  if (paystackReference) {
    const duplicate = await query("select * from app_users where paystack_reference = $1 limit 1", [
      paystackReference
    ]);
    if (duplicate.rows[0]) {
      return duplicate.rows[0];
    }
  }

  const existing = await findAppUserIdentity({ email, phone });
  const result = existing
    ? await query(
        `update app_users
         set email = coalesce($1, email),
             phone = coalesce($2, phone),
             name = coalesce($3, name),
             fast_connection_pass_until = $4,
             paystack_reference = coalesce($5, paystack_reference),
             updated_at = now()
         where ($1::text is not null and lower(email) = lower($1::text))
            or ($2::text is not null and phone = $2::text)
         returning *`,
        [email || null, phone || null, name || null, passUntil, paystackReference || null]
      )
    : await query(
        `insert into app_users (email, phone, name, fast_connection_pass_until, paystack_reference)
         values ($1, $2, $3, $4, $5)
         returning *`,
        [email || null, phone || null, name || null, passUntil, paystackReference || null]
      );
  return result.rows[0];
}

function memberIdentity({ email, phone }) {
  const userKey = normalizeUserKey({ email, phone });
  const normalizedPhone = String(phone || "")
    .replace(/\D/g, "")
    .replace(/^234/, "");
  return {
    userKey,
    email: String(email || "")
      .trim()
      .toLowerCase(),
    phone: normalizedPhone || null
  };
}

export async function persistSignal({ email, phone, targetProfileId, signalType = "signal", payload = {} }) {
  if (!isDatabaseReady()) return null;
  const identity = memberIdentity({ email, phone });
  if (!identity.userKey || !targetProfileId) return null;
  await ensureAppSignalsTable();

  const result = await query(
    `insert into app_signals (user_key, sender_email, sender_phone, target_profile_id, signal_type, payload)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [
      identity.userKey,
      identity.email || null,
      identity.phone,
      targetProfileId,
      signalType,
      payload
    ]
  );
  return result.rows[0] || null;
}

export async function persistMatch({ email, phone, match }) {
  if (!isDatabaseReady() || !match?.id) return null;
  const identity = memberIdentity({ email, phone });
  if (!identity.userKey) return null;
  await ensureAppMatchesTable();

  const result = await query(
    `insert into app_matches (id, user_key, owner_email, owner_phone, profile_id, payload, matched_at)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (id, user_key)
     do update set payload = excluded.payload, matched_at = excluded.matched_at
     returning *`,
    [
      match.id,
      identity.userKey,
      identity.email || null,
      identity.phone,
      match.profileId,
      match,
      match.matchedAt || new Date().toISOString()
    ]
  );
  return result.rows[0] || null;
}

export async function persistMessage({ email, phone, threadId, message, threadMeta = {} }) {
  if (!isDatabaseReady() || !threadId || !message?.id) return null;
  const identity = memberIdentity({ email, phone });
  if (!identity.userKey) return null;

  const { assertTextSafeForContactLeak } = await import("./services/contactLeak.js");
  const { exchangeAllowsContactSharing } = await import("./services/contactExchange.js");
  const matchResult = await query(
    `select id from app_matches where id = $1 and user_key = $2 limit 1`,
    [threadId, identity.userKey]
  );
  const hasMatch = Boolean(matchResult.rows[0]);
  const threadRow = await query(
    `select meta from app_chat_threads where match_id = $1 and user_key = $2 limit 1`,
    [threadId, identity.userKey]
  );
  const storedMeta =
    threadRow.rows[0]?.meta && typeof threadRow.rows[0].meta === "object" ? threadRow.rows[0].meta : {};
  const contactExchange = storedMeta.contactExchange || threadMeta?.contactExchange || null;
  const allowContactExchange = hasMatch && exchangeAllowsContactSharing(contactExchange);
  const messageCheck = await assertTextSafeForContactLeak({
    email,
    phone,
    text: message.text,
    field: "message",
    allowContactExchange: allowContactExchange
  });
  if (!messageCheck.ok) {
    const error = new Error(messageCheck.error);
    error.code = "CONTACT_LEAK_BLOCKED";
    throw error;
  }

  const { analyzeOutgoingMessage } = await import("./services/spamDetection.js");
  const member = await query(`select id, shadow_banned from app_member_profiles where user_key = $1 limit 1`, [
    identity.userKey
  ]);
  const senderShadowBanned = Boolean(member.rows[0]?.shadow_banned);

  if (!senderShadowBanned) {
    await analyzeOutgoingMessage({
      email,
      phone,
      text: message.text,
      recipientProfileId: threadMeta?.recipientProfileId || null,
      profileId: member.rows[0]?.id
    });
  }

  await ensureAppMessagesTable();
  await ensureAppChatThreadsTable();

  const messageResult = await query(
    `insert into app_messages (id, thread_id, user_key, owner_email, owner_phone, from_side, body, payload, created_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     on conflict (id, user_key) do nothing
     returning *`,
    [
      message.id,
      threadId,
      identity.userKey,
      identity.email || null,
      identity.phone,
      message.from,
      message.text,
      message,
      message.at || new Date().toISOString()
    ]
  );

  await query(
    `insert into app_chat_threads (match_id, user_key, owner_email, owner_phone, meta, updated_at)
     values ($1, $2, $3, $4, $5, now())
     on conflict (match_id, user_key)
     do update set meta = excluded.meta, updated_at = now()`,
    [threadId, identity.userKey, identity.email || null, identity.phone, threadMeta]
  );

  const row = messageResult.rows[0] || null;
  if (!row) return null;
  if (senderShadowBanned) {
    return { ...row, payload: { ...(row.payload || message), suppressed: true }, suppressed: true };
  }

  try {
    const peerResult = await query(
      `select user_key, owner_email, owner_phone
       from app_matches
       where id = $1 and user_key <> $2
       limit 1`,
      [threadId, identity.userKey]
    );
    const peer = peerResult.rows[0];
    if (peer?.user_key) {
      const peerFrom = message.from === "me" ? "them" : "me";
      const peerPayload = { ...message, from: peerFrom };
      await query(
        `insert into app_messages (id, thread_id, user_key, owner_email, owner_phone, from_side, body, payload, created_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         on conflict (id, user_key) do nothing`,
        [
          message.id,
          threadId,
          peer.user_key,
          peer.owner_email || null,
          peer.owner_phone || null,
          peerFrom,
          message.text,
          peerPayload,
          message.at || new Date().toISOString()
        ]
      );
      await query(
        `insert into app_chat_threads (match_id, user_key, owner_email, owner_phone, meta, updated_at)
         values ($1, $2, $3, $4, $5, now())
         on conflict (match_id, user_key)
         do update set updated_at = now()`,
        [threadId, peer.user_key, peer.owner_email || null, peer.owner_phone || null, {}]
      );
    }
  } catch (error) {
    console.error("[bamsignal] message fan-out failed:", error?.message || error);
  }

  return row;
}

export async function persistReport({ email, phone, report }) {
  if (!isDatabaseReady() || !report?.profileId || !report?.reason) return null;
  const identity = memberIdentity({ email, phone });
  if (!identity.userKey) return null;

  const { assertTextSafeForContactLeak } = await import("./services/contactLeak.js");
  if (report.details) {
    const detailsCheck = await assertTextSafeForContactLeak({
      email,
      phone,
      text: report.details,
      field: "report_note"
    });
    if (!detailsCheck.ok) {
      const error = new Error(detailsCheck.error);
      error.code = "CONTACT_LEAK_BLOCKED";
      throw error;
    }
  }

  await ensureAppReportsTable();
  const { ensureModerationSchema, maybeAutoShadowBanProfile } = await import("./services/moderation.js");
  await ensureModerationSchema();

  const result = await query(
    `insert into app_reports (user_key, reporter_email, reporter_phone, profile_id, reason, details, payload, created_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning *`,
    [
      identity.userKey,
      identity.email || null,
      identity.phone,
      report.profileId,
      report.reason,
      report.details || null,
      report,
      report.at || new Date().toISOString()
    ]
  );
  const row = result.rows[0] || null;
  if (row?.profile_id) {
    void maybeAutoShadowBanProfile(row.profile_id).catch((error) => {
      console.error("[bamsignal] auto shadow ban failed:", error);
    });
  }
  if (row) {
    const { findMemberProfileByUserKey } = await import("./cityHome.js");
    const reporter = await findMemberProfileByUserKey(email, phone);
    const { writeAuditLog } = await import("./services/auditLog.js");
    await writeAuditLog({
      userId: reporter?.id || null,
      targetUserId: report.profileId,
      action: report.blocked ? "block_and_report_submitted" : "report_submitted",
      details: {
        reason: report.reason,
        hasDetails: Boolean(report.details)
      }
    });
  }
  return row;
}

export async function fetchMemberBundle({ email, phone }) {
  if (!isDatabaseReady()) return null;
  const identity = memberIdentity({ email, phone });
  if (!identity.userKey) return null;

  const { fetchMemberSocialBundle } = await import("./memberSocial.js");

  const [matches, messages, threadMetaRows, reports, signals, user, social] = await Promise.all([
    query(
      `select payload, matched_at
       from app_matches
       where user_key = $1
       order by matched_at desc`,
      [identity.userKey]
    ),
    query(
      `select thread_id, payload, created_at
       from app_messages
       where user_key = $1
       order by created_at asc`,
      [identity.userKey]
    ),
    query(
      `select match_id, meta
       from app_chat_threads
       where user_key = $1`,
      [identity.userKey]
    ),
    query(
      `select payload, created_at
       from app_reports
       where user_key = $1
       order by created_at desc`,
      [identity.userKey]
    ),
    query(
      `select count(*)::int as count
       from app_signals
       where user_key = $1`,
      [identity.userKey]
    ),
    findAppUserIdentity({ email: identity.email, phone: identity.phone }),
    fetchMemberSocialBundle({ email, phone })
  ]);

  const threadMetaById = Object.fromEntries(
    threadMetaRows.rows.map((row) => [row.match_id, row.meta && typeof row.meta === "object" ? row.meta : {}])
  );

  const threads = {};
  for (const row of messages.rows) {
    const threadId = row.thread_id;
    const payload = row.payload || {};
    if (!threads[threadId]) {
      const meta = threadMetaById[threadId] || {};
      threads[threadId] = {
        matchId: threadId,
        messages: [],
        ...(meta.contactExchange ? { contactExchange: meta.contactExchange } : {}),
        ...(meta.offPlatformApproved ? { offPlatformApproved: meta.offPlatformApproved } : {}),
        ...(meta.pendingOffPlatformRequest
          ? { pendingOffPlatformRequest: meta.pendingOffPlatformRequest }
          : {}),
        ...(meta.offPlatformDeclined ? { offPlatformDeclined: meta.offPlatformDeclined } : {})
      };
    }
    threads[threadId].messages.push(payload);
  }

  for (const [threadId, meta] of Object.entries(threadMetaById)) {
    if (!threads[threadId]) {
      threads[threadId] = {
        matchId: threadId,
        messages: [],
        ...(meta.contactExchange ? { contactExchange: meta.contactExchange } : {})
      };
    }
  }

  return {
    user,
    matches: matches.rows.map((row) => row.payload),
    chats: threads,
    reports: reports.rows.map((row) => row.payload),
    signalsSent: signals.rows[0]?.count ?? 0,
    incomingSignals: social?.incomingSignals ?? [],
    referral: social?.referral ?? null,
    premium: social?.premium ?? null,
    memberProfileId: social?.memberProfileId ?? null,
    datingProfile: social?.datingProfile ?? null,
    incomingLikes: social?.incomingLikes ?? [],
    incomingFollows: social?.incomingFollows ?? [],
    savedProfileIds: social?.savedProfileIds ?? [],
    shadowBanned: Boolean(social?.shadowBanned)
  };
}
