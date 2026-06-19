import {
  assertUserOwnsStoragePath,
  decodeBase64ImagePayload,
  deletePhotoStorageObject,
  isPhotoStorageConfigured,
  parsePhotoStorageUrl,
  uploadCoverPhotoObject,
  uploadProfilePhotoObject,
  PhotoStorageError
} from "../../server/services/photoStorage.js";
import { moderatePhoto } from "../../server/services/photoModerationProvider.js";
import { submitPhotoReview } from "../../server/services/photoReview.js";
import { recordPhotoViolation } from "../../server/services/moderation.js";
import { verifySupabaseBearerUserId } from "../../server/supabaseEnv.js";

async function finalizeUploadedPhoto({ userId, kind, result, body }) {
  const filename = String(body.sourceFilename || body.filename || "").trim();
  const moderation = await moderatePhoto({
    imageUrl: result.url,
    userId,
    photoType: kind,
    hints: { filename }
  });

  const reviewStatus =
    moderation.decision === "rejected"
      ? "rejected"
      : moderation.decision === "pending_review"
        ? "pending_review"
        : "approved";

  const parsed = parsePhotoStorageUrl(result.url);
  if (reviewStatus === "rejected" && parsed) {
    try {
      await deletePhotoStorageObject(parsed.bucket, parsed.path);
    } catch (error) {
      console.warn("[bamsignal] failed to delete rejected photo:", error);
    }
  }

  if (reviewStatus !== "approved") {
    try {
      await submitPhotoReview({
        photoUrl: result.url,
        photoType: kind,
        photoReviewStatus: reviewStatus,
        photoRiskFlags: moderation.flags || [],
        profileId: body.profileId || null,
        memberName: body.memberName || null
      });
    } catch (error) {
      console.warn("[bamsignal] photo review enqueue failed:", error);
    }
  }

  return {
    reviewStatus,
    photoRiskFlags: moderation.flags || [],
    moderationRejected: reviewStatus === "rejected",
    moderationConfidence: moderation.confidence ?? 0,
    moderationProvider: moderation.provider || "manual"
  };
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

async function verifyBearerUserId(req) {
  const authHeader = req.headers.authorization || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  return verifySupabaseBearerUserId(bearer);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!isPhotoStorageConfigured()) {
    return res.status(503).json({
      ok: false,
      error: "Photo storage is not configured.",
      storageUnavailable: true
    });
  }

  const action = String(req.query.action || "").trim();
  const body = parseBody(req);

  try {
    const userId = await verifyBearerUserId(req);
    if (!userId) {
      return res.status(401).json({ ok: false, error: "Login required to upload photos." });
    }

    if (action === "upload") {
      const kind = String(body.kind || "").trim();
      if (kind !== "profile" && kind !== "cover") {
        return res.status(400).json({ ok: false, error: "Invalid photo kind." });
      }

      const { contentType, buffer } = decodeBase64ImagePayload(body.imageBase64);

      if (kind === "cover") {
        const result = await uploadCoverPhotoObject({ userId, bytes: buffer, contentType });
        const moderation = await finalizeUploadedPhoto({ userId, kind, result, body });
        return res.status(200).json({
          ok: true,
          url: result.url,
          path: result.path,
          kind,
          ...moderation
        });
      }

      const result = await uploadProfilePhotoObject({
        userId,
        photoId: body.photoId,
        bytes: buffer,
        contentType
      });
      const moderation = await finalizeUploadedPhoto({ userId, kind, result, body });
      return res.status(200).json({
        ok: true,
        url: result.url,
        photoId: result.photoId,
        kind,
        ...moderation
      });
    }

    if (action === "delete") {
      const url = String(body.url || "").trim();
      const parsed = parsePhotoStorageUrl(url);
      if (!parsed) {
        return res.status(400).json({ ok: false, error: "Invalid photo URL." });
      }
      assertUserOwnsStoragePath(userId, parsed.path);
      await deletePhotoStorageObject(parsed.bucket, parsed.path);
      return res.status(200).json({ ok: true });
    }

    if (action === "submit-review") {
      const photoUrl = String(body.photoUrl || "").trim();
      const photoType = String(body.photoType || "profile").trim();
      const photoReviewStatus = String(body.photoReviewStatus || "pending_review").trim();
      const photoRiskFlags = Array.isArray(body.photoRiskFlags) ? body.photoRiskFlags : [];

      if (!photoUrl) {
        return res.status(400).json({ ok: false, error: "Photo URL required." });
      }

      const parsed = parsePhotoStorageUrl(photoUrl);
      if (parsed) {
        assertUserOwnsStoragePath(userId, parsed.path);
      }

      const review = await submitPhotoReview({
        photoUrl,
        photoType,
        photoReviewStatus,
        photoRiskFlags,
        memberName: body.memberName || null,
        profileId: body.profileId || null
      });

      return res.status(200).json({ ok: true, review });
    }

    if (action === "report-violation") {
      const profileId = String(body.profileId || "").trim();
      const reason = String(body.reason || "").trim() || "Blocked unhealthy photo before upload";
      const photoRiskFlags = Array.isArray(body.photoRiskFlags) ? body.photoRiskFlags : [];

      if (!profileId) {
        return res.status(400).json({ ok: false, error: "Profile id required." });
      }

      const violation = await recordPhotoViolation({
        profileId,
        photoUrl: body.photoUrl ? String(body.photoUrl).trim() : null,
        reason,
        source: "system",
        operatorEmail: "system",
        photoRiskFlags
      });

      return res.status(200).json({ ok: true, violation });
    }

    return res.status(400).json({ ok: false, error: "Unknown action." });
  } catch (error) {
    if (error instanceof PhotoStorageError) {
      return res.status(error.status).json({ ok: false, error: error.message });
    }
    console.error("[bamsignal] member photos error:", error);
    return res.status(500).json({ ok: false, error: "Photo request failed." });
  }
}
