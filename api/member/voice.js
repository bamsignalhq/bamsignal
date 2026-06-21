import { requireMemberAuth } from "../../server/services/memberAuth.js";
import {
  decodeBase64AudioPayload,
  isVoiceIntroStorageConfigured,
  uploadVoiceIntroObject,
  VoiceIntroStorageError
} from "../../server/services/voiceIntroStorage.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";

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
    const owner = await requireMemberAuth(req, body);
    if (!owner.ok) {
      return unauthorized(res, owner);
    }

    if (action !== "upload") {
      return res.status(400).json({ ok: false, error: "Invalid action." });
    }

    if (!isVoiceIntroStorageConfigured()) {
      return sendLoggedApiError({
        req,
        res,
        event: "photo_storage_unavailable",
        error: new Error("voice intro storage unavailable"),
        status: 503,
        message: "Voice intro upload failed.",
        context: { action, resource: "voice_intro" },
        body: { storageUnavailable: true }
      });
    }

    const { contentType, buffer } = decodeBase64AudioPayload(body.audioBase64);
    const result = await uploadVoiceIntroObject({
      userId: owner.authUserId,
      bytes: buffer,
      contentType
    });

    return res.status(200).json({
      ok: true,
      url: result.url,
      path: result.path
    });
  } catch (error) {
    if (error instanceof VoiceIntroStorageError) {
      return sendLoggedApiError({
        req,
        res,
        event: "voice_intro_failed",
        error,
        status: error.status || 400,
        message: "Voice intro upload failed.",
        context: { action }
      });
    }
    return sendLoggedApiError({
      req,
      res,
      event: "voice_intro_failed",
      error,
      status: 500,
      message: "Voice intro upload failed.",
      context: { action }
    });
  }
}
