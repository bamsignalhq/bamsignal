import { findAppUserIdentity, isDatabaseReady, normalizeUserKey, query } from "./db.js";
import { ensureMemberProfilesTable, findMemberProfileByUserKey } from "./cityHome.js";

const USERNAME_CHANGE_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
const DELETE_GRACE_DAYS = 30;

export async function ensureMemberTrustSchema() {
  if (!isDatabaseReady()) return;
  await ensureMemberProfilesTable();

  await query(
    "alter table app_member_profiles add column if not exists username_last_changed_at timestamptz"
  );
  await query(
    "alter table app_member_profiles add column if not exists username_change_count integer not null default 0"
  );
  await query(
    "alter table app_member_profiles add column if not exists account_status text not null default 'active'"
  );
  await query("alter table app_member_profiles add column if not exists account_deleted_at timestamptz");
  await query(
    "alter table app_member_profiles add column if not exists account_delete_scheduled_for timestamptz"
  );
  await query("alter table app_member_profiles add column if not exists profile_paused_at timestamptz");
  await query("alter table app_member_profiles add column if not exists profile_pause_reason text");

  await query(`
    create table if not exists connection_notes (
      id uuid primary key default gen_random_uuid(),
      owner_profile_id uuid not null,
      target_profile_id uuid not null,
      note text not null default '',
      updated_at timestamptz not null default now(),
      unique (owner_profile_id, target_profile_id)
    )
  `);

  await query(`
    create table if not exists moderation_flags (
      id uuid primary key default gen_random_uuid(),
      user_key text not null,
      profile_id uuid,
      reason text not null,
      severity text not null default 'medium',
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now(),
      resolved_at timestamptz,
      resolved_by text
    )
  `);
  await query(
    "create index if not exists moderation_flags_open_idx on moderation_flags (resolved_at, created_at desc)"
  );

  await query(`
    create table if not exists success_stories (
      id uuid primary key default gen_random_uuid(),
      user_key text not null,
      profile_id uuid,
      story text not null,
      anonymous boolean not null default true,
      approved boolean not null default false,
      created_at timestamptz not null default now()
    )
  `);

  await query(`
    create table if not exists member_introductions (
      id uuid primary key default gen_random_uuid(),
      introducer_profile_id uuid not null,
      target_profile_id uuid not null,
      recipient_profile_id uuid not null,
      note text,
      status text not null default 'pending',
      created_at timestamptz not null default now()
    )
  `);
}

export function normalizeMemberUsername(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function isValidMemberUsername(value = "") {
  const u = normalizeMemberUsername(value);
  return u.length >= 4 && u.length <= 20 && /^[a-z0-9_]+$/.test(u);
}

export async function checkUsernameAvailable(username, excludeProfileId = null) {
  if (!isDatabaseReady()) return { ok: true, available: true };
  await ensureMemberTrustSchema();
  const normalized = normalizeMemberUsername(username);
  if (!isValidMemberUsername(normalized)) {
    return { ok: false, available: false, error: "Username must be 4–20 characters (letters, numbers, underscore)." };
  }

  const result = await query(
    `select id from app_member_profiles
     where lower(username) = lower($1)
       and ($2::uuid is null or id <> $2::uuid)
     limit 1`,
    [normalized, excludeProfileId]
  );
  if (result.rows[0]) {
    return { ok: true, available: false, error: "This username is already taken." };
  }
  return { ok: true, available: true, username: normalized };
}

export async function changeMemberUsername({ email, phone, username }) {
  if (!isDatabaseReady()) return { ok: false, error: "Database unavailable." };
  await ensureMemberTrustSchema();

  const member = await findMemberProfileByUserKey(email, phone);
  if (!member?.id) return { ok: false, error: "Profile not found." };

  const normalized = normalizeMemberUsername(username);
  const availability = await checkUsernameAvailable(normalized, member.id);
  if (!availability.available) {
    return { ok: false, error: availability.error || "This username is already taken." };
  }

  const lastChanged = member.username_last_changed_at
    ? new Date(member.username_last_changed_at).getTime()
    : 0;
  const currentUsername = normalizeMemberUsername(member.username || "");
  if (currentUsername && normalized !== currentUsername && lastChanged) {
    const elapsed = Date.now() - lastChanged;
    if (elapsed < USERNAME_CHANGE_COOLDOWN_MS) {
      return { ok: false, error: "You can change your username again after 30 days." };
    }
  }

  const result = await query(
    `update app_member_profiles
     set username = $2,
         username_last_changed_at = case when coalesce(username, '') <> $2 then now() else username_last_changed_at end,
         username_change_count = case when coalesce(username, '') <> $2 then username_change_count + 1 else username_change_count end,
         updated_at = now()
     where id = $1
     returning *`,
    [member.id, normalized]
  );
  return { ok: Boolean(result.rows[0]), profile: result.rows[0], username: normalized };
}

function memberDiscoverable(row) {
  if (!row) return false;
  const status = String(row.account_status || "active");
  if (status === "deleted_pending" || status === "deleted") return false;
  if (row.profile_paused_at) return false;
  return Boolean(row.discoverable);
}

export async function pauseMemberProfile({ email, phone, reason = "" }) {
  if (!isDatabaseReady()) return { ok: false };
  await ensureMemberTrustSchema();
  const member = await findMemberProfileByUserKey(email, phone);
  if (!member?.id) return { ok: false, error: "Profile not found." };

  const result = await query(
    `update app_member_profiles
     set profile_paused_at = now(),
         profile_pause_reason = $2,
         discoverable = false,
         updated_at = now()
     where id = $1
     returning *`,
    [member.id, String(reason || "").trim() || null]
  );
  return { ok: Boolean(result.rows[0]), profile: result.rows[0] };
}

export async function unpauseMemberProfile({ email, phone }) {
  if (!isDatabaseReady()) return { ok: false };
  await ensureMemberTrustSchema();
  const member = await findMemberProfileByUserKey(email, phone);
  if (!member?.id) return { ok: false, error: "Profile not found." };

  const profile = member.profile || {};
  const hideFromDiscovery = Boolean(profile.safetySettings?.hideFromDiscovery);
  const discoverable = !hideFromDiscovery && String(member.account_status || "active") === "active";

  const result = await query(
    `update app_member_profiles
     set profile_paused_at = null,
         profile_pause_reason = null,
         discoverable = $2,
         updated_at = now()
     where id = $1
     returning *`,
    [member.id, discoverable]
  );
  return { ok: Boolean(result.rows[0]), profile: result.rows[0] };
}

export async function softDeleteMemberAccount({ email, phone }) {
  if (!isDatabaseReady()) return { ok: false };
  await ensureMemberTrustSchema();
  const member = await findMemberProfileByUserKey(email, phone);
  if (!member?.id) return { ok: false, error: "Profile not found." };

  const scheduledFor = new Date(Date.now() + DELETE_GRACE_DAYS * 24 * 60 * 60 * 1000);

  const result = await query(
    `update app_member_profiles
     set account_status = 'deleted_pending',
         account_deleted_at = now(),
         account_delete_scheduled_for = $2,
         discoverable = false,
         profile_paused_at = coalesce(profile_paused_at, now()),
         updated_at = now()
     where id = $1
     returning *`,
    [member.id, scheduledFor.toISOString()]
  );
  return {
    ok: Boolean(result.rows[0]),
    profile: result.rows[0],
    scheduledFor: scheduledFor.toISOString()
  };
}

export async function restoreMemberAccount({ email, phone }) {
  if (!isDatabaseReady()) return { ok: false };
  await ensureMemberTrustSchema();
  const member = await findMemberProfileByUserKey(email, phone);
  if (!member?.id) return { ok: false, error: "Profile not found." };

  const status = String(member.account_status || "active");
  if (status !== "deleted_pending") {
    return { ok: false, error: "No pending deletion to restore." };
  }

  const profile = member.profile || {};
  const hideFromDiscovery = Boolean(profile.safetySettings?.hideFromDiscovery);
  const paused = Boolean(member.profile_paused_at);
  const discoverable = !hideFromDiscovery && !paused;

  const result = await query(
    `update app_member_profiles
     set account_status = 'active',
         account_deleted_at = null,
         account_delete_scheduled_for = null,
         discoverable = $2,
         updated_at = now()
     where id = $1
     returning *`,
    [member.id, discoverable]
  );
  return { ok: Boolean(result.rows[0]), profile: result.rows[0] };
}

export async function fetchMemberAccountState({ email, phone }) {
  if (!isDatabaseReady()) return null;
  await ensureMemberTrustSchema();
  const member = await findMemberProfileByUserKey(email, phone);
  if (!member) return null;
  return {
    accountStatus: member.account_status || "active",
    accountDeletedAt: member.account_deleted_at || null,
    accountDeleteScheduledFor: member.account_delete_scheduled_for || null,
    profilePausedAt: member.profile_paused_at || null,
    profilePauseReason: member.profile_pause_reason || null,
    usernameLastChangedAt: member.username_last_changed_at || null,
    usernameChangeCount: Number(member.username_change_count || 0),
    discoverable: memberDiscoverable(member)
  };
}

export async function upsertConnectionNote({ email, phone, targetProfileId, note }) {
  if (!isDatabaseReady()) return { ok: false };
  await ensureMemberTrustSchema();
  const owner = await findMemberProfileByUserKey(email, phone);
  if (!owner?.id || !targetProfileId) return { ok: false, error: "Invalid note target." };

  const trimmed = String(note || "").trim().slice(0, 500);
  const result = await query(
    `insert into connection_notes (owner_profile_id, target_profile_id, note, updated_at)
     values ($1, $2, $3, now())
     on conflict (owner_profile_id, target_profile_id)
     do update set note = excluded.note, updated_at = now()
     returning *`,
    [owner.id, targetProfileId, trimmed]
  );
  return { ok: Boolean(result.rows[0]), note: result.rows[0] };
}

export async function fetchConnectionNote({ email, phone, targetProfileId }) {
  if (!isDatabaseReady()) return null;
  await ensureMemberTrustSchema();
  const owner = await findMemberProfileByUserKey(email, phone);
  if (!owner?.id || !targetProfileId) return null;

  const result = await query(
    `select note, updated_at from connection_notes
     where owner_profile_id = $1 and target_profile_id = $2
     limit 1`,
    [owner.id, targetProfileId]
  );
  return result.rows[0] || null;
}

export async function sendMemberIntroduction({
  email,
  phone,
  targetProfileId,
  recipientProfileId,
  note = ""
}) {
  if (!isDatabaseReady()) return { ok: false };
  await ensureMemberTrustSchema();
  const introducer = await findMemberProfileByUserKey(email, phone);
  if (!introducer?.id) return { ok: false, error: "Profile not found." };
  if (!targetProfileId || !recipientProfileId) {
    return { ok: false, error: "Introduction targets required." };
  }
  if (targetProfileId === recipientProfileId) {
    return { ok: false, error: "Choose a different connection." };
  }

  const result = await query(
    `insert into member_introductions (introducer_profile_id, target_profile_id, recipient_profile_id, note)
     values ($1, $2, $3, $4)
     returning *`,
    [
      introducer.id,
      targetProfileId,
      recipientProfileId,
      String(note || "").trim().slice(0, 280) || null
    ]
  );
  return { ok: Boolean(result.rows[0]), introduction: result.rows[0] };
}

export async function submitSuccessStory({ email, phone, story, anonymous = true }) {
  if (!isDatabaseReady()) return { ok: false };
  await ensureMemberTrustSchema();
  const userKey = normalizeUserKey({ email, phone });
  const member = await findMemberProfileByUserKey(email, phone);
  const trimmed = String(story || "").trim();
  if (!userKey || trimmed.length < 20) {
    return { ok: false, error: "Please share a little more detail." };
  }

  const result = await query(
    `insert into success_stories (user_key, profile_id, story, anonymous)
     values ($1, $2, $3, $4)
     returning *`,
    [userKey, member?.id || null, trimmed.slice(0, 2000), Boolean(anonymous)]
  );
  return { ok: Boolean(result.rows[0]), story: result.rows[0] };
}

export async function createModerationFlag({
  userKey,
  profileId,
  reason,
  severity = "medium",
  metadata = {}
}) {
  if (!isDatabaseReady() || !userKey || !reason) return null;
  await ensureMemberTrustSchema();

  const recent = await query(
    `select id from moderation_flags
     where user_key = $1 and reason = $2 and resolved_at is null
       and created_at > now() - interval '1 hour'
     limit 1`,
    [userKey, reason]
  );
  if (recent.rows[0]) return recent.rows[0];

  const result = await query(
    `insert into moderation_flags (user_key, profile_id, reason, severity, metadata)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [userKey, profileId || null, reason, severity, metadata]
  );
  return result.rows[0] || null;
}

export async function listModerationFlags({ limit = 50, unresolvedOnly = true } = {}) {
  if (!isDatabaseReady()) return [];
  await ensureMemberTrustSchema();

  const where = unresolvedOnly ? "where resolved_at is null" : "";
  const result = await query(
    `select f.*, p.name, p.username, p.email
     from moderation_flags f
     left join app_member_profiles p on p.id = f.profile_id
     ${where}
     order by f.created_at desc
     limit $1`,
    [Math.min(200, Math.max(1, limit))]
  );
  return result.rows;
}

export function discoverVisibilitySql(alias = "") {
  const p = alias ? `${alias}.` : "";
  return `coalesce(${p}account_status, 'active') = 'active'
    and ${p}profile_paused_at is null
    and coalesce(${p}shadow_banned, false) = false`;
}
