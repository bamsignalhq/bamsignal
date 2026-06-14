import {
  isDatabaseReady,
  normalizeUserKey,
  query
} from "./db.js";

/** Lower rank = shown first on city home */
export const PLACEMENT_RANK = {
  featured: 0,
  hot: 1,
  boost: 2,
  admin: 3,
  auto: 4
};

export const CITY_HOME_PLACEMENT_TYPES = ["featured", "hot", "boost", "admin", "auto"];

export async function ensureMemberProfilesTable() {
  await query(`
    create table if not exists app_member_profiles (
      id uuid primary key default gen_random_uuid(),
      user_key text unique not null,
      email text,
      phone text,
      name text,
      username text,
      city text not null,
      state text,
      profile jsonb not null default '{}'::jsonb,
      discoverable boolean not null default true,
      city_home_hidden boolean not null default false,
      onboarding_complete boolean not null default false,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await query(
    "create index if not exists app_member_profiles_city_idx on app_member_profiles (city, onboarding_complete, discoverable)"
  );
}

export async function ensureCityHomePlacementsTable() {
  await query(`
    create table if not exists city_home_placements (
      id uuid primary key default gen_random_uuid(),
      city text not null,
      profile_id uuid not null references app_member_profiles(id) on delete cascade,
      placement_type text not null default 'auto',
      sort_order integer not null default 0,
      starts_at timestamptz not null default now(),
      expires_at timestamptz,
      paystack_reference text,
      created_by text,
      active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await query(
    "create index if not exists city_home_placements_city_idx on city_home_placements (city, active, placement_type)"
  );
  await query(
    "create unique index if not exists city_home_placements_profile_type_idx on city_home_placements (profile_id, placement_type) where active = true and placement_type = 'auto'"
  );
}

export async function ensureCityHomeTables() {
  if (!isDatabaseReady()) return;
  await ensureMemberProfilesTable();
  await ensureCityHomePlacementsTable();
}

function profilePayload(row) {
  const profile = row.profile || {};
  const photos = Array.isArray(profile.photos) ? profile.photos : [];
  return {
    id: row.id,
    profileId: row.id,
    name: row.name || profile.name || "Member",
    city: row.city,
    state: row.state,
    photo: photos[0] || "",
    bio: profile.bio || "",
    age: profile.age,
    verified: Boolean(profile.verified),
    placementType: row.placement_type,
    sortOrder: row.sort_order,
    expiresAt: row.expires_at
  };
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
      phone || null,
      name || null,
      username || null,
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
         and (pl.expires_at is null or pl.expires_at > now())
     )
     select * from ranked where rn = 1
     order by
       case placement_type
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
  const userKey = normalizeUserKey({ email, phone });
  if (!userKey) return null;

  const member = await query(
    "select * from app_member_profiles where user_key = $1 limit 1",
    [userKey]
  );
  const row = member.rows[0];
  if (!row) return null;

  const targetCity = city || row.city;
  const expiresAt = new Date(Date.now() + durationHours * 3600000).toISOString();

  if (paystackReference) {
    const dup = await query(
      "select * from city_home_placements where paystack_reference = $1 limit 1",
      [paystackReference]
    );
    if (dup.rows[0]) return dup.rows[0];
  }

  await query(
    `update city_home_placements
     set active = false, updated_at = now()
     where profile_id = $1 and placement_type = 'boost' and active = true`,
    [row.id]
  );

  const result = await query(
    `insert into city_home_placements (
       city, profile_id, placement_type, sort_order, expires_at, paystack_reference, created_by, active
     )
     values ($1, $2, 'boost', 10, $3, $4, 'city_boost', true)
     returning *`,
    [targetCity, row.id, expiresAt, paystackReference || null]
  );
  return result.rows[0] || null;
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
