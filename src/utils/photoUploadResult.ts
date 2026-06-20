import type { PhotoReviewStatus, PhotoRiskFlag } from "../types";
import { buildPhotoMetaEntry } from "./photoMeta";
import { submitPhotoReviewRemote } from "../services/profilePhotos";

export type PhotoUploadModerationPayload = {
  reviewStatus?: PhotoReviewStatus;
  photoRiskFlags?: PhotoRiskFlag[];
  moderationRejected?: boolean;
};

export function photoMetaFromUpload(
  type: "profile" | "cover",
  payload: PhotoUploadModerationPayload
) {
  const status = payload.reviewStatus || "pending_review";
  const flags = (payload.photoRiskFlags || []) as PhotoRiskFlag[];
  return buildPhotoMetaEntry(type, status, flags);
}

export function queuePhotoReviewAsync(
  photoUrl: string,
  type: "profile" | "cover",
  payload: PhotoUploadModerationPayload
): void {
  const status = payload.reviewStatus || "pending_review";
  if (status === "approved" && !(payload.photoRiskFlags || []).length) return;

  void submitPhotoReviewRemote({
    photoUrl,
    photoType: type,
    photoReviewStatus: status,
    photoRiskFlags: (payload.photoRiskFlags || []) as PhotoRiskFlag[]
  });
}
