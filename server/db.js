import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

export const pool = config.databaseUrl
  ? new Pool({
      connectionString: config.databaseUrl,
      ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
    })
  : null;

export const dbEnabled = Boolean(pool);

export async function query(text, params = []) {
  if (!pool) return { rows: [], rowCount: 0 };
  return pool.query(text, params);
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
  if (!pool) return null;
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
  if (!pool) return null;
  await ensureAppUsersTable();

  const existing = await findAppUserIdentity({ email, phone });
  const result = existing
    ? await query(
        `update app_users
         set email = coalesce($1, email),
             phone = coalesce($2, phone),
             name = coalesce($3, name),
             referral_code = coalesce($4, referral_code),
             updated_at = now()
         where lower(email) = lower($1::text) or phone = $2
         returning *`,
        [email || null, phone || null, name || null, referralCode || null]
      )
    : await query(
        `insert into app_users (email, phone, name, referral_code)
         values ($1, $2, $3, $4)
         returning *`,
        [email || null, phone || null, name || null, referralCode || null]
      );
  return result.rows[0];
}

export async function activateAppUserPremium({ email, phone, name, premiumUntil, paystackReference, inviteLink }) {
  if (!pool) return null;
  await ensureAppUsersTable();

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
