/** Photo review status helpers — shared by browser + Node. */
import { resolveMainPhotoUrl } from "./mainPhoto.mjs";

export const PHOTO_REVIEW_STATUSES = ["approved", "pending_review", "rejected", "hidden"];

export const PHOTO_RISK_FLAG_VALUES = [
  "no_face_detected",
  "possible_ai",
  "possible_logo",
  "text_heavy",
  "document_like",
  "qr_detected",
  "contact_info_detected"
];

/**
 * Photos visible to others on discovery/public surfaces.
 * Only approved photos may be shown publicly.
 */
export function filterPhotosForPublicView(photos, photoMeta = {}) {
  const list = Array.isArray(photos) ? photos : [];
  return list.filter((url) => {
    const meta = photoMeta?.[url];
    const status = meta?.photoReviewStatus;
    return status === "approved";
  });
}

/** Count toward signup minimum — pending_review and approved both count. */
export function isPhotoCountableForSignup(url, photoMeta = {}) {
  const meta = photoMeta?.[url];
  const status = meta?.photoReviewStatus;
  return !status || (status !== "rejected" && status !== "hidden");
}

export function countCountableSignupPhotos(photos, photoMeta = {}) {
  const list = Array.isArray(photos) ? photos : [];
  return list.filter((url) => isPhotoCountableForSignup(url, photoMeta)).length;
}

export function normalizePhotoMetaEntry(raw, fallbackType = "profile") {
  if (!raw || typeof raw !== "object") return null;
  const status = PHOTO_REVIEW_STATUSES.includes(raw.photoReviewStatus)
    ? raw.photoReviewStatus
    : "pending_review";
  const flags = Array.isArray(raw.photoRiskFlags)
    ? raw.photoRiskFlags.filter((flag) => PHOTO_RISK_FLAG_VALUES.includes(flag))
    : [];
  const type = raw.type === "cover" ? "cover" : fallbackType;
  return {
    photoReviewStatus: status,
    photoRiskFlags: flags,
    type,
    uploadedAt: typeof raw.uploadedAt === "string" ? raw.uploadedAt : new Date().toISOString(),
    rejectReason: typeof raw.rejectReason === "string" ? raw.rejectReason : undefined
  };
}

export function normalizePhotoMetaMap(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out = {};
  for (const [url, entry] of Object.entries(raw)) {
    const normalized = normalizePhotoMetaEntry(entry);
    if (normalized && url) out[url] = normalized;
  }
  return out;
}

function cleanPhotos(photos) {
  return (Array.isArray(photos) ? photos : []).filter(Boolean);
}

function normalizeMainCandidate(url) {
  return typeof url === "string" ? url.trim() : "";
}

/** Public-safe photos: approved only. Unknown status is blocked. */
export function getApprovedPublicPhotos(profile = {}) {
  const photos = cleanPhotos(profile.photos);
  const photoMeta = normalizePhotoMetaMap(profile.photoMeta);
  return filterPhotosForPublicView(photos, photoMeta);
}

/** Public-safe main photo: approved only (or empty when none exists). */
export function getApprovedMainPhoto(profile = {}) {
  const approved = getApprovedPublicPhotos(profile);
  if (!approved.length) return "";
  const mainCandidate = normalizeMainCandidate(profile.mainPhotoUrl);
  return resolveMainPhotoUrl(approved, mainCandidate) || approved[0] || "";
}
