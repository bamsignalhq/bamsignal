#!/usr/bin/env node
/**
 * Report (and optionally fix) orphaned photo storage objects and review rows.
 * Default: dry-run only. Pass --fix to apply safe repairs.
 */
import dotenv from "dotenv";
import { isDatabaseReady, query } from "../server/db.js";
import {
  COVER_PHOTOS_BUCKET,
  deletePhotoStorageObject,
  isPhotoStorageConfigured,
  listAllBucketObjects,
  photoStoragePublicUrl,
  PROFILE_PHOTOS_BUCKET
} from "../server/services/photoStorage.js";
import { ensurePhotoReviewSchema, submitPhotoReview } from "../server/services/photoReview.js";

dotenv.config();

const ORPHAN_DELETE_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const fixMode = process.argv.includes("--fix");

function collectProfilePhotoUrls(profileJson = {}) {
  const urls = new Set();
  const profile = profileJson && typeof profileJson === "object" ? profileJson : {};
  for (const url of Array.isArray(profile.photos) ? profile.photos : []) {
    if (url) urls.add(String(url));
  }
  for (const url of [profile.coverPhoto, profile.coverPhotoUrl, profile.mainPhotoUrl]) {
    if (url) urls.add(String(url));
  }
  const photoMeta = profile.photoMeta && typeof profile.photoMeta === "object" ? profile.photoMeta : {};
  for (const url of Object.keys(photoMeta)) {
    if (url) urls.add(String(url));
  }
  return urls;
}

async function loadReferencedProfileUrls() {
  const referenced = new Set();
  const profileRows = await query("select id, user_key, profile from app_member_profiles");
  for (const row of profileRows.rows) {
    for (const url of collectProfilePhotoUrls(row.profile)) {
      referenced.add(url);
    }
  }
  return referenced;
}

async function loadReviewRows() {
  await ensurePhotoReviewSchema();
  const result = await query("select * from photo_reviews order by created_at desc");
  return result.rows;
}

async function checkUrlReachable(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  if (!isDatabaseReady()) {
    console.error("[reconcile-photo-orphans] DATABASE_URL is not configured.");
    process.exit(1);
  }

  const report = {
    mode: fixMode ? "fix" : "dry-run",
    storageOrphans: [],
    reviewsWithoutAttribution: [],
    profilePhotosWithoutReview: [],
    brokenPhotoUrls: [],
    fixes: {
      reviewRowsCreated: 0,
      reviewsMarkedOrphaned: 0,
      storageDeleted: 0
    }
  };

  const referencedUrls = await loadReferencedProfileUrls();
  const reviewRows = await loadReviewRows();
  const reviewByUrl = new Map(reviewRows.map((row) => [row.photo_url, row]));

  for (const row of reviewRows) {
    if (!row.profile_id || !row.user_key) {
      report.reviewsWithoutAttribution.push({
        id: row.id,
        photoUrl: row.photo_url,
        profileId: row.profile_id,
        userKey: row.user_key,
        authUserId: row.auth_user_id
      });
      if (fixMode && !row.profile_id && referencedUrls.has(row.photo_url)) {
        const profileResult = await query(
          `select id, user_key, name, profile
           from app_member_profiles
           where profile->'photos' @> to_jsonb($1::text)
              or profile->>'coverPhoto' = $1
              or profile->>'coverPhotoUrl' = $1
           limit 1`,
          [row.photo_url]
        );
        const profileRow = profileResult.rows[0];
        if (profileRow) {
          await submitPhotoReview({
            photoUrl: row.photo_url,
            photoType: row.photo_type,
            photoReviewStatus: row.photo_review_status,
            photoRiskFlags: row.photo_risk_flags || [],
            profileId: profileRow.id,
            userKey: profileRow.user_key,
            memberName: profileRow.name,
            authUserId: row.auth_user_id
          });
          report.fixes.reviewRowsCreated += 1;
        }
      }
      if (fixMode && !referencedUrls.has(row.photo_url) && row.photo_review_status !== "orphaned") {
        await query(
          `update photo_reviews
           set photo_review_status = 'orphaned',
               reject_reason = coalesce(reject_reason, 'Orphan review row'),
               updated_at = now()
           where id = $1`,
          [row.id]
        );
        report.fixes.reviewsMarkedOrphaned += 1;
      }
    }
  }

  for (const url of referencedUrls) {
    if (!reviewByUrl.has(url)) {
      report.profilePhotosWithoutReview.push({ photoUrl: url });
      if (fixMode) {
        const profileResult = await query(
          `select id, user_key, name, profile
           from app_member_profiles
           where profile->'photos' @> to_jsonb($1::text)
              or profile->>'coverPhoto' = $1
              or profile->>'coverPhotoUrl' = $1
           limit 1`,
          [url]
        );
        const profileRow = profileResult.rows[0];
        if (profileRow) {
          const photoType =
            profileRow.profile?.coverPhoto === url || profileRow.profile?.coverPhotoUrl === url
              ? "cover"
              : "profile";
          const meta = profileRow.profile?.photoMeta?.[url];
          await submitPhotoReview({
            photoUrl: url,
            photoType,
            photoReviewStatus: meta?.photoReviewStatus || "pending_review",
            photoRiskFlags: meta?.photoRiskFlags || [],
            profileId: profileRow.id,
            userKey: profileRow.user_key,
            memberName: profileRow.name
          });
          report.fixes.reviewRowsCreated += 1;
        }
      }
    }
  }

  if (isPhotoStorageConfigured()) {
    const now = Date.now();
    for (const bucket of [PROFILE_PHOTOS_BUCKET, COVER_PHOTOS_BUCKET]) {
      const objects = await listAllBucketObjects(bucket);
      for (const obj of objects) {
        const path = String(obj?.name || "").trim();
        if (!path) continue;
        const url = photoStoragePublicUrl(bucket, path);
        if (referencedUrls.has(url) || reviewByUrl.has(url)) continue;

        const createdAt = obj.updated_at || obj.created_at;
        const ageMs = createdAt ? now - Date.parse(createdAt) : Number.POSITIVE_INFINITY;
        report.storageOrphans.push({ bucket, path, url, ageMs });

        if (fixMode && ageMs >= ORPHAN_DELETE_AGE_MS) {
          await deletePhotoStorageObject(bucket, path);
          report.fixes.storageDeleted += 1;
        }
      }
    }
  } else {
    console.warn("[reconcile-photo-orphans] Photo storage not configured — skipping storage scan.");
  }

  for (const url of referencedUrls) {
    const reachable = await checkUrlReachable(url);
    if (!reachable) {
      report.brokenPhotoUrls.push({ photoUrl: url });
    }
  }

  console.log(JSON.stringify(report, null, 2));

  const issueCount =
    report.storageOrphans.length +
    report.reviewsWithoutAttribution.length +
    report.profilePhotosWithoutReview.length +
    report.brokenPhotoUrls.length;

  if (issueCount === 0) {
    console.log("[reconcile-photo-orphans] no photo orphan issues found.");
    process.exit(0);
  }

  console.log(
    `[reconcile-photo-orphans] found ${issueCount} issue(s) (${report.mode}). Re-run with --fix to apply safe repairs.`
  );
  process.exit(fixMode ? 0 : 1);
}

main().catch((error) => {
  console.error("[reconcile-photo-orphans] failed:", error);
  process.exit(1);
});
