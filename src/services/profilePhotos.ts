import { PHOTO_UPLOAD_FAIL, photoUploadUserMessage } from "../constants/photos";
import type { PhotoUploadErrorCode } from "../constants/photoUploadErrors";
import { apiUrl, supabase } from "./supabase";
import { STORAGE_KEYS } from "../constants/limits";
import { isStoragePhotoUrl } from "../utils/photoRefs";
import { blobToDataUrl, fileToCompressedDataUrl, fileToCompressedImageBlob } from "../utils/photoUpload";
import { logPhotoPipeline, logPhotoUpload } from "../utils/photoUploadLog";
import { readResponseJson } from "../utils/httpJson";

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
  if (!supabase) return headers;

  let session = (await supabase.auth.getSession()).data.session;
  if (!session?.access_token) {
    const refreshed = await supabase.auth.refreshSession();
    session = refreshed.data.session;
  }

  const token = session?.access_token;
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

  logPhotoPipeline("uploading", { kind, compressedSize: blob.size, photoId: photoId || null });

  const response = await fetch(apiUrl("/api/member/photos?action=upload"), {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(body)
  });
  const payload = await readResponseJson<{ ok?: boolean; url?: string; error?: string; storageUnavailable?: boolean; photoId?: string }>(response);
  if (!response.ok || !payload?.ok || !payload.url) {
    const storageUnavailable = Boolean(payload?.storageUnavailable) || response.status === 503;
    logPhotoPipeline("failed", {
      kind,
      stage: "storage",
      status: response.status,
      storageUnavailable,
      error: payload?.error || "unknown"
    });
    throw new PhotoUploadError(String(payload?.error || PHOTO_UPLOAD_FAIL), {
      code: "STORAGE_FAILED",
      fallbackAllowed: storageUnavailable
    });
  }

  logPhotoPipeline("uploaded", { kind, url: String(payload.url) });
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
    if (
      !import.meta.env.PROD &&
      error instanceof PhotoUploadError &&
      error.fallbackAllowed
    ) {
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

  const response = await fetch(apiUrl("/api/member/photos?action=delete"), {
    method: "POST",
    headers,
    body: JSON.stringify({ url })
  });
  if (!response.ok && import.meta.env.DEV) {
    const payload = await readResponseJson<{ error?: string }>(response);
    console.warn("[bamsignal] photo delete failed", payload?.error || response.status);
  }
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
    if (
      !import.meta.env.PROD &&
      error instanceof PhotoUploadError &&
      error.fallbackAllowed &&
      fallbackFile
    ) {
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
    if (
      !import.meta.env.PROD &&
      error instanceof PhotoUploadError &&
      error.fallbackAllowed &&
      fallbackFile
    ) {
      return fileToCompressedDataUrl(fallbackFile, { maxEdge: 1280, quality: 0.82 });
    }
    throw error;
  }
}

export function mapUploadError(error: unknown): PhotoUploadError {
  if (error instanceof PhotoUploadError) return error;
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("HEIC_DECODE_UNSUPPORTED") || message.includes("IMAGE_DECODE_FAILED")) {
    return new PhotoUploadError(photoUploadUserMessage("IMAGE_DECODE_FAILED"), {
      code: "IMAGE_DECODE_FAILED"
    });
  }
  if (message.includes("COMPRESSION_FAILED")) {
    return new PhotoUploadError(PHOTO_UPLOAD_FAIL, { code: "COMPRESSION_FAILED" });
  }
  return new PhotoUploadError(PHOTO_UPLOAD_FAIL, { code: "UPLOAD_FAILED" });
}

export type PhotoReviewSubmitPayload = {
  photoUrl: string;
  photoType: "profile" | "cover";
  photoReviewStatus: "approved" | "pending_review" | "rejected";
  photoRiskFlags: string[];
  memberName?: string;
  profileId?: string;
};

function currentMemberProfileId(): string | undefined {
  const id = localStorage.getItem(STORAGE_KEYS.memberProfileId);
  return id?.trim() || undefined;
}

export async function submitPhotoReviewRemote(payload: PhotoReviewSubmitPayload): Promise<void> {
  const headers = await authHeaders();
  if (!headers.Authorization) return;

  try {
    const response = await fetch(apiUrl("/api/member/photos?action=submit-review"), {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...payload,
        profileId: payload.profileId || currentMemberProfileId()
      })
    });
    if (!response.ok && import.meta.env.DEV) {
      const body = await readResponseJson<{ error?: string }>(response);
      console.warn("[bamsignal] photo review submit failed", body?.error || response.status);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[bamsignal] photo review submit error", error);
    }
  }
}

export async function reportPhotoViolationRemote(payload: {
  reason: string;
  photoRiskFlags?: string[];
  photoUrl?: string;
  profileId?: string;
}): Promise<void> {
  const headers = await authHeaders();
  if (!headers.Authorization) return;

  const profileId = payload.profileId || currentMemberProfileId();
  if (!profileId) return;

  try {
    const response = await fetch(apiUrl("/api/member/photos?action=report-violation"), {
      method: "POST",
      headers,
      body: JSON.stringify({ ...payload, profileId })
    });
    if (!response.ok && import.meta.env.DEV) {
      const body = await readResponseJson<{ error?: string }>(response);
      console.warn("[bamsignal] photo violation report failed", body?.error || response.status);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[bamsignal] photo violation report error", error);
    }
  }
}
