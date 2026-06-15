import crypto from "node:crypto";
import { isDatabaseReady, query, upsertAppUserIdentity } from "./db.js";
import { upsertMemberProfile } from "./cityHome.js";

export const PLAY_REVIEWER = {
  email: "reviewer@bamsignal.com",
  username: "playreview",
  name: "Play Reviewer",
  phone: "08099998888",
  city: "Lagos",
  state: "Lagos"
};

export const PLAY_REVIEWER_PROFILE = {
  photos: ["/showcase/hero-lagos-young-professionals-01.webp"],
  age: 29,
  gender: "Woman",
  state: "Lagos",
  city: "Lagos",
  bio: "Google Play review account for BamSignal. Exploring profiles, matches, and safety tools in Lagos.",
  lookingFor: "Everyone",
  intents: ["Relationship"],
  interests: ["Music", "Food", "Travel", "Movies"],
  verified: false,
  premium: false,
  onboardingComplete: true,
  createdAt: new Date().toISOString(),
  reportCount: 0,
  visibility: { showReligion: false, showEthnicity: false, showState: true },
  matchingPrivacy: {
    useReligionForMatching: true,
    useEthnicityForMatching: true,
    useStateForMatching: true
  },
  safetySettings: {
    shareLocationOnDates: false,
    emergencyContactName: "",
    emergencyContactPhone: "",
    blockUnknownMedia: true,
    hideLastSeen: false
  }
};

function normalizePhone(value = "") {
  return String(value).replace(/\D/g, "").replace(/^234/, "");
}

async function resetReviewerAuthUser(email) {
  const existing = await query(
    "select id from auth.users where lower(email) = lower($1) limit 1",
    [email]
  );
  const userId = existing.rows[0]?.id;
  if (!userId) return;

  const cleanup = [
    "delete from auth.refresh_tokens where user_id = $1::uuid",
    "delete from auth.sessions where user_id = $1::uuid",
    "delete from auth.mfa_factors where user_id = $1::uuid",
    "delete from auth.one_time_tokens where user_id = $1::uuid",
    "delete from auth.identities where user_id = $1::uuid",
    "delete from auth.users where id = $1::uuid"
  ];

  for (const statement of cleanup) {
    await query(statement, [userId]).catch(() => null);
  }
}

async function ensureAuthUserViaSql({ email, password, name, username, phone, reset = false }) {
  const meta = JSON.stringify({ name, username, phone });

  if (reset) {
    await resetReviewerAuthUser(email);
  }

  async function ensureIdentity(userId) {
    const providerId = String(userId);
    const existingIdentity = await query(
      `select id from auth.identities where user_id = $1::uuid and provider = 'email' limit 1`,
      [userId]
    );
    if (existingIdentity.rows[0]?.id) return;

    await query(
      `insert into auth.identities (
         id,
         user_id,
         identity_data,
         provider,
         provider_id,
         last_sign_in_at,
         created_at,
         updated_at
       )
       values (
         gen_random_uuid(),
         $1::uuid,
         jsonb_build_object('sub', $2::text, 'email', $3::text),
         'email',
         $2::text,
         now(),
         now(),
         now()
       )`,
      [userId, providerId, email]
    );
  }

  const existing = await query(
    "select id from auth.users where lower(email) = lower($1) limit 1",
    [email]
  );

  if (existing.rows[0]?.id) {
    const userId = existing.rows[0].id;
    await query(
      `update auth.users
       set encrypted_password = crypt($2::text, gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           raw_user_meta_data = $3::jsonb,
           updated_at = now()
       where id = $1::uuid`,
      [userId, password, meta]
    );
    await ensureIdentity(userId);
    return { id: userId, created: false };
  }

  const inserted = await query(
    `insert into auth.users (
       instance_id,
       id,
       aud,
       role,
       email,
       encrypted_password,
       email_confirmed_at,
       recovery_sent_at,
       last_sign_in_at,
       raw_app_meta_data,
       raw_user_meta_data,
       is_super_admin,
       is_sso_user,
       is_anonymous,
       created_at,
       updated_at,
       confirmation_token,
       email_change,
       email_change_token_new,
       recovery_token
     )
     values (
       '00000000-0000-0000-0000-000000000000',
       gen_random_uuid(),
       'authenticated',
       'authenticated',
       $1::text,
       crypt($2::text, gen_salt('bf')),
       now(),
       now(),
       now(),
       '{"provider":"email","providers":["email"]}'::jsonb,
       $3::jsonb,
       false,
       false,
       false,
       now(),
       now(),
       '',
       '',
       '',
       ''
     )
     returning id`,
    [email, password, meta]
  );

  const userId = inserted.rows[0]?.id;
  if (!userId) throw new Error("Failed to insert auth.users row.");

  await ensureIdentity(userId);
  return { id: userId, created: true };
}

async function ensureNotPlatformAdmin(email) {
  await query(
    `update platform_admins
     set active = false, updated_at = now()
     where lower(email) = lower($1) and active = true`,
    [email]
  ).catch(() => null);
}

/** Idempotent Play reviewer member + auth provisioning (uses Postgres auth schema). */
export async function provisionPlayReviewerAccount(pin) {
  if (!isDatabaseReady()) {
    throw new Error("DATABASE_URL is not connected.");
  }
  if (!/^\d{6}$/.test(String(pin))) {
    throw new Error("PIN must be exactly 6 digits.");
  }

  const { email, username, name, phone, city, state } = PLAY_REVIEWER;
  const authUser = await ensureAuthUserViaSql({
    email,
    password: String(pin),
    name,
    username,
    phone,
    reset: true
  });

  await upsertAppUserIdentity({
    email,
    phone: normalizePhone(phone),
    name
  });

  await ensureNotPlatformAdmin(email);

  const memberRow = await upsertMemberProfile({
    email,
    phone: normalizePhone(phone),
    name,
    username,
    city,
    state,
    profile: PLAY_REVIEWER_PROFILE,
    discoverable: true,
    onboardingComplete: true,
    cityHomeHidden: false
  });

  if (!memberRow?.id) {
    throw new Error("Member profile upsert failed.");
  }

  return { authUser, memberProfileId: memberRow.id, username, email };
}

export function generateStrongPlayReviewerPin() {
  for (let attempt = 0; attempt < 500; attempt++) {
    const pin = String(crypto.randomInt(100000, 1000000));
    if (/^(\d)\1{5}$/.test(pin)) continue;
    if (/(\d)\1{2}/.test(pin)) continue;
    let bad = false;
    for (let i = 0; i <= pin.length - 3; i++) {
      const a = Number(pin[i]);
      const b = Number(pin[i + 1]);
      const c = Number(pin[i + 2]);
      if (b === a + 1 && c === b + 1) bad = true;
      if (b === a - 1 && c === b - 1) bad = true;
    }
    if (!bad) return pin;
  }
  throw new Error("Could not generate a strong PIN.");
}
