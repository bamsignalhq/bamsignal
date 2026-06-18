import { isDatabaseReady, query } from "../db.js";
import { ensureMemberProfilesTable } from "../cityHome.js";

const MODERATION_ROLES = new Set(["admin", "operator", "moderator"]);

export async function ensureModerationSchema() {
  if (!isDatabaseReady()) return;
  await ensureMemberProfilesTable();

  await query(
    "alter table app_member_profiles add column if not exists shadow_banned boolean not null default false"
  );
  await query("alter table app_member_profiles add column if not exists shadow_ban_reason text");
  await query("alter table app_member_profiles add column if not exists shadow_banned_at timestamptz");
  await query("alter table app_member_profiles add column if not exists shadow_banned_by text");
  await query("alter table app_member_profiles add column if not exists shadow_ban_lifted_at timestamptz");
  await query("alter table app_member_profiles add column if not exists shadow_ban_lifted_by text");
  await query("alter table app_member_profiles add column if not exists shadow_ban_lift_reason text");
  await query("alter table app_member_profiles add column if not exists moderation_notes text");

  await query(`
    create table if not exists moderation_audit_log (
      id uuid primary key default gen_random_uuid(),
      action text not null,
      target_profile_id uuid,
      target_user_key text,
      operator_email text not null,
      reason text,
      payload jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now()
    )
  `);
  await query(
    "create index if not exists moderation_audit_target_idx on moderation_audit_log (target_profile_id, created_at desc)"
  );
  await query(
    "create index if not exists moderation_audit_action_idx on moderation_audit_log (action, created_at desc)"
  );
}

function mapShadowBannedRow(row) {
  if (!row) return null;
  const createdAt = row.created_at ? new Date(row.created_at) : null;
  const accountAgeDays = createdAt
    ? Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000)))
    : null;

  return {
    profileId: row.id,
    userKey: row.user_key,
    name: row.name || "Member",
    email: row.email || null,
    phone: row.phone || null,
    username: row.username || null,
    city: row.city || null,
    shadowBanned: Boolean(row.shadow_banned),
    shadowBanReason: row.shadow_ban_reason || null,
    reportCount: Number(row.report_count || 0),
    lastReportAt: row.last_report_at || null,
    accountAgeDays,
    paymentStatus: row.is_premium
      ? row.premium_until && new Date(row.premium_until).getTime() > Date.now()
        ? "premium_active"
        : "premium_lapsed"
      : row.paystack_reference
        ? "paid_history"
        : "none",
    isPremium: Boolean(row.is_premium),
    premiumUntil: row.premium_until || null,
    moderationNotes: row.moderation_notes || null,
    shadowBannedAt: row.shadow_banned_at || null,
    shadowBannedBy: row.shadow_banned_by || null,
    shadowBanLiftedAt: row.shadow_ban_lifted_at || null,
    shadowBanLiftedBy: row.shadow_ban_lifted_by || null,
    shadowBanLiftReason: row.shadow_ban_lift_reason || null,
    createdAt: row.created_at || null
  };
}

export async function isProfileShadowBanned(profileId) {
  if (!isDatabaseReady() || !profileId) return false;
  await ensureModerationSchema();
  const result = await query(
    "select shadow_banned from app_member_profiles where id = $1 limit 1",
    [profileId]
  );
  return Boolean(result.rows[0]?.shadow_banned);
}

export async function isMemberShadowBanned({ email, phone, profileId } = {}) {
  if (!isDatabaseReady()) return false;
  await ensureModerationSchema();

  if (profileId) {
    return isProfileShadowBanned(profileId);
  }

  const result = await query(
    `select shadow_banned
     from app_member_profiles
     where ($1::text is not null and lower(email) = lower($1::text))
        or ($2::text is not null and phone = $2::text)
     limit 1`,
    [email || null, phone || null]
  );
  return Boolean(result.rows[0]?.shadow_banned);
}

async function writeModerationAudit({
  action,
  targetProfileId,
  targetUserKey,
  operatorEmail,
  reason,
  payload = {}
}) {
  await ensureModerationSchema();
  await query(
    `insert into moderation_audit_log (action, target_profile_id, target_user_key, operator_email, reason, payload)
     values ($1, $2, $3, $4, $5, $6)`,
    [
      action,
      targetProfileId || null,
      targetUserKey || null,
      String(operatorEmail || "").toLowerCase(),
      reason || null,
      payload
    ]
  );
  const { writePlatformAudit } = await import("./auditTrail.js");
  await writePlatformAudit({
    action,
    targetUserId: targetProfileId,
    targetUserKey,
    operatorEmail: String(operatorEmail || "").toLowerCase(),
    details: { reason, ...payload }
  });
}

export async function listShadowBannedUsers() {
  if (!isDatabaseReady()) return [];
  await ensureModerationSchema();

  const result = await query(
    `select p.*,
            coalesce(r.report_count, 0)::int as report_count,
            r.last_report_at,
            u.is_premium,
            u.premium_until,
            u.paystack_reference
     from app_member_profiles p
     left join (
       select profile_id,
              count(*)::int as report_count,
              max(created_at) as last_report_at
       from app_reports
       group by profile_id
     ) r on r.profile_id = p.id::text
     left join app_users u on u.user_key = p.user_key
     where p.shadow_banned = true
     order by p.shadow_banned_at desc nulls last, p.updated_at desc`
  );

  return result.rows.map(mapShadowBannedRow).filter(Boolean);
}

export async function listReportQueue({ limit = 200 } = {}) {
  if (!isDatabaseReady()) return [];
  const { ensureAppReportsTable } = await import("../db.js");
  await ensureAppReportsTable();
  await ensureModerationSchema();

  const result = await query(
    `select r.id,
            r.profile_id,
            r.reason,
            r.details,
            r.payload,
            r.created_at,
            r.reporter_email,
            r.reporter_phone,
            p.name as reported_name,
            p.city as reported_city,
            p.shadow_banned,
            count(*) over (partition by r.profile_id) as profile_report_count
     from app_reports r
     left join app_member_profiles p on p.id::text = r.profile_id
     order by r.created_at desc
     limit $1`,
    [Math.min(Math.max(Number(limit) || 200, 1), 500)]
  );

  return result.rows.map((row) => {
    const payload = row.payload && typeof row.payload === "object" ? row.payload : {};
    const reportCount = Number(row.profile_report_count || 1);
    const shadowBanned = Boolean(row.shadow_banned);
    return {
      id: row.id,
      profileId: row.profile_id,
      reportedName: row.reported_name || `Member ${String(row.profile_id || "").slice(0, 8)}`,
      reportedCity: row.reported_city || "—",
      reporterEmail: row.reporter_email || null,
      reporterPhone: row.reporter_phone || null,
      reason: row.reason,
      details: row.details || null,
      note: row.details || null,
      blocked: Boolean(payload.blocked),
      at: row.created_at,
      reportCount,
      shadowBanned,
      status: shadowBanned ? "action_taken" : reportCount >= 3 ? "pending" : "reviewed"
    };
  });
}

export async function countShadowBannedUsers() {
  if (!isDatabaseReady()) return 0;
  await ensureModerationSchema();
  const result = await query(
    "select count(*)::int as count from app_member_profiles where shadow_banned = true"
  );
  return Number(result.rows[0]?.count || 0);
}

export const PHOTO_VIOLATION_SHADOW_BAN_THRESHOLD = 3;

export async function ensurePhotoViolationSchema() {
  if (!isDatabaseReady()) return;
  await ensureModerationSchema();
  await query(
    "alter table app_member_profiles add column if not exists photo_violation_count int not null default 0"
  );
  await query(
    "alter table app_member_profiles add column if not exists last_photo_violation_at timestamptz"
  );
}

export function isUnhealthyPhotoSubmission({ photoReviewStatus, photoRiskFlags = [] } = {}) {
  const status = String(photoReviewStatus || "").trim();
  if (status === "pending_review" || status === "rejected") return true;
  return Array.isArray(photoRiskFlags) && photoRiskFlags.length > 0;
}

export async function recordPhotoViolation({
  profileId,
  userKey,
  photoUrl = null,
  reason,
  source = "system",
  operatorEmail = "system",
  photoRiskFlags = []
}) {
  if (!isDatabaseReady() || !profileId) {
    return { ok: false, count: 0, shadowBanned: false };
  }
  await ensurePhotoViolationSchema();

  const normalizedReason = String(reason || "").trim() || "Unhealthy photo upload";
  const updated = await query(
    `update app_member_profiles
     set photo_violation_count = coalesce(photo_violation_count, 0) + 1,
         last_photo_violation_at = now(),
         updated_at = now()
     where id = $1
     returning id, user_key, photo_violation_count, shadow_banned`,
    [profileId]
  );
  const row = updated.rows[0];
  if (!row) return { ok: false, count: 0, shadowBanned: false };

  const count = Number(row.photo_violation_count || 0);
  const resolvedUserKey = userKey || row.user_key || null;

  const { createModerationFlag } = await import("../memberTrust.js");
  await createModerationFlag({
    userKey: resolvedUserKey,
    profileId,
    reason: "unhealthy_photo_upload",
    severity: count >= PHOTO_VIOLATION_SHADOW_BAN_THRESHOLD ? "high" : "medium",
    metadata: {
      source,
      photoUrl,
      photoRiskFlags,
      violationCount: count,
      detail: normalizedReason
    }
  });

  await writeModerationAudit({
    action: "photo_violation_recorded",
    targetProfileId: profileId,
    targetUserKey: resolvedUserKey,
    operatorEmail,
    reason: normalizedReason,
    payload: { photoUrl, source, photoRiskFlags, violationCount: count }
  });

  let shadowBanned = Boolean(row.shadow_banned);
  if (!shadowBanned && count >= PHOTO_VIOLATION_SHADOW_BAN_THRESHOLD) {
    const ban = await applyShadowBan({
      profileId,
      operatorEmail: "system",
      reason: `Automatic shadow ban after ${count} unhealthy photo uploads.`,
      moderationNotes: `Photo violations: ${count}. Last reason: ${normalizedReason}`
    });
    shadowBanned = Boolean(ban.ok);
  }

  return { ok: true, count, shadowBanned };
}

export async function applyShadowBan({
  profileId,
  operatorEmail,
  reason,
  moderationNotes
}) {
  if (!isDatabaseReady() || !profileId) {
    return { ok: false, error: "Profile is required." };
  }
  await ensureModerationSchema();

  const normalizedReason = String(reason || "").trim() || "Shadow ban applied by operator.";
  const result = await query(
    `update app_member_profiles
     set shadow_banned = true,
         shadow_ban_reason = $2,
         shadow_banned_at = now(),
         shadow_banned_by = $3,
         moderation_notes = coalesce($4, moderation_notes),
         updated_at = now()
     where id = $1
     returning *`,
    [profileId, normalizedReason, String(operatorEmail || "").toLowerCase(), moderationNotes || null]
  );
  const row = result.rows[0];
  if (!row) return { ok: false, error: "Member profile not found." };

  await writeModerationAudit({
    action: "shadow_ban",
    targetProfileId: row.id,
    targetUserKey: row.user_key,
    operatorEmail,
    reason: normalizedReason,
    payload: { shadowBanReason: normalizedReason }
  });

  return { ok: true, profile: mapShadowBannedRow(row) };
}

export async function liftShadowBan({
  profileId,
  operatorEmail,
  reason
}) {
  if (!isDatabaseReady() || !profileId) {
    return { ok: false, error: "Profile is required." };
  }
  await ensureModerationSchema();

  const liftReason = String(reason || "").trim();
  if (!liftReason) {
    return { ok: false, error: "Reason for restoration is required." };
  }

  const existing = await query(
    "select * from app_member_profiles where id = $1 and shadow_banned = true limit 1",
    [profileId]
  );
  const row = existing.rows[0];
  if (!row) {
    return { ok: false, error: "This member is not shadow banned." };
  }

  const updated = await query(
    `update app_member_profiles
     set shadow_banned = false,
         shadow_ban_lifted_at = now(),
         shadow_ban_lifted_by = $2,
         shadow_ban_lift_reason = $3,
         updated_at = now()
     where id = $1
     returning *`,
    [profileId, String(operatorEmail || "").toLowerCase(), liftReason]
  );

  await writeModerationAudit({
    action: "shadow_ban_lifted",
    targetProfileId: row.id,
    targetUserKey: row.user_key,
    operatorEmail,
    reason: liftReason,
    payload: {
      previousShadowBanReason: row.shadow_ban_reason || null,
      shadowBannedAt: row.shadow_banned_at || null,
      shadowBannedBy: row.shadow_banned_by || null
    }
  });

  return { ok: true, profile: mapShadowBannedRow(updated.rows[0]) };
}

export async function maybeAutoShadowBanProfile(profileId) {
  if (!isDatabaseReady() || !profileId) return null;
  await ensureModerationSchema();

  const already = await isProfileShadowBanned(profileId);
  if (already) return null;

  const reports = await query(
    "select count(*)::int as count from app_reports where profile_id = $1",
    [String(profileId)]
  );
  const count = Number(reports.rows[0]?.count || 0);
  if (count < 3) return null;

  return applyShadowBan({
    profileId,
    operatorEmail: "system",
    reason: `Automatic shadow ban after ${count} reports.`,
    moderationNotes: null
  });
}

export async function getPlatformAdminRole(email) {
  if (!email) return null;
  const { listPlatformAdmins } = await import("../db.js");
  const admins = await listPlatformAdmins();
  const match = admins.find((row) => String(row.email).toLowerCase() === String(email).toLowerCase());
  return match?.active ? String(match.role || "admin").toLowerCase() : null;
}

export async function canModerateMembers(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return false;

  const { allowedAdminEmails } = await import("../adminAuth.js");
  if (allowedAdminEmails().includes(normalized)) return true;

  const role = await getPlatformAdminRole(normalized);
  return role ? MODERATION_ROLES.has(role) : false;
}
