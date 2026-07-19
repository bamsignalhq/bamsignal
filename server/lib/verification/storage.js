import { randomUUID } from "node:crypto";
import { resolveSupabaseUrl, supabaseServiceHeaders } from "../../supabaseEnv.js";
import { PhotoStorageError } from "../../services/photoStorage.js";

export const VERIFICATION_SELFIES_BUCKET = "verification-selfies";

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

let bucketEnsured = false;

export async function ensureVerificationSelfieBucket() {
  if (bucketEnsured) return;
  const existing = await storageRequest(`/bucket/${VERIFICATION_SELFIES_BUCKET}`);
  if (!existing.ok) {
    const created = await storageRequest("/bucket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: VERIFICATION_SELFIES_BUCKET,
        name: VERIFICATION_SELFIES_BUCKET,
        public: false,
        file_size_limit: 6_291_456
      })
    });
    if (!created.ok && created.status !== 409) {
      const detail = await created.text().catch(() => "");
      throw new PhotoStorageError(
        detail || `Could not create private bucket "${VERIFICATION_SELFIES_BUCKET}".`,
        created.status >= 400 && created.status < 600 ? created.status : 500
      );
    }
  }
  bucketEnsured = true;
}

function extensionForContentType(contentType) {
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/jpeg" || contentType === "image/jpg") return "jpg";
  if (contentType === "image/png") return "png";
  throw new PhotoStorageError("Unsupported verification image type.", 400);
}

export async function uploadVerificationSelfie({
  authUserId,
  sessionId,
  bytes,
  contentType
}) {
  await ensureVerificationSelfieBucket();
  const ext = extensionForContentType(contentType);
  const objectPath = `${authUserId || "anon"}/${sessionId || randomUUID()}/${randomUUID()}.${ext}`;
  const response = await storageRequest(
    `/object/${VERIFICATION_SELFIES_BUCKET}/${objectPath}`,
    {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        "x-upsert": "true"
      },
      body: Buffer.from(bytes)
    }
  );
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new PhotoStorageError(detail || "Verification selfie upload failed.", response.status || 500);
  }
  return { bucket: VERIFICATION_SELFIES_BUCKET, path: objectPath };
}

export async function createVerificationSignedUrl(objectPath, expiresIn = 300) {
  await ensureVerificationSelfieBucket();
  const response = await storageRequest(`/object/sign/${VERIFICATION_SELFIES_BUCKET}/${objectPath}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new PhotoStorageError(payload?.message || "Could not sign verification selfie URL.", 500);
  }
  const base = resolveSupabaseUrl();
  const signedPath = payload?.signedURL || payload?.signedUrl || payload?.data?.signedUrl;
  if (!signedPath) return null;
  if (String(signedPath).startsWith("http")) return signedPath;
  return `${base}/storage/v1${signedPath}`;
}

export async function deleteVerificationObject(objectPath) {
  if (!objectPath) return;
  try {
    await ensureVerificationSelfieBucket();
    await storageRequest(`/object/${VERIFICATION_SELFIES_BUCKET}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefixes: [objectPath] })
    });
  } catch {
    /* best-effort cleanup */
  }
}
