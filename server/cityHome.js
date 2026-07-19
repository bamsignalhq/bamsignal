import { getApprovedMainPhoto } from "../shared/photoReview.mjs";
import {
  isDatabaseReady,
  normalizeUserKey,
  query
} from "./db.js";
import { assertSchemaTable } from "./services/schemaVerification.js";
import { publicPhotosFromProfile } from "./services/photoReview.js";
import { passiveListingVisibilitySql } from "./services/memberVisibilityPolicy.js";
import {
  CAPABILITY,
  canFromSnapshot,
  entitlementsFromMemberRow
} from "./services/membershipEntitlements.js";

/** Lower rank = shown first on city home */
export const PLACEMENT_RANK = {
  spotlight: -1,
  featured: 0,
  hot: 1,
  boost: 2,
  admin: 3,
  auto: 4
};

export const CITY_HOME_PLACEMENT_TYPES = ["spotlight", "featured", "hot", "boost", "admin", "auto"];

export async function ensureMemberProfilesTable() {
  return assertSchemaTable("app_member_profiles");
}

export async function ensureCityHomePlacementsTable() {
  return assertSchemaTable("city_home_placements");
}

export async function ensureCitySpotlightEventsTable() {
  return assertSchemaTable("city_spotlight_events");
}

export async function ensureCityHomeTables() {
  if (!isDatabaseReady()) return;
  await assertSchemaTable("app_member_profiles");
  await assertSchemaTable("city_home_placements");
  await assertSchemaTable("city_spotlight_events");
}

function profilePayload(row) {
  const profile = row.profile || {};
  const photos = publicPhotosFromProfile(profile);
  const bio = String(profile.bio || "");
  const interests = Array.isArray(profile.interests) ? profile.interests : [];
  const intents = Array.isArray(profile.intents) ? profile.intents : [];
  return {
    id: row.id,
    profileId: row.id,
    name: row.name || profile.name || "Member",
    city: row.city,
    state: row.state,
    photo: getApprovedMainPhoto(profile),
    photos,
    bio,
    age: profile.age,
    gender: profile.gender,
    lookingFor: profile.lookingFor,
    intents,
    interests,
    voiceIntroUrl: profile.voiceIntroUrl,
    verified: Boolean(profile.verified),
    premium: Boolean(profile.premium),
    placementType: row.placement_type,
    sortOrder: row.sort_order,
    expiresAt: row.expires_at,
    lastActiveAt: row.updated_at,
    profileStrength: Math.min(
      100,
      (photos.length > 0 ? 25 : 0) +
        (bio.length > 20 ? 20 : bio.length > 0 ? 10 : 0) +
        (interests.length > 0 ? 15 : 0) +
        (intents.length > 0 ? 15 : 0) +
        (profile.verified ? 15 : 0) +
        (profile.voiceIntroUrl ? 10 : 0)
    )
  };
}

export async function findEmailByUsername(username) {
  const { resolveLoginAccount } = await import("./services/loginResolve.js");
  const account = await resolveLoginAccount(username);
  return account.email || null;
}

export async function findEmailByPhone(phone) {
  if (!isDatabaseReady()) return null;
  const { phoneDigitKeys } = await import("./services/signupIdentity.js");
  const keys = phoneDigitKeys(phone);
  if (!keys.length) return null;
  await ensureMemberProfilesTable();

  for (const key of keys) {
    const member = await query(
      `select email
       from app_member_profiles
       where phone = $1
         and email is not null
       limit 1`,
      [key]
    );
    const email = member.rows[0]?.email;
    if (email) return String(email).trim().toLowerCase();
  }

  for (const key of keys) {
    const user = await query(
      `select email
       from app_users
       where phone = $1
         and email is not null
       limit 1`,
      [key]
    );
    const email = user.rows[0]?.email;
    if (email) return String(email).trim().toLowerCase();
  }

  return null;
}

export async function upsertMemberProfile({
  email,
  phone,
  name,
  username,
  city,
  state,
  profile = {},
  discoverable = true,
  onboardingComplete = false,
  cityHomeHidden = false
}) {
  if (!isDatabaseReady()) return null;
  await ensureCityHomeTables();

  const userKey = normalizeUserKey({ email, phone });
  if (!userKey || !city) return null;

  const normalizedUsername = username
    ? String(username).trim().toLowerCase().replace(/[^a-z0-9_]/g, "")
    : null;
  let normalizedPhone = String(phone || "").replace(/\D/g, "");
  if (normalizedPhone.startsWith("234") && normalizedPhone.length === 13) {
    normalizedPhone = `0${normalizedPhone.slice(3)}`;
  } else if (normalizedPhone.length === 10 && /^[789]/.test(normalizedPhone)) {
    normalizedPhone = `0${normalizedPhone}`;
  }
  const storedPhone = normalizedPhone || null;

  const result = await query(
    `insert into app_member_profiles (
       user_key, email, phone, name, username, city, state, profile,
       discoverable, city_home_hidden, onboarding_complete, updated_at
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())
     on conflict (user_key)
     do update set
       email = coalesce(excluded.email, app_member_profiles.email),
       phone = coalesce(excluded.phone, app_member_profiles.phone),
       name = coalesce(excluded.name, app_member_profiles.name),
       username = coalesce(excluded.username, app_member_profiles.username),
       city = excluded.city,
       state = excluded.state,
       profile = excluded.profile,
       discoverable = excluded.discoverable,
       city_home_hidden = excluded.city_home_hidden,
       onboarding_complete = excluded.onboarding_complete,
       updated_at = now()
     returning *`,
    [
      userKey,
      email || null,
      storedPhone,
      name || null,
      normalizedUsername,
      city,
      state || null,
      profile,
      discoverable,
      cityHomeHidden,
      onboardingComplete
    ]
  );

  const row = result.rows[0];
  if (!row) return null;

  if (onboardingComplete && discoverable && !cityHomeHidden) {
    await ensureAutoCityPlacement(row);
  }

  return row;
}

export async function ensureAutoCityPlacement(memberRow) {
  if (!memberRow?.id || !memberRow.city) return null;
  await ensureCityHomePlacementsTable();

  const updated = await query(
    `update city_home_placements
     set city = $2, active = true, updated_at = now()
     where profile_id = $1 and placement_type = 'auto'
     returning *`,
    [memberRow.id, memberRow.city]
  );
  if (updated.rows[0]) return updated.rows[0];

  const result = await query(
    `insert into city_home_placements (city, profile_id, placement_type, sort_order, created_by, active)
     values ($1, $2, 'auto', 100, 'system', true)
     returning *`,
    [memberRow.city, memberRow.id]
  );
  return result.rows[0] || null;
}

export async function listCityHomeProfiles(city, limit = 6) {
  if (!isDatabaseReady() || !city) return [];
  await ensureCityHomeTables();

  const result = await query(
    `with ranked as (
       select p.*, pl.placement_type, pl.sort_order, pl.expires_at,
         row_number() over (
           partition by p.id
           order by
             case pl.placement_type
               when 'spotlight' then -1
               when 'featured' then 0
               when 'hot' then 1
               when 'boost' then 2
               when 'admin' then 3
               when 'auto' then 4
               else 5
             end,
             pl.sort_order asc,
             pl.updated_at desc
         ) as rn
       from city_home_placements pl
       join app_member_profiles p on p.id = pl.profile_id
       where lower(pl.city) = lower($1)
         and pl.active = true
         and p.discoverable = true
         and p.city_home_hidden = false
         and p.onboarding_complete = true
         and ${passiveListingVisibilitySql("p")}
         and (pl.expires_at is null or pl.expires_at > now())
     )
     select * from ranked where rn = 1
     order by
       case placement_type
         when 'spotlight' then -1
         when 'featured' then 0
         when 'hot' then 1
         when 'boost' then 2
         when 'admin' then 3
         when 'auto' then 4
         else 5
       end,
       sort_order asc,
       updated_at desc
     limit $2`,
    [city.trim(), limit]
  );

  return result.rows.map(profilePayload);
}

/** Paid + ranked featured members per city for the public spotlight carousel */
export async function listCitySpotlightProfiles(city, limit = 8) {
  if (!isDatabaseReady() || !city) return [];
  await ensureCityHomeTables();
  const cap = Math.min(12, Math.max(1, limit));

  const result = await query(
    `with candidates as (
       select p.*, pl.placement_type, pl.sort_order, pl.expires_at, pl.updated_at as placement_updated,
         (
           case pl.placement_type
             when 'spotlight' then 120
             when 'featured' then 90
             when 'hot' then 70
             when 'boost' then 55
             when 'admin' then 40
             else 15
           end
           + case when coalesce((p.profile->>'verified')::boolean, false) then 35 else 0 end
           + case when coalesce((p.profile->>'premium')::boolean, false) then 25 else 0 end
           + least(20, coalesce(jsonb_array_length(p.profile->'photos'), 0) * 5)
           + case when length(coalesce(p.profile->>'bio', '')) > 30 then 12 else 0 end
           + case when p.updated_at > now() - interval '3 days' then 18
                  when p.updated_at > now() - interval '7 days' then 10
                  else 0 end
         ) as spotlight_score,
         row_number() over (
           partition by p.id
           order by
             case pl.placement_type
               when 'spotlight' then -1
               when 'featured' then 0
               when 'hot' then 1
               when 'boost' then 2
               when 'admin' then 3
               when 'auto' then 4
               else 5
             end,
             pl.sort_order asc,
             pl.updated_at desc
         ) as rn
       from city_home_placements pl
       join app_member_profiles p on p.id = pl.profile_id
       where lower(pl.city) = lower($1)
         and pl.active = true
         and p.discoverable = true
         and p.city_home_hidden = false
         and p.onboarding_complete = true
         and ${passiveListingVisibilitySql("p")}
         and (pl.expires_at is null or pl.expires_at > now())
     )
     select * from candidates
     where rn = 1
     order by spotlight_score desc, placement_updated desc
     limit $2`,
    [city.trim(), cap]
  );

  return result.rows.map(profilePayload);
}

export async function recordCitySpotlightEvent({
  eventType,
  city,
  profileId = null,
  viewerKey = null,
  meta = {}
}) {
  if (!isDatabaseReady() || !eventType || !city) return null;
  await ensureCitySpotlightEventsTable();
  const result = await query(
    `insert into city_spotlight_events (event_type, city, profile_id, viewer_key, meta)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [eventType, city.trim(), profileId, viewerKey, meta]
  );
  return result.rows[0] || null;
}

export async function getCitySpotlightAnalytics({ days = 30 } = {}) {
  if (!isDatabaseReady()) return null;
  await ensureCityHomeTables();
  const windowDays = Math.min(90, Math.max(1, Math.round(days)));

  const purchases = await query(
    `select count(*)::int as count
     from city_home_placements
     where placement_type = 'spotlight'
       and created_at > now() - ($1 || ' days')::interval`,
    [windowDays]
  );

  const events = await query(
    `select event_type, count(*)::int as count
     from city_spotlight_events
     where created_at > now() - ($1 || ' days')::interval
     group by event_type`,
    [windowDays]
  );

  const byCity = await query(
    `select city, count(*)::int as views
     from city_spotlight_events
     where event_type = 'view'
       and created_at > now() - ($1 || ' days')::interval
     group by city
     order by views desc
     limit 12`,
    [windowDays]
  );

  const eventMap = Object.fromEntries(events.rows.map((r) => [r.event_type, r.count]));

  return {
    windowDays,
    purchases: purchases.rows[0]?.count || 0,
    views: eventMap.view || 0,
    clicks: eventMap.click || 0,
    profileOpens: eventMap.profile_open || 0,
    signals: eventMap.signal || 0,
    byCity: byCity.rows
  };
}

export async function activateCitySpotlightPlacement({
  email,
  phone,
  city,
  durationHours = 24,
  paystackReference
}) {
  if (!isDatabaseReady()) return null;
  await ensureCityHomeTables();
  const userKey = normalizeUserKey({ email, phone });
  if (!userKey) return null;

  const member = await query(
    "select * from app_member_profiles where user_key = $1 limit 1",
    [userKey]
  );
  const row = member.rows[0];
  if (!row) return null;
  const ents = entitlementsFromMemberRow(row);
  if (!canFromSnapshot(ents, CAPABILITY.PURCHASE_SPOTLIGHT)) return null;

  const targetCity = String(row.city || city || "").trim();
  if (!targetCity) return null;
  const expiresAt = new Date(Date.now() + durationHours * 3600000).toISOString();

  if (paystackReference) {
    const dup = await query(
      "select * from city_home_placements where paystack_reference = $1 limit 1",
      [paystackReference]
    );
    if (dup.rows[0]) return dup.rows[0];
  }

  const result = await query(
    `insert into city_home_placements (
       city, profile_id, placement_type, sort_order, expires_at, paystack_reference, created_by, active
     )
     values ($1, $2, 'spotlight', 0, $3, $4, 'city_spotlight', true)
     on conflict (paystack_reference)
       where paystack_reference is not null and paystack_reference <> ''
       do nothing
     returning *`,
    [targetCity, row.id, expiresAt, paystackReference || null]
  );

  const placement = result.rows[0] || null;
  if (!placement && paystackReference) {
    const existing = await query(
      "select * from city_home_placements where paystack_reference = $1 limit 1",
      [paystackReference]
    );
    return existing.rows[0] || null;
  }
  if (placement) {
    await query(
      `update city_home_placements
       set active = false, updated_at = now()
       where profile_id = $1
         and placement_type = 'spotlight'
         and active = true
         and id <> $2`,
      [row.id, placement.id]
    );
    await recordCitySpotlightEvent({
      eventType: "purchase",
      city: targetCity,
      profileId: row.id,
      meta: { paystackReference: paystackReference || null, durationHours }
    });
  }
  return placement;
}

export async function listMemberProfilesByCity(city, limit = 50) {
  if (!isDatabaseReady() || !city) return [];
  await ensureMemberProfilesTable();

  const result = await query(
    `select *
     from app_member_profiles
     where lower(city) = lower($1)
       and onboarding_complete = true
     order by updated_at desc
     limit $2`,
    [city.trim(), limit]
  );
  return result.rows;
}

export async function listAdminCityPlacements(city) {
  if (!isDatabaseReady() || !city) return [];
  await ensureCityHomeTables();

  const result = await query(
    `select pl.*, p.name, p.email, p.phone, p.city as profile_city, p.profile
     from city_home_placements pl
     join app_member_profiles p on p.id = pl.profile_id
     where lower(pl.city) = lower($1)
     order by pl.active desc, pl.updated_at desc`,
    [city.trim()]
  );
  return result.rows;
}

export async function upsertAdminCityPlacement({
  city,
  profileId,
  placementType,
  sortOrder = 0,
  active = true,
  expiresAt = null,
  createdBy = "admin"
}) {
  if (!isDatabaseReady() || !city || !profileId) return null;
  if (!CITY_HOME_PLACEMENT_TYPES.includes(placementType)) return null;
  await ensureCityHomeTables();

  const deactivated = await query(
    `update city_home_placements
     set active = false, updated_at = now()
     where profile_id = $1 and city = $2 and placement_type = $3 and active = true`,
    [profileId, city, placementType]
  );

  if (!active) return { deactivated: deactivated.rowCount };

  const result = await query(
    `insert into city_home_placements (
       city, profile_id, placement_type, sort_order, expires_at, created_by, active, updated_at
     )
     values ($1, $2, $3, $4, $5, $6, true, now())
     returning *`,
    [city, profileId, placementType, sortOrder, expiresAt, createdBy]
  );
  return result.rows[0] || null;
}

export async function setCityHomeHidden(profileId, hidden = true) {
  if (!isDatabaseReady() || !profileId) return null;
  await ensureMemberProfilesTable();

  await query(
    `update app_member_profiles
     set city_home_hidden = $2, updated_at = now()
     where id = $1`,
    [profileId, hidden]
  );

  if (hidden) {
    await query(
      `update city_home_placements
       set active = false, updated_at = now()
       where profile_id = $1 and placement_type = 'auto'`,
      [profileId]
    );
  }

  return { ok: true, hidden };
}

export async function activateCityBoostPlacement({
  email,
  phone,
  city,
  durationHours = 48,
  paystackReference
}) {
  if (!isDatabaseReady()) return null;
  await ensureCityHomeTables();
  const userKey = normalizeUserKey({ email, phone });
  if (!userKey) return null;

  const member = await query(
    "select * from app_member_profiles where user_key = $1 limit 1",
    [userKey]
  );
  const row = member.rows[0];
  if (!row) return null;
  const ents = entitlementsFromMemberRow(row);
  if (!canFromSnapshot(ents, CAPABILITY.PURCHASE_CITY_BOOST)) return null;

  const targetCity = String(row.city || city || "").trim();
  if (!targetCity) return null;
  const expiresAt = new Date(Date.now() + durationHours * 3600000).toISOString();

  if (paystackReference) {
    const dup = await query(
      "select * from city_home_placements where paystack_reference = $1 limit 1",
      [paystackReference]
    );
    if (dup.rows[0]) return dup.rows[0];
  }

  const result = await query(
    `insert into city_home_placements (
       city, profile_id, placement_type, sort_order, expires_at, paystack_reference, created_by, active
     )
     values ($1, $2, 'boost', 10, $3, $4, 'city_boost', true)
     on conflict (paystack_reference)
       where paystack_reference is not null and paystack_reference <> ''
       do nothing
     returning *`,
    [targetCity, row.id, expiresAt, paystackReference || null]
  );
  const placement = result.rows[0] || null;
  if (!placement && paystackReference) {
    const existing = await query(
      "select * from city_home_placements where paystack_reference = $1 limit 1",
      [paystackReference]
    );
    return existing.rows[0] || null;
  }
  if (placement) {
    await query(
      `update city_home_placements
       set active = false, updated_at = now()
       where profile_id = $1
         and placement_type = 'boost'
         and active = true
         and id <> $2`,
      [row.id, placement.id]
    );
  }
  return placement;
}

export async function findMemberProfileByUserKey(email, phone) {
  if (!isDatabaseReady()) return null;
  const userKey = normalizeUserKey({ email, phone });
  if (!userKey) return null;
  await ensureMemberProfilesTable();
  const result = await query("select * from app_member_profiles where user_key = $1 limit 1", [
    userKey
  ]);
  return result.rows[0] || null;
}
