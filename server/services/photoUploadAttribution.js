import { requireMemberAuth } from "./memberAuth.js";
import {
  attachUploadedPhotoToProfile,
  submitPhotoReview
} from "./photoReview.js";
import { moderatePhoto } from "./photoModerationProvider.js";
import {
  assertUserOwnsStoragePath,
  parsePhotoStorageUrl
} from "./photoStorage.js";

export async function resolvePhotoUploadOwner(req, body = {}) {
  return requireMemberAuth(req, body);
}

export async function finalizeAuthenticatedPhotoUpload({
  owner,
  kind,
  photoUrl,
  coverPath = null,
  filename = ""
}) {
  const moderation = await moderatePhoto({
    imageUrl: photoUrl,
    userId: owner.authUserId,
    photoType: kind,
    hints: { filename }
  });

  const photoRiskFlags = moderation.flags || [];
  const reviewStatus = "pending_review";
  let profileAttached = false;

  if (owner.memberId) {
    const attachResult = await attachUploadedPhotoToProfile({
      profileId: owner.memberId,
      photoUrl,
      photoType: kind,
      photoReviewStatus: reviewStatus,
      photoRiskFlags,
      coverPath
    });
    profileAttached = Boolean(attachResult.attached);
  }

  const memberName =
    owner.member?.name ||
    owner.identity?.name ||
    owner.appUser?.name ||
    owner.username ||
    null;

  await submitPhotoReview({
    photoUrl,
    photoType: kind,
    photoReviewStatus: reviewStatus,
    photoRiskFlags,
    memberName,
    userKey: owner.userKey || null,
    profileId: owner.memberId || null,
    authUserId: owner.authUserId || null
  });

  return {
    reviewStatus,
    photoRiskFlags,
    moderationRejected: false,
    moderationConfidence: moderation.confidence ?? 0,
    moderationProvider: moderation.provider || "manual",
    profileAttached
  };
}

export async function finalizeExistingPhotoUpload(req, body = {}) {
  const owner = await resolvePhotoUploadOwner(req, body);
  if (!owner.ok) {
    return { ok: false, status: owner.status || 401, error: owner.error || "not_authorized" };
  }

  const photoUrl = String(body.photoUrl || body.url || "").trim();
  const kind = String(body.kind || body.photoType || "").trim();
  if (!photoUrl) {
    return { ok: false, status: 400, error: "Photo URL required." };
  }
  if (kind !== "profile" && kind !== "cover") {
    return { ok: false, status: 400, error: "Invalid photo kind." };
  }

  const parsed = parsePhotoStorageUrl(photoUrl);
  if (!parsed) {
    return { ok: false, status: 400, error: "Invalid photo URL." };
  }
  assertUserOwnsStoragePath(owner.authUserId, parsed.path);

  const moderation = await finalizeAuthenticatedPhotoUpload({
    owner,
    kind,
    photoUrl,
    coverPath: body.coverPath || body.path || null,
    filename: String(body.sourceFilename || body.filename || "").trim()
  });

  return { ok: true, url: photoUrl, kind, ...moderation };
}
