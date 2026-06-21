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
import { recordPhotoViolation } from "../../server/services/moderation.js";
import { submitPhotoReview } from "../../server/services/photoReview.js";
import {
  finalizeAuthenticatedPhotoUpload,
  finalizeExistingPhotoUpload,
  resolvePhotoUploadOwner
} from "../../server/services/photoUploadAttribution.js";
import {
  logAlertableEvent,
  observabilityContext
} from "../../server/services/observability.js";

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

function unauthorized(res, auth) {
  return res.status(auth?.status || 401).json({ ok: false, error: auth?.error || "not_authorized" });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const action = String(req.query.action || "").trim();
  const body = parseBody(req);

  try {
    const owner = await resolvePhotoUploadOwner(req, body);
    if (!owner.ok) {
      return unauthorized(res, owner);
    }

    const needsStorage = action === "upload" || action === "delete" || action === "finalize";
    if (needsStorage && !isPhotoStorageConfigured()) {
      logAlertableEvent(
        "photo_storage_unavailable",
        observabilityContext(req, { action })
      );
      return res.status(503).json({
        ok: false,
        error: "Photo storage is not configured.",
        storageUnavailable: true
      });
    }

    if (action === "upload") {
      const kind = String(body.kind || "").trim();
      if (kind !== "profile" && kind !== "cover") {
        return res.status(400).json({ ok: false, error: "Invalid photo kind." });
      }

      const { contentType, buffer } = decodeBase64ImagePayload(body.imageBase64);
      const filename = String(body.sourceFilename || body.filename || "").trim();

      if (kind === "cover") {
        const result = await uploadCoverPhotoObject({
          userId: owner.authUserId,
          bytes: buffer,
          contentType
        });
        const moderation = await finalizeAuthenticatedPhotoUpload({
          owner,
          kind,
          photoUrl: result.url,
          coverPath: result.path,
          filename
        });
        return res.status(200).json({
          ok: true,
          url: result.url,
          path: result.path,
          kind,
          ...moderation
        });
      }

      const result = await uploadProfilePhotoObject({
        userId: owner.authUserId,
        photoId: body.photoId,
        bytes: buffer,
        contentType
      });
      const moderation = await finalizeAuthenticatedPhotoUpload({
        owner,
        kind,
        photoUrl: result.url,
        filename
      });
      return res.status(200).json({
        ok: true,
        url: result.url,
        photoId: result.photoId,
        kind,
        ...moderation
      });
    }

    if (action === "finalize") {
      const result = await finalizeExistingPhotoUpload(req, body);
      if (!result.ok) {
        return res.status(result.status || 400).json({ ok: false, error: result.error || "Finalize failed." });
      }
      return res.status(200).json(result);
    }

    if (action === "delete") {
      const url = String(body.url || "").trim();
      const parsed = parsePhotoStorageUrl(url);
      if (!parsed) {
        return res.status(400).json({ ok: false, error: "Invalid photo URL." });
      }
      assertUserOwnsStoragePath(owner.authUserId, parsed.path);
      await deletePhotoStorageObject(parsed.bucket, parsed.path);
      return res.status(200).json({ ok: true });
    }

    if (action === "submit-review") {
      const photoUrl = String(body.photoUrl || "").trim();
      const photoType = String(body.photoType || "profile").trim();
      const photoRiskFlags = Array.isArray(body.photoRiskFlags) ? body.photoRiskFlags : [];

      if (!photoUrl) {
        return res.status(400).json({ ok: false, error: "Photo URL required." });
      }

      const parsed = parsePhotoStorageUrl(photoUrl);
      if (parsed) {
        assertUserOwnsStoragePath(owner.authUserId, parsed.path);
      }

      const review = await submitPhotoReview({
        photoUrl,
        photoType,
        photoReviewStatus: "pending_review",
        photoRiskFlags,
        memberName: owner.member?.name || owner.identity?.name || owner.username || null,
        userKey: owner.userKey || null,
        profileId: owner.memberId || null,
        authUserId: owner.authUserId || null,
        trustedModeration: false
      });

      return res.status(200).json({ ok: true, review });
    }

    if (action === "report-violation") {
      const profileId = owner.memberId;
      const reason = String(body.reason || "").trim() || "Blocked unhealthy photo before upload";
      const photoRiskFlags = Array.isArray(body.photoRiskFlags) ? body.photoRiskFlags : [];

      if (!profileId) {
        return res.status(404).json({ ok: false, error: "Member profile not found." });
      }

      const violation = await recordPhotoViolation({
        profileId,
        userKey: owner.userKey || null,
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
    logAlertableEvent(
      "photo_upload_failed",
      observabilityContext(req, {
        action,
        error: error?.message || String(error)
      })
    );
    return res.status(500).json({ ok: false, error: "Photo request failed." });
  }
}
