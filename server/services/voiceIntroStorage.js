import { randomUUID } from "node:crypto";
import { resolveSupabaseUrl, supabaseServiceHeaders } from "../supabaseEnv.js";

export const VOICE_INTROS_BUCKET = "voice-intros";

export class VoiceIntroStorageError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "VoiceIntroStorageError";
    this.status = status;
  }
}

export function isVoiceIntroStorageConfigured() {
  return Boolean(supabaseServiceHeaders());
}

function extensionForAudioContentType(contentType) {
  const type = String(contentType || "").toLowerCase();
  if (type.includes("webm")) return "webm";
  if (type.includes("mp4") || type.includes("mpeg4") || type.includes("aac")) return "m4a";
  if (type.includes("wav")) return "wav";
  if (type.includes("ogg")) return "ogg";
  throw new VoiceIntroStorageError("Unsupported audio type.", 400);
}

function storageConfig() {
  const config = supabaseServiceHeaders();
  if (!config) {
    throw new VoiceIntroStorageError("Voice intro storage is not configured.", 503);
  }
  return config;
}

async function storageRequest(path, { method = "GET", body, headers = {} } = {}) {
  const config = storageConfig();
  const url = `${config.url}/storage/v1${path}`;
  return fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${config.serviceKey}`,
      apikey: config.serviceKey,
      ...headers
    },
    body
  });
}

function voiceStoragePublicUrl(objectPath) {
  const base = resolveSupabaseUrl();
  if (!base) return null;
  const encoded = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/storage/v1/object/public/${VOICE_INTROS_BUCKET}/${encoded}`;
}

let voiceBucketEnsured = false;

export async function ensureVoiceIntroBucket() {
  if (voiceBucketEnsured) return;
  const existing = await storageRequest(`/bucket/${VOICE_INTROS_BUCKET}`);
  if (!existing.ok) {
    const created = await storageRequest("/bucket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: VOICE_INTROS_BUCKET,
        name: VOICE_INTROS_BUCKET,
        public: true,
        file_size_limit: 2_097_152
      })
    });
    if (!created.ok && created.status !== 409) {
      const detail = await created.text().catch(() => "");
      throw new VoiceIntroStorageError(
        detail || `Could not create storage bucket "${VOICE_INTROS_BUCKET}".`,
        created.status >= 400 && created.status < 600 ? created.status : 500
      );
    }
  }
  voiceBucketEnsured = true;
}

export function parseVoiceIntroStorageUrl(url = "") {
  const base = resolveSupabaseUrl();
  if (!base || !url) return null;
  const prefix = `${base}/storage/v1/object/public/${VOICE_INTROS_BUCKET}/`;
  if (!url.startsWith(prefix)) return null;
  return { bucket: VOICE_INTROS_BUCKET, path: decodeURIComponent(url.slice(prefix.length)) };
}

export function assertUserOwnsVoiceIntroPath(userId, objectPath) {
  const ownerPrefix = `${userId}/`;
  if (!objectPath.startsWith(ownerPrefix)) {
    throw new VoiceIntroStorageError("You can only manage your own voice intro.", 403);
  }
}

export function decodeBase64AudioPayload(dataUrl = "") {
  const raw = String(dataUrl).trim();
  const match = raw.match(/^data:([^;]+);base64,(.+)$/i);
  if (!match) {
    throw new VoiceIntroStorageError("Invalid audio payload.", 400);
  }

  const contentType = String(match[1] || "").toLowerCase();
  if (!contentType.startsWith("audio/")) {
    throw new VoiceIntroStorageError("Unsupported audio type.", 400);
  }

  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length) throw new VoiceIntroStorageError("Empty audio.", 400);
  if (buffer.length > 2 * 1024 * 1024) {
    throw new VoiceIntroStorageError("Voice intro is too large. Please record a shorter clip.", 400);
  }
  return { contentType, buffer };
}

export async function uploadVoiceIntroObject({ userId, bytes, contentType }) {
  const ext = extensionForAudioContentType(contentType);
  const safeId = randomUUID().replace(/[^a-zA-Z0-9_-]/g, "");
  const objectPath = `${userId}/${safeId}.${ext}`;
  await ensureVoiceIntroBucket();
  const response = await storageRequest(`/object/${VOICE_INTROS_BUCKET}/${objectPath}`, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      "x-upsert": "true",
      "Cache-Control": "public, max-age=31536000, immutable"
    },
    body: bytes
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new VoiceIntroStorageError(
      detail || "Voice intro upload failed.",
      response.status >= 400 ? response.status : 500
    );
  }
  const url = voiceStoragePublicUrl(objectPath);
  if (!url) throw new VoiceIntroStorageError("Voice intro upload failed.", 500);
  return { url, path: objectPath };
}
