import { MOMENT_SETS } from "./showcase";
import { USER_MESSAGES } from "./userMessages";
import type { PhotoUploadErrorCode } from "./photoUploadErrors";

export const MIN_PROFILE_PHOTOS = 2;
export const MAX_PROFILE_PHOTOS = 10;

/** Default profile hero backdrop when member has no cover photo */
export const DEFAULT_PROFILE_COVER = MOMENT_SETS.lagosRooftop[1];

export const PHOTO_UPLOAD_FAIL = USER_MESSAGES.photoUploadFailed;
export const PHOTO_REJECTED = USER_MESSAGES.photoRejected;

/** Upload / decode / compression / storage failures */
export function photoUploadUserMessage(code?: PhotoUploadErrorCode): string {
  if (code === "MODERATION_REJECTED") return PHOTO_REJECTED;
  return PHOTO_UPLOAD_FAIL;
}

export function photoModerationUserMessage(): string {
  return PHOTO_REJECTED;
}

export const GENERIC_PHOTO_REJECT = PHOTO_REJECTED;
export const GENERIC_PHOTO_REJECT_ALT = PHOTO_REJECTED;
