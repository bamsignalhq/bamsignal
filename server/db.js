import pg from "pg";
import { config } from "./config.js";

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

if (pool) {
  pool.on("error", (error) => {
    console.error("[bamsignal] Database pool error:", error.message);
    dbConnectionStatus = "disconnected";
    dbConnectionError = error.message;
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
  if (!pool) return;

  await query(`
    create table if not exists subscription_events (
      id uuid primary key default gen_random_uuid(),
      provider text not null default 'paystack',
      event_type text not null,
      user_email text,
      user_id text,
      payload jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now()
    )
  `);
}

export async function ensureAppSignalsTable() {
  if (!pool) return;

  await query(`
    create table if not exists app_signals (
      id uuid primary key default gen_random_uuid(),
      user_key text not null,
      sender_email text,
      sender_phone text,
      target_profile_id text not null,
      signal_type text not null default 'signal',
      payload jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now()
    )
  `);
  await query("create index if not exists app_signals_user_key_idx on app_signals (user_key, created_at desc)");
}

export async function ensureAppMatchesTable() {
  if (!pool) return;

  await query(`
    create table if not exists app_matches (
      id text not null,
      user_key text not null,
      owner_email text,
      owner_phone text,
      profile_id text not null,
      payload jsonb not null default '{}'::jsonb,
      matched_at timestamptz not null default now(),
      primary key (id, user_key)
    )
  `);
}

export async function ensureAppMessagesTable() {
  if (!pool) return;

  await query(`
    create table if not exists app_messages (
      id text not null,
      thread_id text not null,
      user_key text not null,
      owner_email text,
      owner_phone text,
      from_side text not null,
      body text not null,
      payload jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now(),
      primary key (id, user_key)
    )
  `);
  await query(
    "create index if not exists app_messages_thread_idx on app_messages (user_key, thread_id, created_at)"
  );
}

export async function ensureAppChatThreadsTable() {
  if (!pool) return;

  await query(`
    create table if not exists app_chat_threads (
      match_id text not null,
      user_key text not null,
      owner_email text,
      owner_phone text,
      meta jsonb not null default '{}'::jsonb,
      updated_at timestamptz not null default now(),
      primary key (match_id, user_key)
    )
  `);
}

export async function ensureAppReportsTable() {
  if (!pool) return;

  await query(`
    create table if not exists app_reports (
      id uuid primary key default gen_random_uuid(),
      user_key text not null,
      reporter_email text,
      reporter_phone text,
      profile_id text not null,
      reason text not null,
      details text,
      payload jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now()
    )
  `);
  await query("create index if not exists app_reports_profile_idx on app_reports (profile_id, created_at desc)");
}

export async function ensureAllTables() {
  await ensureAppUsersTable();
  await ensurePlatformSettingsTable();
  await ensureAdminUsersTable();
  await ensureSubscriptionEventsTable();
  await ensureAppSignalsTable();
  await ensureAppMatchesTable();
  await ensureAppMessagesTable();
  await ensureAppChatThreadsTable();
  await ensureAppReportsTable();
  const { ensureCityHomeTables } = await import("./cityHome.js");
  await ensureCityHomeTables();
  const { ensureModerationSchema } = await import("./services/moderation.js");
  await ensureModerationSchema();
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
    await ensureAllTables();
    console.log("[bamsignal] Database connected successfully");
    return { ok: true };
  } catch (error) {
    dbConnectionStatus = "disconnected";
    dbConnectionError = error.message || "Database connection failed";
    console.error("[bamsignal] Database connection failed:", dbConnectionError);
    console.warn("[bamsignal] Server will continue without database persistence.");
    return { ok: false, reason: dbConnectionError };
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
    dbConnectionError = error.message || "Database ping failed";
    return false;
  }
}

export async function withDbRetry(task, attempts = 3) {
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
  throw lastError;
}

export async function ensureAppUsersTable() {
  if (!pool) return;

  await query(`
    create table if not exists app_users (
      id uuid primary key default gen_random_uuid(),
      email text unique,
      phone text unique,
      name text,
      referral_code text,
      is_premium boolean not null default false,
      premium_until timestamptz,
      telegram_vip_invite_link text,
      telegram_user_id text,
      paystack_reference text,
      referral_points integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await query("alter table app_users add column if not exists is_premium boolean not null default false");
  await query("alter table app_users add column if not exists premium_until timestamptz");
  await query("alter table app_users add column if not exists telegram_vip_invite_link text");
  await query("alter table app_users add column if not exists telegram_user_id text");
  await query("alter table app_users add column if not exists paystack_reference text");
  await query("alter table app_users add column if not exists referral_points integer not null default 0");
  await query("alter table app_users add column if not exists user_key text");
  await query("alter table app_users add column if not exists phone_verified boolean not null default false");
  await query("alter table app_users add column if not exists phone_verified_at timestamptz");
  await query("create unique index if not exists app_users_user_key_idx on app_users (user_key) where user_key is not null");
  await query("create unique index if not exists app_users_email_unique_idx on app_users (lower(email)) where email is not null and email <> ''");
  await query("create unique index if not exists app_users_phone_unique_idx on app_users (phone) where phone is not null and phone <> ''");
}

export async function ensurePlatformSettingsTable() {
  if (!pool) return;

  await query(`
    create table if not exists platform_settings (
      key text primary key,
      value jsonb not null default '{}'::jsonb,
      updated_at timestamptz not null default now()
    )
  `);
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
  if (!pool) return;

  await query(`
    create table if not exists admin_users (
      email text primary key,
      role text not null default 'admin',
      active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
}

export async function isPlatformAdminEmail(email) {
  if (!pool || !email) return false;
  await ensureAdminUsersTable();

  const result = await query(
    "select 1 from admin_users where lower(email) = lower($1) and active = true limit 1",
    [email]
  );
  return result.rowCount > 0;
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
  const matchResult = await query(
    `select id from app_matches where id = $1 and user_key = $2 limit 1`,
    [threadId, identity.userKey]
  );
  const connectionAccepted = Boolean(matchResult.rows[0]);
  const messageCheck = await assertTextSafeForContactLeak({
    email,
    phone,
    text: message.text,
    field: "message",
    allowContactExchange: connectionAccepted
  });
  if (!messageCheck.ok) {
    const error = new Error(messageCheck.error);
    error.code = "CONTACT_LEAK_BLOCKED";
    throw error;
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

  return messageResult.rows[0] || null;
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
  return row;
}

export async function fetchMemberBundle({ email, phone }) {
  if (!isDatabaseReady()) return null;
  const identity = memberIdentity({ email, phone });
  if (!identity.userKey) return null;

  const { fetchMemberSocialBundle } = await import("./memberSocial.js");

  const [matches, messages, reports, signals, user, social] = await Promise.all([
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

  const threads = {};
  for (const row of messages.rows) {
    const threadId = row.thread_id;
    const payload = row.payload || {};
    if (!threads[threadId]) {
      threads[threadId] = { matchId: threadId, messages: [] };
    }
    threads[threadId].messages.push(payload);
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
    shadowBanned: Boolean(social?.shadowBanned)
  };
}
