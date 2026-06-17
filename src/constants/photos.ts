import { MOMENT_SETS } from "./showcase";
import { USER_MESSAGES } from "./userMessages";
import type { PhotoUploadErrorCode } from "./photoUploadErrors";

export const MIN_PROFILE_PHOTOS = 2;
export const MAX_PROFILE_PHOTOS = 10;

/** Default profile hero backdrop when member has no cover photo */
export const DEFAULT_PROFILE_COVER = MOMENT_SETS.lagosRooftop[1];

export const PHOTO_UPLOAD_FAIL = USER_MESSAGES.photoUploadFailed;
export const PHOTO_REJECTED = USER_MESSAGES.photoRejected;

const PHOTO_REJECTION_CODES = new Set<PhotoUploadErrorCode>([
  "MODERATION_REJECTED",
  "NOT_IMAGE",
  "IMAGE_DECODE_FAILED"
]);

export function photoUploadUserMessage(code?: PhotoUploadErrorCode): string {
  if (code && PHOTO_REJECTION_CODES.has(code)) return PHOTO_REJECTED;
  return PHOTO_UPLOAD_FAIL;
}

export const GENERIC_PHOTO_REJECT = PHOTO_REJECTED;
export const GENERIC_PHOTO_REJECT_ALT = PHOTO_REJECTED;
