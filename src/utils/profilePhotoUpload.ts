import type { PhotoUploadErrorCode } from "../constants/photoUploadErrors";
import { PHOTO_UPLOAD_FAIL, photoUploadUserMessage } from "../constants/photos";
import {
  compressPhotoForPreview,
  mapUploadError,
  uploadCompressedProfileBlob
} from "../services/profilePhotos";
import type { PhotoReviewMeta } from "../types";
import { addProfilePhotos } from "./mainPhoto";
import { blobToDataUrl, validatePhotoFile } from "./photoUpload";
import { logPhotoPipeline } from "./photoUploadLog";
import { upsertPhotoMeta } from "./photoMeta";
import { photoMetaFromUpload } from "./photoUploadResult";
import { samePhotoRef } from "./photoRefs";

export type ProfilePhotoUploadResult =
  | { ok: true; url: string; meta: PhotoReviewMeta }
  | { ok: false; message: string; code?: PhotoUploadErrorCode };

export type ProfilePhotoWorkingState = {
  photos: string[];
  meta?: Record<string, PhotoReviewMeta>;
  main?: string;
};

/** Serialize state commits so concurrent uploads append instead of overwriting. */
export function createSerializedQueue() {
  let tail: Promise<unknown> = Promise.resolve();
  return {
    run<T>(task: () => Promise<T> | T): Promise<T> {
      const next = tail.then(() => task());
      tail = next.then(
        () => undefined,
        () => undefined
      );
      return next;
    }
  };
}

export function mergeUploadedProfilePhoto(
  state: ProfilePhotoWorkingState,
  upload: { url: string; meta: PhotoReviewMeta }
): ProfilePhotoWorkingState {
  const nextMeta = upsertPhotoMeta(state.meta, upload.url, upload.meta);
  const added = addProfilePhotos(state.photos, state.main, [upload.url]);
  return {
    photos: added.photos,
    meta: nextMeta,
    main: added.mainPhotoUrl
  };
}

export async function uploadSingleProfilePhotoFile(options: {
  file: File;
  signupMode?: boolean;
  coverPhoto?: string;
  existingPhotos?: string[];
}): Promise<ProfilePhotoUploadResult> {
  const { file, signupMode = false, coverPhoto, existingPhotos = [] } = options;

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
    const tempDataUrl = await blobToDataUrl(compressed.blob);
    if (samePhotoRef(tempDataUrl, coverPhoto)) {
      return { ok: false, message: "Please choose a different image from your cover photo." };
    }
    if (existingPhotos.some((photo) => samePhotoRef(photo, tempDataUrl))) {
      return { ok: false, message: "You already added this photo." };
    }

    logPhotoPipeline("uploading", { signupMode, kind: "profile" });
    const uploadResult = await uploadCompressedProfileBlob(compressed.blob, file, compressed.mime);
    logPhotoPipeline("uploaded", {
      signupMode,
      kind: "profile",
      reviewStatus: uploadResult.reviewStatus || "pending_review"
    });

    const meta = photoMetaFromUpload("profile", uploadResult);
    return { ok: true, url: uploadResult.url, meta };
  } catch (error) {
    const mapped = mapUploadError(error);
    logPhotoPipeline("failed", { code: mapped.code, reason: mapped.message });
    return { ok: false, message: mapped.message || PHOTO_UPLOAD_FAIL, code: mapped.code };
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
