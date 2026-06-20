import { getApprovedMainPhoto } from "../shared/photoReview.mjs";
import {
  normalizeRelationshipIntentions
} from "../shared/memberIntents.mjs";
import {
  normalizeSearchBodyTypes,
  normalizeSearchGenotypes,
  normalizeSearchOccupations,
  normalizeSearchStatesOfOrigin,
  normalizeSearchTribes
} from "../shared/memberOptionalPreferences.mjs";
import {
  resolveFastConnectionPassStatus,
  resolveSignalPassStatus,
  shouldClearStalePremiumFlag
} from "../shared/memberEntitlements.mjs";
import {
  findAppUserIdentity,
  isDatabaseReady,
  normalizeUserKey,
  persistMatch,
  query,
  upsertAppUserIdentity
} from "./db.js";
import { discoverVisibilitySql, ensureMemberTrustSchema } from "./memberTrust.js";
import { publicPhotosFromProfile } from "./services/photoReview.js";

export async function ensureSocialSchema() {
  if (!isDatabaseReady()) return;

  const { ensureModerationSchema } = await import("./services/moderation.js");
  await ensureModerationSchema();

  await query("alter table app_signals add column if not exists status text not null default 'pending'");
  await query(
    "create index if not exists app_signals_target_status_idx on app_signals (target_profile_id, status, created_at desc)"
  );
  await query("alter table app_users add column if not exists referred_by_user_key text");
  await query("alter table app_users add column if not exists onboarding_completed_at timestamptz");

  await query(`
    create table if not exists app_referral_events (
      id uuid primary key default gen_random_uuid(),
      referrer_user_key text not null,
      referred_user_key text not null,
      referral_code text not null,
      reward_days integer not null default 0,
      created_at timestamptz not null default now(),
      unique (referred_user_key)
    )
  `);
  await query(`
    create table if not exists app_profile_likes (
      id uuid primary key default gen_random_uuid(),
      actor_profile_id uuid not null,
      target_profile_id uuid not null,
      photo_index integer not null default 0,
      created_at timestamptz not null default now(),
      unique (actor_profile_id, target_profile_id)
    )
  `);
  await query(`
    create table if not exists app_profile_follows (
      id uuid primary key default gen_random_uuid(),
      actor_profile_id uuid not null,
      target_profile_id uuid not null,
      created_at timestamptz not null default now(),
      unique (actor_profile_id, target_profile_id)
    )
  `);
}

function generateReferralCode(name = "") {
  const base = String(name || "BAM")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base || "BAM"}${suffix}`;
}

export async function ensureUserReferralCode({ email, phone }) {
  if (!isDatabaseReady()) return null;
  await ensureSocialSchema();

  const user = await findAppUserIdentity({ email, phone });
  if (!user) return null;
  if (user.referral_code) return user.referral_code;

  const code = generateReferralCode(user.name);
  const result = await query(
    `update app_users
     set referral_code = $3, updated_at = now()
     where ($1::text is not null and lower(email) = lower($1::text))
        or ($2::text is not null and phone = $2::text)
     returning referral_code`,
    [email || null, phone || null, code]
  );
  return result.rows[0]?.referral_code || code;
}

export function rowToDiscoverProfile(row) {
  if (!row) return null;
  const profile = row.profile || {};
  const photos = publicPhotosFromProfile(profile);
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
    premium: Boolean(profile.premium),
    safetySettings: profile.safetySettings,
    createdAt: profile.createdAt || row.created_at,
    lastActiveAt: row.updated_at || row.created_at
  };
}

export async function listDiscoverProfiles({
  email,
  phone,
  city,
  excludeProfileIds = [],
  limit = 48
}) {
  if (!isDatabaseReady() || !city) return [];
  await ensureSocialSchema();
  await ensureMemberTrustSchema();

  const own = await findMemberProfileByUserKey(email, phone);
  if (!own?.id) return [];

  const exclude = Array.from(new Set([own.id, ...excludeProfileIds.filter(Boolean)]));

  const result = await query(
    `select *
     from app_member_profiles
     where lower(city) = lower($1)
       and onboarding_complete = true
       and discoverable = true
       and city_home_hidden = false
       and ${discoverVisibilitySql()}
       and user_key <> $2
       and not (id = any($3::uuid[]))
     order by updated_at desc
     limit $4`,
    [city.trim(), own.user_key, exclude, limit]
  );

  return result.rows.map(rowToDiscoverProfile).filter(Boolean);
}

export async function searchMemberProfiles({
  email,
  phone,
  state = "",
  city = "",
  cities = [],
  ageMin = 18,
  ageMax = 99,
  excludeProfileIds = [],
  limit = 24,
  tribes = [],
  religions = [],
  occupations = [],
  statesOfOrigin = [],
  relationshipIntentions = [],
  genotypes = [],
  kidsPreferences = [],
  bodyTypes = []
}) {
  if (!isDatabaseReady()) return [];
  await ensureSocialSchema();
  relationshipIntentions = normalizeRelationshipIntentions(relationshipIntentions);
  tribes = normalizeSearchTribes(tribes);
  occupations = normalizeSearchOccupations(occupations);
  statesOfOrigin = normalizeSearchStatesOfOrigin(statesOfOrigin);
  genotypes = normalizeSearchGenotypes(genotypes);
  bodyTypes = normalizeSearchBodyTypes(bodyTypes);

  const own = await findMemberProfileByUserKey(email, phone);
  if (!own?.id) return [];

  const exclude = Array.from(new Set([own.id, ...excludeProfileIds.filter(Boolean)]));
  const minAge = Math.max(18, Math.min(99, Math.round(Number(ageMin) || 18)));
  const maxAge = Math.max(minAge, Math.min(99, Math.round(Number(ageMax) || 99)));
  const stateQ = String(state || "").trim();
  const cityQ = String(city || "").trim();
  const cityList = Array.isArray(cities)
    ? [...new Set(cities.map((c) => String(c || "").trim()).filter(Boolean))]
    : [];

  if (!cityQ && !stateQ && cityList.length === 0) return [];

  const params = [own.user_key, exclude, minAge, maxAge];
  const where = [
    "onboarding_complete = true",
    "discoverable = true",
    "city_home_hidden = false",
    discoverVisibilitySql(),
    "user_key <> $1",
    "not (id = any($2::uuid[]))",
    "coalesce((profile->>'age')::int, 25) >= $3",
    "coalesce((profile->>'age')::int, 25) <= $4"
  ];

  if (cityList.length > 0) {
    params.push(cityList.map((c) => c.toLowerCase()));
    where.push(`lower(city) = any($${params.length}::text[])`);
    if (stateQ) {
      params.push(stateQ);
      where.push(`lower(state) = lower($${params.length})`);
    }
  } else if (cityQ) {
    params.push(cityQ);
    where.push(`lower(city) = lower($${params.length})`);
    if (stateQ) {
      params.push(stateQ);
      where.push(`lower(state) = lower($${params.length})`);
    }
  } else if (stateQ) {
    params.push(stateQ);
    where.push(`lower(state) = lower($${params.length})`);
  }

  const addJsonInFilter = (jsonKey, values) => {
    const list = Array.isArray(values) ? values.filter(Boolean) : [];
    if (!list.length) return;
    params.push(list);
    where.push(`profile->>'${jsonKey}' = any($${params.length}::text[])`);
  };

  const addJsonArrayOverlap = (jsonKey, values) => {
    const list = Array.isArray(values) ? values.filter(Boolean) : [];
    if (!list.length) return;
    params.push(list);
    where.push(`profile->'${jsonKey}' ?| $${params.length}::text[]`);
  };

  addJsonInFilter("ethnicity", tribes);
  addJsonInFilter("religion", religions);
  if (occupations.length) {
    params.push(occupations);
    where.push(
      `(profile->>'occupation' = any($${params.length}::text[]) OR profile->'occupations' ?| $${params.length}::text[])`
    );
  }
  addJsonInFilter("stateOfOrigin", statesOfOrigin);
  addJsonInFilter("genotype", genotypes);
  addJsonInFilter("kidsPreference", kidsPreferences);
  addJsonArrayOverlap("bodyTypes", bodyTypes);

  const intentList = Array.isArray(relationshipIntentions)
    ? relationshipIntentions.filter(Boolean)
    : [];
  if (intentList.length) {
    params.push(intentList);
    where.push(`profile->'intents' ?| $${params.length}::text[]`);
  }

  params.push(Math.min(80, Math.max(1, Number(limit) || 24)));

  const result = await query(
    `select *
     from app_member_profiles
     where ${where.join(" and ")}
     order by updated_at desc
     limit $${params.length}`,
    params
  );

  return result.rows.map(rowToDiscoverProfile).filter(Boolean);
}

export async function getMemberProfileById(profileId) {
  if (!isDatabaseReady() || !profileId) return null;
  const result = await query("select * from app_member_profiles where id = $1 limit 1", [profileId]);
  return rowToDiscoverProfile(result.rows[0]);
}

export async function sendSignalToProfile({
  email,
  phone,
  targetProfileId,
  signalType = "signal",
  payload = {}
}) {
  if (!isDatabaseReady() || !targetProfileId) return null;
  await ensureSocialSchema();

  const { assertSignalCooldown } = await import("./services/signalCooldown.js");
  const cooldown = await assertSignalCooldown({ email, phone });
  if (!cooldown.ok) return cooldown;

  const sender = await findMemberProfileByUserKey(email, phone);
  if (!sender?.id || sender.id === targetProfileId) return null;
  if (sender.shadow_banned) {
    return { id: `suppressed-${Date.now()}`, suppressed: true };
  }
  if (sender.profile_paused_at) {
    return { ok: false, error: "Unpause your profile to send signals." };
  }

  const target = await query(
    `select id, profile_paused_at, shadow_banned from app_member_profiles where id = $1 limit 1`,
    [targetProfileId]
  );
  if (!target.rows[0] || target.rows[0].shadow_banned) return null;

  const duplicate = await query(
    `select id from app_signals
     where user_key = $1 and target_profile_id = $2 and status = 'pending'
     limit 1`,
    [sender.user_key, targetProfileId]
  );
  if (duplicate.rows[0]) return duplicate.rows[0];

  const result = await query(
    `insert into app_signals (user_key, sender_email, sender_phone, target_profile_id, signal_type, payload, status)
     values ($1, $2, $3, $4, $5, $6, 'pending')
     returning *`,
    [
      sender.user_key,
      String(email || "").trim().toLowerCase() || null,
      String(phone || "").replace(/\D/g, "").replace(/^234/, "") || null,
      targetProfileId,
      signalType,
      payload
    ]
  );
  return result.rows[0] || null;
}

function signalToLikeEntry(row, senderProfile) {
  const profile = senderProfile || {};
  const nested = profile.profile || {};
  return {
    id: row.id,
    profileId: profile.id || row.user_key,
    name: profile.name || row.sender_email || "Member",
    photo: getApprovedMainPhoto(nested),
    city: profile.city || "",
    at: row.created_at,
    superLike: row.signal_type === "priority" || row.signal_type === "priority-signal-once"
  };
}

export async function fetchIncomingSignals({ email, phone }) {
  if (!isDatabaseReady()) return [];
  await ensureSocialSchema();

  const own = await findMemberProfileByUserKey(email, phone);
  if (!own?.id) return [];

  const result = await query(
    `select s.*, p.name, p.city, p.profile, p.id as sender_profile_id
     from app_signals s
     join app_member_profiles p on p.user_key = s.user_key
     where s.target_profile_id = $1
       and s.status = 'pending'
       and coalesce(p.shadow_banned, false) = false
     order by s.created_at desc`,
    [own.id]
  );

  return result.rows.map((row) =>
    signalToLikeEntry(row, {
      id: row.sender_profile_id,
      name: row.name,
      city: row.city,
      profile: row.profile
    })
  );
}

function buildMatchId(a, b) {
  return `m-${[a, b].sort().join("-")}`;
}

function buildMatchPayload({ matchId, profileId, name, photo, city, lastActiveAt }) {
  return {
    id: matchId,
    profileId,
    name,
    photo,
    city,
    matchedAt: new Date().toISOString(),
    lastActiveAt
  };
}

export async function acceptIncomingSignal({ email, phone, signalId }) {
  if (!isDatabaseReady() || !signalId) return null;
  await ensureSocialSchema();

  const own = await findMemberProfileByUserKey(email, phone);
  if (!own?.id) return null;

  const signalResult = await query(
    `select s.*, sender.id as sender_profile_id, sender.name as sender_name, sender.city as sender_city,
            sender.profile as sender_profile, sender.email as sender_email, sender.phone as sender_phone,
            sender.updated_at as sender_updated_at
     from app_signals s
     join app_member_profiles sender on sender.user_key = s.user_key
     where s.id = $1 and s.target_profile_id = $2 and s.status = 'pending'
     limit 1`,
    [signalId, own.id]
  );
  const signal = signalResult.rows[0];
  if (!signal) return null;

  await query("update app_signals set status = 'accepted' where id = $1", [signalId]);

  const senderPhotos = Array.isArray(signal.sender_profile?.photos) ? signal.sender_profile.photos : [];
  const ownPhotos = Array.isArray(own.profile?.photos) ? own.profile.photos : [];
  const matchId = buildMatchId(own.id, signal.sender_profile_id);

  const matchForAcceptor = buildMatchPayload({
    matchId,
    profileId: signal.sender_profile_id,
    name: signal.sender_name || "Member",
    photo: senderPhotos[0] || "",
    city: signal.sender_city || "",
    lastActiveAt: signal.sender_updated_at
  });

  const matchForSender = buildMatchPayload({
    matchId,
    profileId: own.id,
    name: own.name || "Member",
    photo: ownPhotos[0] || "",
    city: own.city || "",
    lastActiveAt: own.updated_at
  });

  await persistMatch({ email, phone, match: matchForAcceptor });
  await persistMatch({
    email: signal.sender_email,
    phone: signal.sender_phone,
    match: matchForSender
  });

  return { match: matchForAcceptor, signalId };
}

export async function declineIncomingSignal({ email, phone, signalId }) {
  if (!isDatabaseReady() || !signalId) return false;
  await ensureSocialSchema();

  const own = await findMemberProfileByUserKey(email, phone);
  if (!own?.id) return false;

  const result = await query(
    `update app_signals set status = 'declined'
     where id = $1 and target_profile_id = $2 and status = 'pending'
     returning id`,
    [signalId, own.id]
  );
  return result.rowCount > 0;
}

export async function ignoreIncomingSignal({ email, phone, signalId }) {
  if (!isDatabaseReady() || !signalId) return false;
  await ensureSocialSchema();

  const own = await findMemberProfileByUserKey(email, phone);
  if (!own?.id) return false;

  const result = await query(
    `update app_signals set status = 'ignored'
     where id = $1 and target_profile_id = $2 and status = 'pending'
     returning id`,
    [signalId, own.id]
  );
  return result.rowCount > 0;
}

export async function registerWithReferral({ email, phone, name, referralCode }) {
  if (!isDatabaseReady()) return null;
  await ensureSocialSchema();

  let referredByUserKey = null;
  let referrerCode = "";
  const code = String(referralCode || "")
    .trim()
    .toUpperCase();
  if (code) {
    const referrer = await query(
      "select email, phone, referral_code from app_users where upper(referral_code) = $1 limit 1",
      [code]
    );
    const refRow = referrer.rows[0];
    if (refRow) {
      referredByUserKey = normalizeUserKey({ email: refRow.email, phone: refRow.phone });
      referrerCode = refRow.referral_code || code;
    }
  }

  const existing = await findAppUserIdentity({ email, phone });
  const ownCode = existing?.referral_code || generateReferralCode(name);

  if (existing) {
    const result = await query(
      `update app_users
       set email = coalesce($1, email),
           phone = coalesce($2, phone),
           name = coalesce($3, name),
           referral_code = coalesce(referral_code, $4),
           referred_by_user_key = coalesce(referred_by_user_key, $5),
           user_key = coalesce(user_key, $6),
           updated_at = now()
       where ($1::text is not null and lower(email) = lower($1::text))
          or ($2::text is not null and phone = $2::text)
       returning *`,
      [
        email || null,
        phone || null,
        name || null,
        ownCode,
        referredByUserKey,
        normalizeUserKey({ email, phone })
      ]
    );
    return result.rows[0] || null;
  }

  const user = await upsertAppUserIdentity({
    email,
    phone,
    name,
    referralCode: ownCode
  });
  if (!user) return null;
  if (!referredByUserKey) return user;

  await query(
    `update app_users set referred_by_user_key = $2, updated_at = now() where id = $1`,
    [user.id, referredByUserKey]
  );
  return findAppUserIdentity({ email, phone });
}

const REFERRAL_GOAL = 3;
const REWARD_DAYS = 7;

async function extendUserPremium({ email, phone }, days) {
  const user = await findAppUserIdentity({ email, phone });
  if (!user) return null;

  const base =
    user.premium_until && new Date(user.premium_until).getTime() > Date.now()
      ? new Date(user.premium_until).getTime()
      : Date.now();
  const premiumUntil = new Date(base + days * 86400000).toISOString();

  const result = await query(
    `update app_users
     set is_premium = true, premium_until = $3, updated_at = now()
     where ($1::text is not null and lower(email) = lower($1::text))
        or ($2::text is not null and phone = $2::text)
     returning *`,
    [email || null, phone || null, premiumUntil]
  );
  return result.rows[0] || null;
}

export async function markMemberOnboardingComplete({ email, phone }) {
  if (!isDatabaseReady()) return { ok: false };
  const { findMemberProfileByUserKey, upsertMemberProfile } = await import("./cityHome.js");
  const member = await findMemberProfileByUserKey(email, phone);
  if (!member?.city) return { ok: false, reason: "no_profile" };

  const profileJson = { ...(member.profile || {}) };
  const now = new Date().toISOString();
  profileJson.onboardingCompleted = true;
  profileJson.onboardingComplete = true;
  profileJson.setupCompleted = true;
  profileJson.onboardingCompletedAt = profileJson.onboardingCompletedAt || now;
  profileJson.profileCompletedAt = profileJson.profileCompletedAt || now;
  profileJson.completedAt = profileJson.completedAt || now;

  const hideFromDiscovery = Boolean(profileJson.safetySettings?.hideFromDiscovery);
  await upsertMemberProfile({
    email,
    phone,
    name: member.name,
    username: member.username,
    city: member.city,
    state: member.state,
    profile: profileJson,
    discoverable: !hideFromDiscovery,
    onboardingComplete: true,
    cityHomeHidden: Boolean(member.city_home_hidden)
  });

  await query(
    `update app_users
     set onboarding_completed_at = coalesce(onboarding_completed_at, now()), updated_at = now()
     where ($1::text is not null and lower(email) = lower($1::text))
        or ($2::text is not null and phone = $2::text)`,
    [email || null, phone || null]
  );

  return { ok: true };
}

export async function completeOnboardingReferral({ email, phone }) {
  if (!isDatabaseReady()) return null;
  await ensureSocialSchema();

  const referredUserKey = normalizeUserKey({ email, phone });
  if (!referredUserKey) return { credited: false };

  const user = await findAppUserIdentity({ email, phone });
  if (!user?.referred_by_user_key) return { credited: false };

  const existing = await query(
    "select id from app_referral_events where referred_user_key = $1 limit 1",
    [referredUserKey]
  );
  if (existing.rows[0]) return { credited: false, duplicate: true };

  const referrer = await query(
    "select email, phone, referral_code from app_users where user_key = $1 limit 1",
    [user.referred_by_user_key]
  );
  const referrerRow = referrer.rows[0];
  if (!referrerRow) return { credited: false };

  await query(
    `update app_users set onboarding_completed_at = now(), updated_at = now()
     where ($1::text is not null and lower(email) = lower($1::text))
        or ($2::text is not null and phone = $2::text)`,
    [email || null, phone || null]
  );

  await query(
    `insert into app_referral_events (referrer_user_key, referred_user_key, referral_code)
     values ($1, $2, $3)`,
    [user.referred_by_user_key, referredUserKey, referrerRow.referral_code || ""]
  );

  const countResult = await query(
    "select count(*)::int as count from app_referral_events where referrer_user_key = $1",
    [user.referred_by_user_key]
  );
  const count = countResult.rows[0]?.count ?? 0;
  let rewardGranted = false;

  if (count > 0 && count % REFERRAL_GOAL === 0) {
    await extendUserPremium(referrerRow, REWARD_DAYS);
    await query(
      "update app_referral_events set reward_days = $2 where referred_user_key = $1",
      [referredUserKey, REWARD_DAYS]
    );
    rewardGranted = true;
  }

  return { credited: true, rewardGranted, referrerUserKey: user.referred_by_user_key };
}

export async function fetchReferralStats({ email, phone }) {
  if (!isDatabaseReady()) return null;
  await ensureSocialSchema();

  const user = await findAppUserIdentity({ email, phone });
  if (!user) return null;

  const code = await ensureUserReferralCode({ email, phone });
  const userKey = normalizeUserKey({ email, phone });
  const countResult = await query(
    "select count(*)::int as count from app_referral_events where referrer_user_key = $1",
    [userKey]
  );
  const successfulReferrals = countResult.rows[0]?.count ?? 0;
  const rewardsClaimed = Math.floor(successfulReferrals / REFERRAL_GOAL);

  return {
    code: code || user.referral_code,
    successfulReferrals,
    rewardsClaimed,
    goal: REFERRAL_GOAL,
    rewardDays: REWARD_DAYS
  };
}

export function resolvePremiumStatus(user) {
  return resolveSignalPassStatus(user);
}

async function expireStalePremiumFlags(user) {
  if (!user?.id || !shouldClearStalePremiumFlag(user)) return user;
  const result = await query(
    `update app_users
     set is_premium = false, updated_at = now()
     where id = $1
     returning *`,
    [user.id]
  );
  return result.rows[0] || user;
}

export async function fetchPremiumStatus({ email, phone }) {
  let user = await findAppUserIdentity({ email, phone });
  if (!user) return resolvePremiumStatus(null);
  user = await expireStalePremiumFlags(user);
  return resolvePremiumStatus(user);
}

export async function fetchMemberEntitlements({ email, phone }) {
  let user = await findAppUserIdentity({ email, phone });
  if (!user) {
    return {
      signalPass: resolvePremiumStatus(null),
      fastConnectionPass: resolveFastConnectionPassStatus(null)
    };
  }
  user = await expireStalePremiumFlags(user);
  return {
    signalPass: resolveSignalPassStatus(user),
    fastConnectionPass: resolveFastConnectionPassStatus(user)
  };
}

export async function fetchMemberSocialBundle({ email, phone }) {
  if (!isDatabaseReady()) return null;
  await ensureSocialSchema();

  const [incomingSignals, referral, premium, ownProfile, incomingLikes, incomingFollows] =
    await Promise.all([
      fetchIncomingSignals({ email, phone }),
      fetchReferralStats({ email, phone }),
      fetchPremiumStatus({ email, phone }),
      findMemberProfileByUserKey(email, phone),
      fetchIncomingProfileLikes({ email, phone }),
      fetchIncomingProfileFollows({ email, phone })
    ]);

  const profileJson = ownProfile?.profile || {};
  const { resolveMemberCompliance } = await import("./services/compliance.js");
  const compliance = ownProfile?.id
    ? await resolveMemberCompliance(ownProfile.id, profileJson.compliance)
    : profileJson.compliance && typeof profileJson.compliance === "object"
      ? profileJson.compliance
      : {};
  const photos = Array.isArray(profileJson.photos) ? profileJson.photos : [];
  const markedComplete = Boolean(
    ownProfile?.onboarding_complete ||
      profileJson.onboardingCompleted ||
      profileJson.onboardingComplete ||
      profileJson.setupCompleted ||
      profileJson.profileCompletedAt ||
      profileJson.onboardingCompletedAt ||
      profileJson.completedAt
  );
  const rawCoverUrl =
    typeof profileJson.coverPhotoUrl === "string"
      ? profileJson.coverPhotoUrl
      : typeof profileJson.coverPhoto === "string"
        ? profileJson.coverPhoto
        : undefined;
  const rawCover =
    rawCoverUrl && !rawCoverUrl.startsWith("/showcase/") ? rawCoverUrl : undefined;
  const coverPhotoExplicit = rawCover ? Boolean(profileJson.coverPhotoExplicit) : false;
  const coverPhotoPath =
    typeof profileJson.coverPhotoPath === "string" ? profileJson.coverPhotoPath : undefined;
  const coverPhotoUpdatedAt =
    typeof profileJson.coverPhotoUpdatedAt === "string" ? profileJson.coverPhotoUpdatedAt : undefined;

  return {
    incomingSignals,
    referral,
    premium,
    memberProfileId: ownProfile?.id || null,
    shadowBanned: Boolean(ownProfile?.shadow_banned),
    datingProfile: ownProfile
      ? {
          photos,
          coverPhoto: rawCover,
          coverPhotoUrl: rawCover,
          coverPhotoPath,
          coverPhotoUpdatedAt,
          coverPhotoExplicit,
          photoMeta: profileJson.photoMeta,
          age: profileJson.age || 25,
          dateOfBirth: profileJson.dateOfBirth,
          gender: profileJson.gender,
          state: ownProfile.state,
          city: ownProfile.city,
          bio: profileJson.bio || "",
          lookingFor: profileJson.lookingFor,
          intents: profileJson.intents || [],
          interests: profileJson.interests || [],
          religion: profileJson.religion,
          ethnicity: profileJson.ethnicity,
          stateOfOrigin: profileJson.stateOfOrigin,
          occupation: profileJson.occupation,
          genotype: profileJson.genotype,
          kidsPreference: profileJson.kidsPreference,
          lifestyle: profileJson.lifestyle,
          verified: Boolean(profileJson.verified),
          premium: Boolean(profileJson.premium),
          verificationSelfie: profileJson.verificationSelfie,
          verificationStatus: profileJson.verificationStatus || "none",
          onboardingComplete: markedComplete,
          setupCompleted: Boolean(profileJson.setupCompleted || ownProfile?.onboarding_complete),
          onboardingCompletedAt: profileJson.onboardingCompletedAt,
          profileCompletedAt: profileJson.profileCompletedAt || profileJson.completedAt,
          completedAt: profileJson.completedAt || profileJson.profileCompletedAt,
          mainPhotoUrl: profileJson.mainPhotoUrl,
          createdAt: profileJson.createdAt || ownProfile.created_at,
          compliance
        }
      : null,
    incomingLikes,
    incomingFollows
  };
}

export async function likeMemberProfile({ email, phone, targetProfileId, photoIndex = 0 }) {
  if (!isDatabaseReady() || !targetProfileId) return null;
  await ensureSocialSchema();
  const actor = await findMemberProfileByUserKey(email, phone);
  if (!actor?.id || actor.id === targetProfileId) return null;
  const result = await query(
    `insert into app_profile_likes (actor_profile_id, target_profile_id, photo_index)
     values ($1, $2, $3)
     on conflict (actor_profile_id, target_profile_id) do update set photo_index = excluded.photo_index
     returning *`,
    [actor.id, targetProfileId, photoIndex]
  );
  return result.rows[0] || null;
}

export async function followMemberProfile({ email, phone, targetProfileId }) {
  if (!isDatabaseReady() || !targetProfileId) return null;
  await ensureSocialSchema();
  const actor = await findMemberProfileByUserKey(email, phone);
  if (!actor?.id || actor.id === targetProfileId) return null;
  const result = await query(
    `insert into app_profile_follows (actor_profile_id, target_profile_id)
     values ($1, $2)
     on conflict (actor_profile_id, target_profile_id) do nothing
     returning *`,
    [actor.id, targetProfileId]
  );
  return result.rows[0] || { duplicate: true };
}

async function fetchIncomingProfileLikes({ email, phone }) {
  const own = await findMemberProfileByUserKey(email, phone);
  if (!own?.id) return [];
  const result = await query(
    `select l.*, p.name, p.city, p.profile
     from app_profile_likes l
     join app_member_profiles p on p.id = l.actor_profile_id
     where l.target_profile_id = $1
     order by l.created_at desc
     limit 100`,
    [own.id]
  );
  return result.rows.map((row) => {
    const profile = row.profile || {};
    return {
      profileId: row.actor_profile_id,
      name: row.name || "Member",
      photo: getApprovedMainPhoto(profile),
      at: row.created_at
    };
  });
}

async function fetchIncomingProfileFollows({ email, phone }) {
  const own = await findMemberProfileByUserKey(email, phone);
  if (!own?.id) return [];
  const result = await query(
    `select f.*, p.name, p.city, p.profile
     from app_profile_follows f
     join app_member_profiles p on p.id = f.actor_profile_id
     where f.target_profile_id = $1
     order by f.created_at desc
     limit 100`,
    [own.id]
  );
  return result.rows.map((row) => {
    const profile = row.profile || {};
    return {
      profileId: row.actor_profile_id,
      name: row.name || "Member",
      photo: getApprovedMainPhoto(profile),
      at: row.created_at
    };
  });
}

export async function fetchProfileVisitors({ email, phone }) {
  const incoming = await fetchIncomingSignals({ email, phone });
  return incoming.map((signal) => ({
    profileId: signal.profileId,
    name: signal.name,
    photo: signal.photo,
    age: 25,
    city: signal.city,
    compatibility: 0,
    at: signal.at
  }));
}

export {
  listFastConnectionPool,
  fetchFastConnectionSignalStatus,
  sendFastConnectionSignal,
  resetFastConnectionDailySignals,
  listFastConnectionPurchaseHistory,
  computeFastConnectionExpiryReminder
} from "./services/fastConnection.js";
