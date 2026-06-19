import { isDatabaseReady, query } from "../db.js";
import { ensureMemberProfilesTable } from "../cityHome.js";
import { filterPhotosForPublicView, normalizePhotoMetaMap } from "../../shared/photoReview.mjs";
import {
  deletePhotoStorageObject,
  parsePhotoStorageUrl
} from "./photoStorage.js";
import {
  isUnhealthyPhotoSubmission,
  recordPhotoViolation
} from "./moderation.js";

export async function ensurePhotoReviewSchema() {
  if (!isDatabaseReady()) return;
  await ensureMemberProfilesTable();

  await query(`
    create table if not exists photo_reviews (
      id uuid primary key default gen_random_uuid(),
      profile_id uuid references app_member_profiles(id) on delete cascade,
      user_key text,
      member_name text,
      photo_url text not null,
      photo_type text not null,
      photo_review_status text not null default 'pending_review',
      photo_risk_flags jsonb not null default '[]'::jsonb,
      reject_reason text,
      reviewed_at timestamptz,
      reviewed_by text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await query(
    "create index if not exists photo_reviews_status_idx on photo_reviews (photo_review_status, created_at desc)"
  );
  await query(
    "create unique index if not exists photo_reviews_url_idx on photo_reviews (photo_url)"
  );
}

function mapReviewRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    profileId: row.profile_id,
    userKey: row.user_key,
    memberName: row.member_name || "Member",
    photoUrl: row.photo_url,
    photoType: row.photo_type,
    photoReviewStatus: row.photo_review_status,
    photoRiskFlags: Array.isArray(row.photo_risk_flags) ? row.photo_risk_flags : [],
    rejectReason: row.reject_reason,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    uploadedAt: row.created_at,
    photoViolationCount: Number(row.photo_violation_count || 0)
  };
}

async function deleteStoredPhotoUrl(photoUrl) {
  const parsed = parsePhotoStorageUrl(photoUrl);
  if (!parsed) return false;
  try {
    await deletePhotoStorageObject(parsed.bucket, parsed.path);
    return true;
  } catch (error) {
    console.error("[bamsignal] photo storage delete failed:", error);
    return false;
  }
}

async function purgeUnhealthyPhoto(review, { operatorEmail, reason, status = "rejected" }) {
  if (!review) return { ok: false, error: "Review not found." };

  const rejectReason = String(reason || "").trim() || "Removed by moderator";

  await deleteStoredPhotoUrl(review.photo_url);

  if (review.profile_id) {
    const row = await query("select profile from app_member_profiles where id = $1 limit 1", [
      review.profile_id
    ]);
    if (row.rows[0]) {
      const nextProfile = removePhotoFromProfile(row.rows[0].profile, review.photo_url);
      await query(
        `update app_member_profiles set profile = $2::jsonb, updated_at = now() where id = $1`,
        [review.profile_id, nextProfile]
      );
    }
  }

  await query(
    `update photo_reviews
     set photo_review_status = $3,
         reject_reason = $4,
         reviewed_at = now(),
         reviewed_by = $2,
         updated_at = now()
     where id = $1`,
    [review.id, operatorEmail, status, rejectReason]
  );

  return {
    ok: true,
    review: mapReviewRow({
      ...review,
      photo_review_status: status,
      reject_reason: rejectReason,
      reviewed_by: operatorEmail
    })
  };
}

async function findProfileByPhotoUrl(photoUrl) {
  if (!photoUrl) return null;
  const result = await query(
    `select *
     from app_member_profiles
     where profile->'photos' @> to_jsonb($1::text)
        or profile->>'coverPhoto' = $1
     limit 1`,
    [photoUrl]
  );
  return result.rows[0] || null;
}

function applyPhotoMetaToProfile(profileJson, photoUrl, meta) {
  const profile = profileJson && typeof profileJson === "object" ? { ...profileJson } : {};
  const photoMeta = normalizePhotoMetaMap(profile.photoMeta);
  photoMeta[photoUrl] = meta;
  profile.photoMeta = photoMeta;
  return profile;
}

function removePhotoFromProfile(profileJson, photoUrl) {
  const profile = profileJson && typeof profileJson === "object" ? { ...profileJson } : {};
  const photos = Array.isArray(profile.photos) ? profile.photos.filter((url) => url !== photoUrl) : [];
  profile.photos = photos;
  if (profile.coverPhoto === photoUrl || profile.coverPhotoUrl === photoUrl) {
    profile.coverPhoto = undefined;
    profile.coverPhotoUrl = undefined;
    profile.coverPhotoPath = undefined;
    profile.coverPhotoUpdatedAt = undefined;
    profile.coverPhotoExplicit = false;
  }
  const photoMeta = normalizePhotoMetaMap(profile.photoMeta);
  if (photoMeta[photoUrl]) {
    photoMeta[photoUrl] = {
      ...photoMeta[photoUrl],
      photoReviewStatus: "rejected"
    };
  }
  profile.photoMeta = photoMeta;
  return profile;
}

export function publicPhotosFromProfile(profileJson) {
  const profile = profileJson && typeof profileJson === "object" ? profileJson : {};
  const photos = Array.isArray(profile.photos) ? profile.photos : [];
  const photoMeta = normalizePhotoMetaMap(profile.photoMeta);
  return filterPhotosForPublicView(photos, photoMeta);
}

export async function submitPhotoReview({
  photoUrl,
  photoType,
  photoReviewStatus = "pending_review",
  photoRiskFlags = [],
  memberName = null,
  userKey = null,
  profileId: explicitProfileId = null
}) {
  if (!isDatabaseReady()) return null;
  await ensurePhotoReviewSchema();

  const url = String(photoUrl || "").trim();
  if (!url) return null;

  let profileRow = await findProfileByPhotoUrl(url);
  if (!profileRow && explicitProfileId) {
    const byId = await query("select * from app_member_profiles where id = $1 limit 1", [
      explicitProfileId
    ]);
    profileRow = byId.rows[0] || null;
  }

  const profileId = profileRow?.id || explicitProfileId || null;
  const resolvedUserKey = userKey || profileRow?.user_key || null;
  const resolvedName = memberName || profileRow?.name || profileRow?.profile?.name || null;

  const existingReview = await query(
    "select photo_review_status from photo_reviews where photo_url = $1 limit 1",
    [url]
  );
  const previousStatus = existingReview.rows[0]?.photo_review_status || null;

  if (profileRow) {
    const meta = {
      photoReviewStatus,
      photoRiskFlags,
      type: photoType === "cover" ? "cover" : "profile",
      uploadedAt: new Date().toISOString()
    };
    const nextProfile = applyPhotoMetaToProfile(profileRow.profile, url, meta);
    await query(
      `update app_member_profiles
       set profile = $2::jsonb, updated_at = now()
       where id = $1`,
      [profileRow.id, nextProfile]
    );
  }

  const result = await query(
    `insert into photo_reviews (
       profile_id, user_key, member_name, photo_url, photo_type,
       photo_review_status, photo_risk_flags, updated_at
     )
     values ($1, $2, $3, $4, $5, $6, $7::jsonb, now())
     on conflict (photo_url)
     do update set
       profile_id = coalesce(excluded.profile_id, photo_reviews.profile_id),
       user_key = coalesce(excluded.user_key, photo_reviews.user_key),
       member_name = coalesce(excluded.member_name, photo_reviews.member_name),
       photo_type = excluded.photo_type,
       photo_review_status = excluded.photo_review_status,
       photo_risk_flags = excluded.photo_risk_flags,
       updated_at = now()
     returning *`,
    [
      profileId,
      resolvedUserKey,
      resolvedName,
      url,
      photoType === "cover" ? "cover" : "profile",
      photoReviewStatus,
      JSON.stringify(photoRiskFlags)
    ]
  );

  const reviewRow = mapReviewRow(result.rows[0]);
  const unhealthy = isUnhealthyPhotoSubmission({
    photoReviewStatus,
    photoRiskFlags
  });
  const newlyFlagged =
    unhealthy &&
    previousStatus !== "pending_review" &&
    previousStatus !== "rejected" &&
    photoReviewStatus !== "approved";

  if (newlyFlagged && profileId) {
    const violation = await recordPhotoViolation({
      profileId,
      userKey: resolvedUserKey,
      photoUrl: url,
      reason:
        photoReviewStatus === "rejected"
          ? "Rejected unhealthy photo upload"
          : "Flagged unhealthy photo for admin review",
      source: "system",
      operatorEmail: "system",
      photoRiskFlags
    });
    if (reviewRow) reviewRow.photoViolationCount = violation.count;
  }

  return reviewRow;
}

export async function listPhotoReviews({ status = "pending_review", limit = 50 } = {}) {
  if (!isDatabaseReady()) return [];
  await ensurePhotoReviewSchema();

  const result = await query(
    `select pr.*, coalesce(p.photo_violation_count, 0)::int as photo_violation_count
     from photo_reviews pr
     left join app_member_profiles p on p.id = pr.profile_id
     where pr.photo_review_status = $1
     order by pr.created_at desc
     limit $2`,
    [status, Math.min(200, Math.max(1, Number(limit) || 50))]
  );
  return result.rows.map(mapReviewRow).filter(Boolean);
}

async function updateProfilePhotoMeta(profileId, photoUrl, meta) {
  if (!profileId) return;
  const row = await query("select profile from app_member_profiles where id = $1 limit 1", [profileId]);
  if (!row.rows[0]) return;
  const nextProfile = applyPhotoMetaToProfile(row.rows[0].profile, photoUrl, meta);
  await query(
    `update app_member_profiles set profile = $2::jsonb, updated_at = now() where id = $1`,
    [profileId, nextProfile]
  );
}

export async function approvePhotoReview({ reviewId, operatorEmail }) {
  if (!isDatabaseReady()) return { ok: false, error: "Database unavailable." };
  await ensurePhotoReviewSchema();

  const existing = await query("select * from photo_reviews where id = $1 limit 1", [reviewId]);
  const review = existing.rows[0];
  if (!review) return { ok: false, error: "Review not found." };

  await query(
    `update photo_reviews
     set photo_review_status = 'approved',
         reviewed_at = now(),
         reviewed_by = $2,
         updated_at = now()
     where id = $1`,
    [reviewId, operatorEmail]
  );

  const meta = {
    photoReviewStatus: "approved",
    photoRiskFlags: [],
    type: review.photo_type === "cover" ? "cover" : "profile",
    uploadedAt: review.created_at
  };
  await updateProfilePhotoMeta(review.profile_id, review.photo_url, meta);

  return { ok: true, review: mapReviewRow({ ...review, photo_review_status: "approved" }) };
}

export async function rejectPhotoReview({ reviewId, operatorEmail, reason = "" }) {
  if (!isDatabaseReady()) return { ok: false, error: "Database unavailable." };
  await ensurePhotoReviewSchema();

  const existing = await query("select * from photo_reviews where id = $1 limit 1", [reviewId]);
  const review = existing.rows[0];
  if (!review) return { ok: false, error: "Review not found." };

  return purgeUnhealthyPhoto(review, {
    operatorEmail,
    reason: String(reason || "").trim() || "Rejected by moderator",
    status: "rejected"
  });
}

export async function deletePhotoReview({ reviewId, operatorEmail, reason = "" }) {
  if (!isDatabaseReady()) return { ok: false, error: "Database unavailable." };
  await ensurePhotoReviewSchema();

  const existing = await query("select * from photo_reviews where id = $1 limit 1", [reviewId]);
  const review = existing.rows[0];
  if (!review) return { ok: false, error: "Review not found." };

  return purgeUnhealthyPhoto(review, {
    operatorEmail,
    reason: String(reason || "").trim() || "Deleted instantly by moderator",
    status: "rejected"
  });
}
