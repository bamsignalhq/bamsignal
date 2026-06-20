import { MOMENT_SETS } from "./showcase";
import { USER_MESSAGES } from "./userMessages";
import type { PhotoUploadErrorCode } from "./photoUploadErrors";

export const MIN_PROFILE_PHOTOS = 2;
export const MAX_PROFILE_PHOTOS = 10;

/** Default profile hero backdrop when member has no cover photo */
export const DEFAULT_PROFILE_COVER = MOMENT_SETS.lagosRooftop[1];

export const PHOTO_UPLOAD_FAIL = USER_MESSAGES.photoUploadFailed;
export const PHOTO_LIMIT_MESSAGE = "You can add up to 10 photos.";
export const PHOTO_BATCH_PARTIAL_FAIL = PHOTO_UPLOAD_FAIL;

/** Upload / decode / compression / storage failures only */
export function photoUploadUserMessage(_code?: PhotoUploadErrorCode): string {
  return PHOTO_UPLOAD_FAIL;
}
