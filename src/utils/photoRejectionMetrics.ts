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
  document_detected: "Document detected",
  too_much_text: "Too much text",
  contact_information: "Contact information",
  qr_code: "QR code",
  other: "Other"
};

type EventRow = { event: string; at?: string; meta?: Record<string, string> };

function countPhotoRejections(category: PhotoRejectionCategory): number {
  const rows = readJson<EventRow[]>(STORAGE_KEYS.analytics, []);
  return rows.filter((row) => row.event === "photo_rejected" && row.meta?.category === category).length;
}

function countPhotoRejectionsToday(category: PhotoRejectionCategory): number {
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const rows = readJson<EventRow[]>(STORAGE_KEYS.analytics, []);
  return rows.filter(
    (row) =>
      row.event === "photo_rejected" &&
      row.meta?.category === category &&
      row.at &&
      new Date(row.at).getTime() >= since
  ).length;
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
  return countPhotoRejections("no_face") +
    countPhotoRejections("document_detected") +
    countPhotoRejections("too_much_text") +
    countPhotoRejections("contact_information") +
    countPhotoRejections("qr_code") +
    countPhotoRejections("other");
}
