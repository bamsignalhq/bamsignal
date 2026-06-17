import { STORAGE_KEYS } from "../constants/limits";
import { eventsSince, trackEvent } from "./analytics";
import type { PhotoUploadKind } from "../constants/photoUploadKinds";
import type { PhotoRejectionCategory } from "./photoSafetyScan";
import { readJson } from "./storage";

export function trackPhotoRejection(category: PhotoRejectionCategory, kind: PhotoUploadKind): void {
  trackEvent("photo_rejected", { category, kind });
}

export type PhotoRejectionMetricRow = {
  category: PhotoRejectionCategory;
  label: string;
  total: number;
  today: number;
};

const CATEGORY_LABELS: Record<PhotoRejectionCategory, string> = {
  no_face: "No face",
  logo: "Logo",
  document: "Document",
  text_heavy: "Text heavy",
  qr_code: "QR code",
  contact_info: "Contact info",
  other: "Other"
};

const LEGACY_CATEGORY_MAP: Record<string, PhotoRejectionCategory> = {
  document_detected: "document",
  too_much_text: "text_heavy",
  contact_information: "contact_info"
};

function normalizeCategory(raw?: string): PhotoRejectionCategory | null {
  if (!raw) return null;
  if (raw in CATEGORY_LABELS) return raw as PhotoRejectionCategory;
  return LEGACY_CATEGORY_MAP[raw] || null;
}

type EventRow = { event: string; at?: string; meta?: Record<string, string> };

function countPhotoRejections(category: PhotoRejectionCategory): number {
  const rows = readJson<EventRow[]>(STORAGE_KEYS.analytics, []);
  return rows.filter((row) => {
    if (row.event !== "photo_rejected") return false;
    const normalized = normalizeCategory(row.meta?.category);
    return normalized === category;
  }).length;
}

function countPhotoRejectionsToday(category: PhotoRejectionCategory): number {
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const rows = readJson<EventRow[]>(STORAGE_KEYS.analytics, []);
  return rows.filter((row) => {
    if (row.event !== "photo_rejected" || !row.at) return false;
    const normalized = normalizeCategory(row.meta?.category);
    return normalized === category && new Date(row.at).getTime() >= since;
  }).length;
}

export function getPhotoRejectionMetrics(): PhotoRejectionMetricRow[] {
  const categories = Object.keys(CATEGORY_LABELS) as PhotoRejectionCategory[];
  return categories.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    total: countPhotoRejections(category),
    today: countPhotoRejectionsToday(category)
  }));
}

export function totalPhotoRejectionsToday(): number {
  return eventsSince("photo_rejected", 24 * 60 * 60 * 1000);
}

export function totalPhotoRejections(): number {
  return (Object.keys(CATEGORY_LABELS) as PhotoRejectionCategory[]).reduce(
    (sum, category) => sum + countPhotoRejections(category),
    0
  );
}
