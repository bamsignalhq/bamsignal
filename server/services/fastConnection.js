import { getApprovedMainPhoto } from "../../shared/photoReview.mjs";
import {
  resolveFastConnectionPassStatus,
  resolveSignalPassStatus
} from "../../shared/memberEntitlements.mjs";
import { findAppUserIdentity, isDatabaseReady, normalizeUserKey, query } from "../db.js";
import { findMemberProfileByUserKey } from "../cityHome.js";
import { discoverVisibilitySql, ensureMemberTrustSchema } from "../memberTrust.js";
import { publicPhotosFromProfile } from "./photoReview.js";

export const FAST_CONNECTION_DAILY_SIGNALS = 30;
const RESET_MS = 24 * 60 * 60 * 1000;
const PASS_DAYS_DEFAULT = 7;

function isFastConnectionProductType(productType = "") {
  const value = String(productType || "").trim().toLowerCase();
  return value === "quickie" || value === "fast_connection";
}

function startOfLocalDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function computeFastConnectionExpiryReminder(expiresAt) {
  if (!expiresAt) return null;
  const expMs = new Date(expiresAt).getTime();
  if (!Number.isFinite(expMs) || expMs <= Date.now()) return null;

  const today = startOfLocalDay();
  const expiryDay = startOfLocalDay(new Date(expMs));
  const diffDays = Math.round((expiryDay.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  return null;
}

function passWindowFromUntil(expiresAt, passDays = PASS_DAYS_DEFAULT) {
  if (!expiresAt) return { startsAt: null, expiresAt: null };
  const expiresMs = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiresMs)) return { startsAt: null, expiresAt: null };
  return {
    startsAt: new Date(expiresMs - passDays * 86400000).toISOString(),
    expiresAt: new Date(expiresMs).toISOString()
  };
}

export async function ensureFastConnectionSchema() {
  if (!isDatabaseReady()) return;
  await query(`
    create table if not exists app_fast_connection_daily (
      user_key text primary key,
      used_today integer not null default 0,
      daily_limit integer not null default ${FAST_CONNECTION_DAILY_SIGNALS},
      reset_at timestamptz not null,
      updated_at timestamptz not null default now()
    )
  `);
}

function fastConnectionEligibilitySql() {
  return `(
    coalesce((p.profile->>'fastConnectionInterested')::boolean, false) = true
    OR (au.fast_connection_pass_until IS NOT NULL AND au.fast_connection_pass_until > now())
  )`;
}

function mapFastConnectionProfile(row) {
  if (!row) return null;
  const profile = row.profile || {};
  const photos = publicPhotosFromProfile(profile);
  const pass = resolveFastConnectionPassStatus({
    fast_connection_pass_until: row.fast_connection_pass_until
  });
  const premium = resolveSignalPassStatus({
    premium_until: row.premium_until,
    is_premium: row.is_premium
  });

  return {
    id: row.id,
    name: row.name || profile.name || "Member",
    age: profile.age || 25,
    gender: profile.gender,
    lookingFor: profile.lookingFor,
    city: row.city,
    state: row.state,
    bio: profile.bio || "",
    photo: getApprovedMainPhoto(profile),
    photos,
    intents: profile.intents || [],
    interests: profile.interests || [],
    religion: profile.religion,
    ethnicity: profile.ethnicity,
    stateOfOrigin: profile.stateOfOrigin,
    occupation: profile.occupation,
    genotype: profile.genotype,
    genotypes: profile.genotypes,
    kidsPreference: profile.kidsPreference,
    lifestyle: profile.lifestyle,
    lifestyles: profile.lifestyles,
    bodyTypes: profile.bodyTypes,
    voiceIntroUrl: profile.voiceIntroUrl,
    verified: Boolean(profile.verified),
    premium: premium.isPremium || Boolean(profile.premium),
    fastConnectionActive: pass.active,
    fastConnectionInterested: profile.fastConnectionInterested === true,
    safetySettings: profile.safetySettings,
    createdAt: profile.createdAt || row.created_at,
    lastActiveAt: row.updated_at || row.created_at
  };
}

async function assertSenderPassActive({ email, phone }) {
  const user = await findAppUserIdentity({ email, phone });
  const pass = resolveFastConnectionPassStatus(user);
  if (!pass.active) {
    return { ok: false, passActive: false, error: "Fast Connection is not active." };
  }
  return { ok: true, passActive: true, user, passUntil: pass.expiresAt };
}

async function queryFastConnectionProfiles({
  ownUserKey,
  exclude,
  city,
  state,
  locationMode,
  limit
}) {
  const params = [ownUserKey, exclude];
  const where = [
    "p.onboarding_complete = true",
    "p.discoverable = true",
    "p.city_home_hidden = false",
    discoverVisibilitySql("p"),
    "p.user_key <> $1",
    "not (p.id = any($2::uuid[]))",
    fastConnectionEligibilitySql()
  ];

  if (locationMode === "city" && city) {
    params.push(String(city).trim());
    where.push(`lower(p.city) = lower($${params.length})`);
  } else if (locationMode === "state" && state) {
    params.push(String(state).trim());
    where.push(`lower(p.state) = lower($${params.length})`);
  } else {
    return [];
  }

  params.push(Math.min(80, Math.max(1, Number(limit) || 48)));

  const result = await query(
    `select p.*, au.premium_until, au.is_premium, au.fast_connection_pass_until
     from app_member_profiles p
     left join app_users au on au.user_key = p.user_key
     where ${where.join(" and ")}
     order by p.updated_at desc
     limit $${params.length}`,
    params
  );

  return result.rows.map(mapFastConnectionProfile).filter(Boolean);
}

export async function listFastConnectionPool({
  email,
  phone,
  excludeProfileIds = [],
  limit = 48
}) {
  if (!isDatabaseReady()) return { ok: false, error: "Database unavailable.", profiles: [] };

  await ensureMemberTrustSchema();
  await ensureFastConnectionSchema();

  const passCheck = await assertSenderPassActive({ email, phone });
  if (!passCheck.ok) {
    return {
      ok: true,
      passActive: false,
      expired: true,
      profiles: [],
      locationTier: "none"
    };
  }

  const own = await findMemberProfileByUserKey(email, phone);
  if (!own?.id) {
    return { ok: false, passActive: true, error: "Profile not found.", profiles: [], locationTier: "none" };
  }

  const exclude = Array.from(new Set([own.id, ...excludeProfileIds.filter(Boolean)]));
  const city = String(own.city || "").trim();
  const state = String(own.state || "").trim();

  let profiles = [];
  let locationTier = "none";

  if (city) {
    profiles = await queryFastConnectionProfiles({
      ownUserKey: own.user_key,
      exclude,
      city,
      state,
      locationMode: "city",
      limit
    });
    if (profiles.length) locationTier = "city";
  }

  if (!profiles.length && state) {
    profiles = await queryFastConnectionProfiles({
      ownUserKey: own.user_key,
      exclude,
      city,
      state,
      locationMode: "state",
      limit
    });
    if (profiles.length) locationTier = "state";
  }

  return { ok: true, passActive: true, profiles, locationTier };
}

async function resetDailyRow(userKey, dailyLimit = FAST_CONNECTION_DAILY_SIGNALS) {
  const resetAt = new Date(Date.now() + RESET_MS).toISOString();
  const result = await query(
    `insert into app_fast_connection_daily (user_key, used_today, daily_limit, reset_at, updated_at)
     values ($1, 0, $2, $3, now())
     on conflict (user_key)
     do update set used_today = 0, daily_limit = $2, reset_at = $3, updated_at = now()
     returning *`,
    [userKey, dailyLimit, resetAt]
  );
  return result.rows[0];
}

export async function fetchFastConnectionSignalStatus({ email, phone }) {
  if (!isDatabaseReady()) {
    return {
      ok: false,
      passActive: false,
      expired: false,
      expiresAt: null,
      startsAt: null,
      expiryReminder: null,
      usedToday: 0,
      dailyLimit: FAST_CONNECTION_DAILY_SIGNALS,
      remaining: 0,
      resetAt: null,
      freshDailyReset: false
    };
  }

  await ensureFastConnectionSchema();

  const user = await findAppUserIdentity({ email, phone });
  const pass = resolveFastConnectionPassStatus(user);
  const passWindow = passWindowFromUntil(pass.expiresAt);
  const expired = Boolean(pass.expiresAt && !pass.active);

  if (!pass.active) {
    return {
      ok: true,
      passActive: false,
      expired,
      expiresAt: pass.expiresAt,
      startsAt: passWindow.startsAt,
      expiryReminder: null,
      usedToday: 0,
      dailyLimit: FAST_CONNECTION_DAILY_SIGNALS,
      remaining: 0,
      resetAt: null,
      freshDailyReset: false
    };
  }

  const userKey = normalizeUserKey({ email, phone });
  if (!userKey) {
    return {
      ok: false,
      passActive: true,
      expired: false,
      error: "User identity missing.",
      expiresAt: pass.expiresAt,
      startsAt: passWindow.startsAt,
      expiryReminder: computeFastConnectionExpiryReminder(pass.expiresAt),
      usedToday: 0,
      dailyLimit: FAST_CONNECTION_DAILY_SIGNALS,
      remaining: 0,
      resetAt: null,
      freshDailyReset: false
    };
  }

  let row = (
    await query(`select * from app_fast_connection_daily where user_key = $1 limit 1`, [userKey])
  ).rows[0];

  const now = Date.now();
  let freshDailyReset = false;
  if (!row || new Date(row.reset_at).getTime() <= now) {
    row = await resetDailyRow(userKey);
    freshDailyReset = true;
  }

  const usedToday = Math.max(0, Number(row.used_today) || 0);
  const dailyLimit = Math.max(1, Number(row.daily_limit) || FAST_CONNECTION_DAILY_SIGNALS);
  const remaining = Math.max(0, dailyLimit - usedToday);

  return {
    ok: true,
    passActive: true,
    expired: false,
    expiresAt: pass.expiresAt,
    startsAt: passWindow.startsAt,
    expiryReminder: computeFastConnectionExpiryReminder(pass.expiresAt),
    usedToday,
    dailyLimit,
    remaining,
    resetAt: row.reset_at,
    freshDailyReset: freshDailyReset || usedToday === 0
  };
}

export async function resetFastConnectionDailySignals({ email, phone }) {
  if (!isDatabaseReady()) return null;
  await ensureFastConnectionSchema();
  const userKey = normalizeUserKey({ email, phone });
  if (!userKey) return null;
  return resetDailyRow(userKey);
}

async function assertFastConnectionTarget({ sender, targetProfileId }) {
  const target = await query(
    `select p.*, au.fast_connection_pass_until
     from app_member_profiles p
     left join app_users au on au.user_key = p.user_key
     where p.id = $1
     limit 1`,
    [targetProfileId]
  );
  const row = target.rows[0];
  if (!row || row.id === sender.id) {
    return { ok: false, error: "Profile not available." };
  }
  if (row.shadow_banned || row.profile_paused_at || String(row.account_status || "active") !== "active") {
    return { ok: false, error: "Profile not available." };
  }
  if (!row.discoverable || row.city_home_hidden || !row.onboarding_complete) {
    return { ok: false, error: "Profile not available." };
  }

  const profile = row.profile || {};
  const pass = resolveFastConnectionPassStatus({
    fast_connection_pass_until: row.fast_connection_pass_until
  });
  const interested = profile.fastConnectionInterested === true;
  if (!interested && !pass.active) {
    return { ok: false, error: "Profile is not in the Fast Connection pool." };
  }

  const senderCity = String(sender.city || "").trim().toLowerCase();
  const senderState = String(sender.state || "").trim().toLowerCase();
  const targetCity = String(row.city || "").trim().toLowerCase();
  const targetState = String(row.state || "").trim().toLowerCase();
  const sameCity = senderCity && targetCity && senderCity === targetCity;
  const sameState = senderState && targetState && senderState === targetState;
  if (!sameCity && !sameState) {
    return { ok: false, error: "Profile is outside your Fast Connection area." };
  }

  return { ok: true, row };
}

export async function sendFastConnectionSignal({ email, phone, targetProfileId }) {
  if (!isDatabaseReady() || !targetProfileId) {
    return { ok: false, error: "Could not send Fast Signal." };
  }

  await ensureFastConnectionSchema();
  await ensureMemberTrustSchema();

  const passCheck = await assertSenderPassActive({ email, phone });
  if (!passCheck.ok) {
    return { ok: false, passActive: false, error: passCheck.error };
  }

  const sender = await findMemberProfileByUserKey(email, phone);
  if (!sender?.id || sender.id === targetProfileId) {
    return { ok: false, error: "Could not send Fast Signal." };
  }
  if (sender.shadow_banned) {
    return { ok: false, error: "Could not send Fast Signal." };
  }
  if (sender.profile_paused_at) {
    return { ok: false, error: "Unpause your profile to send Fast Signals." };
  }

  const targetCheck = await assertFastConnectionTarget({ sender, targetProfileId });
  if (!targetCheck.ok) {
    return targetCheck;
  }

  const userKey = normalizeUserKey({ email, phone });
  let daily = (
    await query(`select * from app_fast_connection_daily where user_key = $1 limit 1`, [userKey])
  ).rows[0];

  const now = Date.now();
  if (!daily || new Date(daily.reset_at).getTime() <= now) {
    daily = await resetDailyRow(userKey);
  }

  const dailyLimit = Math.max(1, Number(daily.daily_limit) || FAST_CONNECTION_DAILY_SIGNALS);
  const usedToday = Math.max(0, Number(daily.used_today) || 0);
  if (usedToday >= dailyLimit) {
    return {
      ok: false,
      limitReached: true,
      error: "You've used today's Fast Signals.",
      usedToday,
      dailyLimit,
      remaining: 0,
      resetAt: daily.reset_at
    };
  }

  const { assertSignalCooldown } = await import("./signalCooldown.js");
  const cooldown = await assertSignalCooldown({ email, phone });
  if (!cooldown.ok) return cooldown;

  const duplicate = await query(
    `select id from app_signals
     where user_key = $1 and target_profile_id = $2 and status = 'pending'
     limit 1`,
    [sender.user_key, targetProfileId]
  );
  if (duplicate.rows[0]) {
    return { ok: true, signal: duplicate.rows[0], duplicate: true };
  }

  const signalResult = await query(
    `insert into app_signals (user_key, sender_email, sender_phone, target_profile_id, signal_type, payload, status)
     values ($1, $2, $3, $4, 'fast_connection', '{}'::jsonb, 'pending')
     returning *`,
    [
      sender.user_key,
      String(email || "").trim().toLowerCase() || null,
      String(phone || "").replace(/\D/g, "").replace(/^234/, "") || null,
      targetProfileId
    ]
  );

  const updatedDaily = await query(
    `update app_fast_connection_daily
     set used_today = used_today + 1, updated_at = now()
     where user_key = $1
     returning *`,
    [userKey]
  );

  const nextDaily = updatedDaily.rows[0] || daily;
  const nextUsed = Math.max(0, Number(nextDaily.used_today) || usedToday + 1);
  const remaining = Math.max(0, dailyLimit - nextUsed);

  return {
    ok: true,
    signal: signalResult.rows[0] || null,
    usedToday: nextUsed,
    dailyLimit,
    remaining,
    resetAt: nextDaily.reset_at
  };
}

export async function listFastConnectionPurchaseHistory({ email, phone, limit = 12 }) {
  if (!isDatabaseReady()) return { ok: false, purchases: [] };

  const { ensurePaymentFulfillmentsSchema } = await import("./paymentFulfillments.js");
  await ensurePaymentFulfillmentsSchema();

  const userKey = normalizeUserKey({ email, phone });
  const user = await findAppUserIdentity({ email, phone });
  const currentPass = resolveFastConnectionPassStatus(user);
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  const result = await query(
    `select paystack_reference, product_type, product_id, amount_kobo, currency, status,
            fulfilled_at, created_at, raw_payload
     from payment_fulfillments
     where status = 'fulfilled'
       and lower(product_type) in ('quickie', 'fast_connection')
       and (
         ($1::text is not null and user_id = $1::text)
         or ($2::text <> '' and lower(raw_payload->>'email') = $2::text)
       )
     order by coalesce(fulfilled_at, created_at) desc
     limit $3`,
    [userKey || null, normalizedEmail || "", Math.min(24, Math.max(1, Number(limit) || 12))]
  );

  const currentExpiresMs = currentPass.expiresAt ? new Date(currentPass.expiresAt).getTime() : 0;

  const purchases = result.rows.map((row) => {
    const payload = row.raw_payload && typeof row.raw_payload === "object" ? row.raw_payload : {};
    const nested = payload.transaction?.metadata || payload.metadata || payload;
    const passDays = Math.max(1, Math.round(Number(nested.quickie_days || nested.duration_days || PASS_DAYS_DEFAULT)));
    const activatedAt = row.fulfilled_at || row.created_at;
    const explicitUntil = nested.pass_until || nested.fast_connection_pass_until || nested.quickiePassUntil;
    const expiresAt =
      explicitUntil ||
      (activatedAt
        ? new Date(new Date(activatedAt).getTime() + passDays * 86400000).toISOString()
        : null);
    const expiresMs = expiresAt ? new Date(expiresAt).getTime() : 0;
    const isCurrent =
      currentPass.active &&
      currentExpiresMs &&
      expiresMs &&
      Math.abs(expiresMs - currentExpiresMs) < 120000;
    const statusLabel = isCurrent && expiresMs > Date.now() ? "Active" : "Expired";

    return {
      id: row.paystack_reference,
      productLabel: "Fast Connection",
      activatedAt,
      expiresAt,
      status: statusLabel,
      amountKobo: row.amount_kobo,
      currency: row.currency || "NGN"
    };
  });

  return { ok: true, purchases, currentPassActive: currentPass.active, currentExpiresAt: currentPass.expiresAt };
}
