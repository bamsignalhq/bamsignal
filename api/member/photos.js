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
import { submitPhotoReview } from "../../server/services/photoReview.js";
import { resolveSupabaseUrl } from "../../server/supabaseEnv.js";

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
  if (!bearer) return null;

  const url = resolveSupabaseUrl();
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  if (!url || !anonKey) return null;

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${bearer}`
    }
  });
  if (!response.ok) return null;
  const user = await response.json().catch(() => null);
  return user?.id ? String(user.id) : null;
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
        return res.status(200).json({ ok: true, url: result.url, kind });
      }

      const result = await uploadProfilePhotoObject({
        userId,
        photoId: body.photoId,
        bytes: buffer,
        contentType
      });
      return res.status(200).json({ ok: true, url: result.url, photoId: result.photoId, kind });
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
        memberName: body.memberName || null
      });

      return res.status(200).json({ ok: true, review });
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
