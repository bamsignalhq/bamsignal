import { findAppUserIdentity, isDatabaseReady, normalizeUserKey, query } from "./db.js";
import { ensureMemberProfilesTable, findMemberProfileByUserKey } from "./cityHome.js";
import { assertSchemaReady } from "./services/schemaVerification.js";
import {
  computeDiscoverableFlag,
  discoverVisibilitySql as policyDiscoverVisibilitySql,
  isDiscreetPrivacyActive
} from "./services/memberVisibilityPolicy.js";
import { syncMemberDiscoverableFromPolicy } from "./services/discreetMembership.js";

const USERNAME_CHANGE_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
const DELETE_GRACE_DAYS = 30;

export async function ensureMemberTrustSchema() {
  if (!isDatabaseReady()) return;
  await ensureMemberProfilesTable();
  await assertSchemaReady();
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

  const { scanTextForContactLeak, CONTACT_LEAK_BLOCK_MESSAGE } = await import("./utils/contactGuard.js");
  if (scanTextForContactLeak(normalized).blocked) {
    return { ok: false, available: false, error: CONTACT_LEAK_BLOCK_MESSAGE };
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
  if (isDiscreetPrivacyActive(row)) return false;
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
  if (result.rows[0]) {
    const { writePlatformAudit } = await import("./services/auditTrail.js");
    await writePlatformAudit({
      action: "profile_pause",
      targetUserId: member.id,
      targetUserKey: member.user_key,
      details: { reason: String(reason || "").trim() || null }
    });
  }
  return { ok: Boolean(result.rows[0]), profile: result.rows[0] };
}

export async function unpauseMemberProfile({ email, phone }) {
  if (!isDatabaseReady()) return { ok: false };
  await ensureMemberTrustSchema();
  const member = await findMemberProfileByUserKey(email, phone);
  if (!member?.id) return { ok: false, error: "Profile not found." };

  const profile = member.profile || {};
  const hideFromDiscovery = Boolean(profile.safetySettings?.hideFromDiscovery);
  const discoverable = computeDiscoverableFlag({
    hideFromDiscovery,
    paused: false,
    accountStatus: member.account_status || "active",
    privacyMode: member.privacy_mode || "discover",
    discreetUntil: member.discreet_until || null,
    clientDiscoverable: true
  });

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
  if (result.rows[0]) {
    const { writePlatformAudit } = await import("./services/auditTrail.js");
    await writePlatformAudit({
      action: "profile_unpause",
      targetUserId: member.id,
      targetUserKey: member.user_key,
      details: {}
    });
  }
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
  if (result.rows[0]) {
    const { writeAuditLog } = await import("./services/auditLog.js");
    await writeAuditLog({
      userId: member.id,
      action: "account_deletion_scheduled",
      details: { scheduledFor: scheduledFor.toISOString() }
    });
    const { recordAccountDeletionRetention } = await import("./services/auth/observability.js");
    await recordAccountDeletionRetention(result.rows[0], scheduledFor.toISOString());
  }
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
  const discoverable = computeDiscoverableFlag({
    hideFromDiscovery,
    paused,
    accountStatus: "active",
    privacyMode: member.privacy_mode || "discover",
    discreetUntil: member.discreet_until || null,
    clientDiscoverable: true
  });

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
  if (result.rows[0]) {
    const { writeAuditLog } = await import("./services/auditLog.js");
    await writeAuditLog({
      userId: member.id,
      action: "account_restored",
      details: {}
    });
    const { recordAccountRestored } = await import("./services/auth/observability.js");
    await recordAccountRestored(result.rows[0]);
  }
  return { ok: Boolean(result.rows[0]), profile: result.rows[0] };
}

export async function processExpiredAccountDeletions() {
  if (!isDatabaseReady()) return { processed: 0 };
  await ensureMemberTrustSchema();

  const result = await query(
    `update app_member_profiles
     set account_status = 'deleted',
         discoverable = false,
         updated_at = now()
     where account_status = 'deleted_pending'
       and account_delete_scheduled_for is not null
       and account_delete_scheduled_for <= now()
     returning id`
  );

  const { recordPermanentDeletion } = await import("./services/auth/observability.js");
  for (const row of result.rows) {
    await recordPermanentDeletion(row.id);
  }

  return { processed: result.rows.length };
}

export async function fetchMemberAccountState({ email, phone }) {
  if (!isDatabaseReady()) return null;
  await ensureMemberTrustSchema();
  let member = await findMemberProfileByUserKey(email, phone);
  if (!member) return null;
  const { expireDiscreetMembershipIfNeeded, resolveDiscreetStatus } = await import(
    "./services/discreetMembership.js"
  );
  member = (await expireDiscreetMembershipIfNeeded(member)) || member;
  const discreet = resolveDiscreetStatus(member);
  return {
    accountStatus: member.account_status || "active",
    accountDeletedAt: member.account_deleted_at || null,
    accountDeleteScheduledFor: member.account_delete_scheduled_for || null,
    profilePausedAt: member.profile_paused_at || null,
    profilePauseReason: member.profile_pause_reason || null,
    usernameLastChangedAt: member.username_last_changed_at || null,
    usernameChangeCount: Number(member.username_change_count || 0),
    discoverable: memberDiscoverable(member),
    privacyMode: discreet.privacyMode,
    discreetActive: discreet.active,
    discreetUntil: discreet.discreetUntil
  };
}

export async function upsertConnectionNote({ email, phone, targetProfileId, note }) {
  if (!isDatabaseReady()) return { ok: false };
  await ensureMemberTrustSchema();
  const owner = await findMemberProfileByUserKey(email, phone);
  if (!owner?.id || !targetProfileId) return { ok: false, error: "Invalid note target." };

  const { assertTextSafeForContactLeak, CONTACT_LEAK_BLOCK_MESSAGE } = await import(
    "./services/contactLeak.js"
  );
  const trimmed = String(note || "").trim().slice(0, 500);
  const leakCheck = await assertTextSafeForContactLeak({
    email,
    phone,
    text: trimmed,
    field: "connection_note"
  });
  if (!leakCheck.ok) {
    return { ok: false, error: CONTACT_LEAK_BLOCK_MESSAGE };
  }

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

  const { assertTextSafeForContactLeak, CONTACT_LEAK_BLOCK_MESSAGE } = await import(
    "./services/contactLeak.js"
  );
  const introNote = String(note || "").trim().slice(0, 280);
  if (introNote) {
    const leakCheck = await assertTextSafeForContactLeak({
      email,
      phone,
      text: introNote,
      field: "introduction"
    });
    if (!leakCheck.ok) {
      return { ok: false, error: CONTACT_LEAK_BLOCK_MESSAGE };
    }
  }

  const result = await query(
    `insert into member_introductions (introducer_profile_id, target_profile_id, recipient_profile_id, note)
     values ($1, $2, $3, $4)
     returning *`,
    [
      introducer.id,
      targetProfileId,
      recipientProfileId,
      introNote || null
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

  const { assertTextSafeForContactLeak, CONTACT_LEAK_BLOCK_MESSAGE } = await import(
    "./services/contactLeak.js"
  );
  const leakCheck = await assertTextSafeForContactLeak({
    email,
    phone,
    text: trimmed,
    field: "success_story"
  });
  if (!leakCheck.ok) {
    return { ok: false, error: CONTACT_LEAK_BLOCK_MESSAGE };
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
  return policyDiscoverVisibilitySql(alias);
}

export { syncMemberDiscoverableFromPolicy };
