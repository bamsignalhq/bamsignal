import {
  filterPhotosForPublicView,
  isPhotoCountableForSignup,
  normalizePhotoMetaMap
} from "../../shared/photoReview.mjs";
import type { DatingProfile, PhotoReviewMeta, PhotoReviewStatus, PhotoRiskFlag } from "../types";

export type { PhotoReviewStatus, PhotoRiskFlag, PhotoReviewMeta };

export function safePhotoMeta(raw: unknown): Record<string, PhotoReviewMeta> {
  return normalizePhotoMetaMap(raw) as Record<string, PhotoReviewMeta>;
}

export function buildPhotoMetaEntry(
  type: "profile" | "cover",
  status: PhotoReviewStatus,
  flags: PhotoRiskFlag[]
): PhotoReviewMeta {
  return {
    photoReviewStatus: status,
    photoRiskFlags: flags,
    type,
    uploadedAt: new Date().toISOString()
  };
}

export function defaultApprovedPhotoMeta(type: "profile" | "cover"): PhotoReviewMeta {
  return buildPhotoMetaEntry(type, "pending_review", []);
}

export function upsertPhotoMeta(
  photoMeta: Record<string, PhotoReviewMeta> | undefined,
  url: string,
  entry: PhotoReviewMeta
): Record<string, PhotoReviewMeta> {
  return { ...safePhotoMeta(photoMeta), [url]: entry };
}

export function removePhotoMeta(
  photoMeta: Record<string, PhotoReviewMeta> | undefined,
  url: string
): Record<string, PhotoReviewMeta> {
  const next = { ...safePhotoMeta(photoMeta) };
  delete next[url];
  return next;
}

export function prunePhotoMeta(
  photoMeta: Record<string, PhotoReviewMeta> | undefined,
  photos: string[],
  coverPhoto?: string
): Record<string, PhotoReviewMeta> {
  const keep = new Set([...photos, coverPhoto].filter(Boolean));
  const next: Record<string, PhotoReviewMeta> = {};
  for (const [url, meta] of Object.entries(safePhotoMeta(photoMeta))) {
    if (keep.has(url)) next[url] = meta;
  }
  return next;
}

export function getPublicProfilePhotos(profile: Pick<DatingProfile, "photos" | "photoMeta">): string[] {
  return filterPhotosForPublicView(profile.photos, profile.photoMeta) as string[];
}

export function isSignupPhotoCountable(
  url: string,
  photoMeta?: Record<string, PhotoReviewMeta>
): boolean {
  return isPhotoCountableForSignup(url, photoMeta);
}

export function photoReviewLabel(status: PhotoReviewStatus): string {
  if (status === "pending_review") return "Pending review";
  if (status === "hidden") return "Hidden";
  if (status === "rejected") return "Rejected";
  return "Approved";
}

export function riskFlagLabel(flag: PhotoRiskFlag): string {
  const labels: Record<PhotoRiskFlag, string> = {
    no_face_detected: "No face detected",
    possible_ai: "Possible AI",
    possible_logo: "Possible logo",
    text_heavy: "Text heavy",
    document_like: "Document-like",
    qr_detected: "QR detected",
    contact_info_detected: "Contact info"
  };
  return labels[flag] || flag;
}
