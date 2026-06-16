import { randomUUID } from "node:crypto";
import { resolveSupabaseUrl, supabaseServiceHeaders } from "../supabaseEnv.js";

export const PROFILE_PHOTOS_BUCKET = "profile-photos";
export const COVER_PHOTOS_BUCKET = "cover-photos";

export class PhotoStorageError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "PhotoStorageError";
    this.status = status;
  }
}

export function isPhotoStorageConfigured() {
  return Boolean(supabaseServiceHeaders());
}

function extensionForContentType(contentType) {
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/jpeg" || contentType === "image/jpg") return "jpg";
  throw new PhotoStorageError("Unsupported image type. Use WebP or JPEG.", 400);
}

function storageConfig() {
  const config = supabaseServiceHeaders();
  if (!config) {
    throw new PhotoStorageError("Photo storage is not configured.", 503);
  }
  return config;
}

async function storageRequest(path, { method = "GET", body, headers = {} } = {}) {
  const config = storageConfig();
  const url = `${config.url}/storage/v1${path}`;
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${config.serviceKey}`,
      apikey: config.serviceKey,
      ...headers
    },
    body
  });
  return response;
}

let bucketsEnsured = false;

export async function ensurePhotoBuckets() {
  if (bucketsEnsured) return;
  for (const bucket of [PROFILE_PHOTOS_BUCKET, COVER_PHOTOS_BUCKET]) {
    const existing = await storageRequest(`/bucket/${bucket}`);
    if (existing.ok) continue;
    const created = await storageRequest("/bucket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: bucket,
        name: bucket,
        public: true,
        file_size_limit: 8_388_608
      })
    });
    if (!created.ok && created.status !== 409) {
      const detail = await created.text().catch(() => "");
      throw new PhotoStorageError(
        detail || `Could not create storage bucket "${bucket}".`,
        created.status >= 400 && created.status < 600 ? created.status : 500
      );
    }
  }
  bucketsEnsured = true;
}

export function photoStoragePublicUrl(bucket, objectPath) {
  const base = resolveSupabaseUrl();
  if (!base) return null;
  const encoded = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}

export function parsePhotoStorageUrl(url = "") {
  const base = resolveSupabaseUrl();
  if (!base || !url) return null;
  const prefix = `${base}/storage/v1/object/public/`;
  if (!url.startsWith(prefix)) return null;
  const rest = url.slice(prefix.length);
  const slash = rest.indexOf("/");
  if (slash < 1) return null;
  const bucket = rest.slice(0, slash);
  const objectPath = decodeURIComponent(rest.slice(slash + 1));
  if (bucket !== PROFILE_PHOTOS_BUCKET && bucket !== COVER_PHOTOS_BUCKET) return null;
  return { bucket, path: objectPath };
}

export function assertUserOwnsStoragePath(userId, objectPath) {
  const ownerPrefix = `${userId}/`;
  if (!objectPath.startsWith(ownerPrefix)) {
    throw new PhotoStorageError("You can only manage your own photos.", 403);
  }
}

export async function uploadProfilePhotoObject({ userId, photoId, bytes, contentType }) {
  const ext = extensionForContentType(contentType);
  const safeId = String(photoId || randomUUID()).replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeId) throw new PhotoStorageError("Invalid photo id.", 400);
  const objectPath = `${userId}/${safeId}.${ext}`;
  await uploadObject(PROFILE_PHOTOS_BUCKET, objectPath, bytes, contentType);
  return { url: photoStoragePublicUrl(PROFILE_PHOTOS_BUCKET, objectPath), photoId: safeId };
}

export async function uploadCoverPhotoObject({ userId, bytes, contentType }) {
  const ext = extensionForContentType(contentType);
  const objectPath = `${userId}/cover.${ext}`;
  await uploadObject(COVER_PHOTOS_BUCKET, objectPath, bytes, contentType);
  return { url: photoStoragePublicUrl(COVER_PHOTOS_BUCKET, objectPath) };
}

async function uploadObject(bucket, objectPath, bytes, contentType) {
  await ensurePhotoBuckets();
  const response = await storageRequest(`/object/${bucket}/${objectPath}`, {
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
    throw new PhotoStorageError(detail || "Photo upload failed.", response.status >= 400 ? response.status : 500);
  }
}

export async function deletePhotoStorageObject(bucket, objectPath) {
  await ensurePhotoBuckets();
  const response = await storageRequest(`/object/${bucket}/${objectPath}`, { method: "DELETE" });
  if (!response.ok && response.status !== 404) {
    const detail = await response.text().catch(() => "");
    throw new PhotoStorageError(detail || "Photo delete failed.", response.status >= 400 ? response.status : 500);
  }
}

export async function deleteAllUserPhotoStorage(userId) {
  if (!userId || !isPhotoStorageConfigured()) return { deleted: 0 };
  const prefix = `${String(userId).replace(/[^a-zA-Z0-9_-]/g, "")}/`;
  if (!prefix || prefix === "/") return { deleted: 0 };

  let deleted = 0;
  for (const bucket of [PROFILE_PHOTOS_BUCKET, COVER_PHOTOS_BUCKET]) {
    const list = await storageRequest(`/object/list/${bucket}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefix, limit: 100, offset: 0 })
    });
    if (!list.ok) continue;
    const objects = await list.json().catch(() => []);
    if (!Array.isArray(objects)) continue;
    for (const obj of objects) {
      const path = String(obj?.name || "").trim();
      if (!path) continue;
      await deletePhotoStorageObject(bucket, path);
      deleted += 1;
    }
  }
  return { deleted };
}

export function decodeBase64ImagePayload(dataUrl = "") {
  const match = String(dataUrl).match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
  if (!match) throw new PhotoStorageError("Invalid image payload.", 400);
  const contentType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length) throw new PhotoStorageError("Empty image.", 400);
  if (buffer.length > 8 * 1024 * 1024) {
    throw new PhotoStorageError("Image is too large. Try a smaller photo.", 400);
  }
  return { contentType, buffer };
}
