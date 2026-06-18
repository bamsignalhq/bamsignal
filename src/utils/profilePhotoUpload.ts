import type { PhotoUploadErrorCode } from "../constants/photoUploadErrors";
import { photoModerationUserMessage, photoUploadUserMessage } from "../constants/photos";
import {
  compressPhotoForPreview,
  mapUploadError,
  submitPhotoReviewRemote,
  uploadCompressedProfileBlob
} from "../services/profilePhotos";
import type { PhotoReviewMeta } from "../types";
import {
  assessUploadedPhoto,
  moderatePhotoUpload,
  toPhotoReviewMeta
} from "./mediaModeration";
import { blobToDataUrl, validatePhotoFile } from "./photoUpload";
import { logPhotoPipeline } from "./photoUploadLog";
import { samePhotoRef } from "./photoRefs";

export type ProfilePhotoUploadResult =
  | { ok: true; url: string; meta: PhotoReviewMeta }
  | { ok: false; message: string; code?: PhotoUploadErrorCode; moderation?: boolean };

export async function uploadSingleProfilePhotoFile(options: {
  file: File;
  signupMode?: boolean;
  coverPhoto?: string;
  existingPhotos?: string[];
}): Promise<ProfilePhotoUploadResult> {
  const { file, signupMode = false, coverPhoto, existingPhotos = [] } = options;
  const uploadKind = signupMode ? "signup" : "profile";

  try {
    const validation = await validatePhotoFile(file);
    if (!validation.ok) {
      return {
        ok: false,
        message: photoUploadUserMessage(validation.code),
        code: validation.code
      };
    }

    const compressed = await compressPhotoForPreview(file);
    const verdict = await moderatePhotoUpload(file, uploadKind);
    if (!verdict.allowed) {
      return {
        ok: false,
        message: verdict.message || photoModerationUserMessage(),
        code: verdict.code || "MODERATION_REJECTED",
        moderation: true
      };
    }

    const tempDataUrl = await blobToDataUrl(compressed.blob);
    if (samePhotoRef(tempDataUrl, coverPhoto)) {
      return { ok: false, message: "Please choose a different image from your cover photo." };
    }
    if (existingPhotos.some((photo) => samePhotoRef(photo, tempDataUrl))) {
      return { ok: false, message: "You already added this photo." };
    }

    logPhotoPipeline("uploading", { signupMode, kind: "profile" });
    const remoteUrl = await uploadCompressedProfileBlob(compressed.blob, file, compressed.mime);
    logPhotoPipeline("uploaded", { signupMode, kind: "profile" });

    const assessment = await assessUploadedPhoto(file, uploadKind);
    const meta = toPhotoReviewMeta(uploadKind, assessment);

    if (meta.photoReviewStatus === "pending_review" || meta.photoReviewStatus === "rejected") {
      void submitPhotoReviewRemote({
        photoUrl: remoteUrl,
        photoType: "profile",
        photoReviewStatus: meta.photoReviewStatus,
        photoRiskFlags: meta.photoRiskFlags
      });
    }

    return { ok: true, url: remoteUrl, meta };
  } catch (error) {
    const mapped = mapUploadError(error);
    logPhotoPipeline("failed", { code: mapped.code, reason: mapped.message });
    return { ok: false, message: mapped.message, code: mapped.code };
  }
}

export async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (!items.length) return [];
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  }

  const poolSize = Math.min(Math.max(1, limit), items.length);
  await Promise.all(Array.from({ length: poolSize }, () => runWorker()));
  return results;
}
