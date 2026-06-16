import { PHOTO_UPLOAD_FAIL } from "../constants/photos";
import type { PhotoUploadErrorCode } from "../constants/photoUploadErrors";
import { apiUrl, supabase } from "./supabase";
import { isStoragePhotoUrl } from "../utils/photoRefs";
import { blobToDataUrl, fileToCompressedDataUrl, fileToCompressedImageBlob } from "../utils/photoUpload";
import { logPhotoUpload } from "../utils/photoUploadLog";

export class PhotoUploadError extends Error {
  readonly code: PhotoUploadErrorCode;
  readonly fallbackAllowed: boolean;

  constructor(
    message: string,
    options: { code?: PhotoUploadErrorCode; fallbackAllowed?: boolean } = {}
  ) {
    super(message);
    this.name = "PhotoUploadError";
    this.code = options.code ?? "UPLOAD_FAILED";
    this.fallbackAllowed = options.fallbackAllowed ?? false;
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const session = await supabase?.auth.getSession();
  const token = session?.data.session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function uploadCompressedBlob(
  kind: "profile" | "cover",
  blob: Blob,
  photoId?: string
): Promise<{ url: string; photoId?: string }> {
  const imageBase64 = await blobToDataUrl(blob);
  const body: Record<string, string> = { kind, imageBase64 };
  if (photoId) body.photoId = photoId;

  logPhotoUpload("storage_upload_start", { kind, compressedSize: blob.size, photoId: photoId || null });

  const response = await fetch(apiUrl("/api/member/photos?action=upload"), {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok || !payload.url) {
    const storageUnavailable = Boolean(payload?.storageUnavailable) || response.status === 503;
    logPhotoUpload("storage_upload_failed", {
      kind,
      status: response.status,
      storageUnavailable,
      error: payload?.error || "unknown"
    });
    throw new PhotoUploadError(String(payload?.error || PHOTO_UPLOAD_FAIL), {
      code: "STORAGE_FAILED",
      fallbackAllowed: storageUnavailable
    });
  }

  logPhotoUpload("storage_upload_ok", { kind, url: String(payload.url) });
  return { url: String(payload.url), photoId: payload.photoId ? String(payload.photoId) : photoId };
}

async function uploadWithEmergencyFallback(
  kind: "profile" | "cover",
  file: File,
  compressOpts?: { maxEdge?: number; quality?: number; maxBytes?: number }
): Promise<string> {
  const { blob } = await fileToCompressedImageBlob(file, compressOpts);
  const photoId = kind === "profile" ? crypto.randomUUID() : undefined;
  try {
    const result = await uploadCompressedBlob(kind, blob, photoId);
    return result.url;
  } catch (error) {
    if (error instanceof PhotoUploadError && error.fallbackAllowed) {
      logPhotoUpload("storage_fallback_dataurl", { kind });
      return fileToCompressedDataUrl(file, compressOpts);
    }
    throw error;
  }
}

export async function uploadProfilePhotoFile(file: File): Promise<string> {
  return uploadWithEmergencyFallback("profile", file);
}

export async function uploadCoverPhotoFile(file: File): Promise<string> {
  return uploadWithEmergencyFallback("cover", file, { maxEdge: 1280, quality: 0.82 });
}

export async function deleteStoredPhoto(url: string): Promise<void> {
  if (!isStoragePhotoUrl(url)) return;
  const headers = await authHeaders();
  if (!headers.Authorization) return;

  await fetch(apiUrl("/api/member/photos?action=delete"), {
    method: "POST",
    headers,
    body: JSON.stringify({ url })
  }).catch(() => null);
}

/** Compress only — for instant blob preview while storage upload runs. */
export async function compressPhotoForPreview(file: File) {
  return fileToCompressedImageBlob(file);
}

export async function uploadCompressedProfileBlob(blob: Blob, fallbackFile?: File): Promise<string> {
  try {
    const result = await uploadCompressedBlob("profile", blob, crypto.randomUUID());
    return result.url;
  } catch (error) {
    if (error instanceof PhotoUploadError && error.fallbackAllowed && fallbackFile) {
      return fileToCompressedDataUrl(fallbackFile);
    }
    throw error;
  }
}

export async function uploadCompressedCoverBlob(blob: Blob, fallbackFile?: File): Promise<string> {
  try {
    const result = await uploadCompressedBlob("cover", blob);
    return result.url;
  } catch (error) {
    if (error instanceof PhotoUploadError && error.fallbackAllowed && fallbackFile) {
      return fileToCompressedDataUrl(fallbackFile, { maxEdge: 1280, quality: 0.82 });
    }
    throw error;
  }
}

export function mapUploadError(error: unknown): PhotoUploadError {
  if (error instanceof PhotoUploadError) return error;
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("HEIC_DECODE_UNSUPPORTED") || message.includes("IMAGE_DECODE_FAILED")) {
    return new PhotoUploadError(PHOTO_UPLOAD_FAIL, { code: "IMAGE_DECODE_FAILED" });
  }
  if (message.includes("COMPRESSION_FAILED")) {
    return new PhotoUploadError(PHOTO_UPLOAD_FAIL, { code: "COMPRESSION_FAILED" });
  }
  return new PhotoUploadError(PHOTO_UPLOAD_FAIL, { code: "UPLOAD_FAILED" });
}
