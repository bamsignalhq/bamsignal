import { useMemo } from "react";
import {
  PHOTO_PSYCHOLOGY_HOME_THRESHOLD,
  PHOTO_PSYCHOLOGY_SLOT_COUNT,
  PHOTO_PROGRESS_BENEFITS,
  PHOTO_PROGRESS_LEVELS,
  PHOTO_SLOT_LABELS,
  type PhotoProgressLevel,
  type PhotoPsychologyFutureConfig
} from "../constants/photoPsychology";
import type { DatingProfile } from "../types";
import { safeArray } from "../utils/safeProfile";
import { resolveProfileMainPhoto } from "../utils/mainPhoto";

export type PhotoSlotState = {
  index: number;
  label: string;
  filled: boolean;
  url?: string;
  isMain: boolean;
};

function countProfilePhotos(profile: DatingProfile): number {
  return safeArray<string>(profile.photos).filter(Boolean).length;
}

export function resolvePhotoProgressLevel(count: number): PhotoProgressLevel {
  if (count >= 6) return PHOTO_PROGRESS_LEVELS[3];
  if (count >= 4) return PHOTO_PROGRESS_LEVELS[2];
  if (count >= 2) return PHOTO_PROGRESS_LEVELS[1];
  if (count >= 1) return PHOTO_PROGRESS_LEVELS[0];
  return PHOTO_PROGRESS_LEVELS[0];
}

export function photoProgressBenefit(count: number): string | null {
  if (count >= 6) return PHOTO_PROGRESS_BENEFITS[6];
  if (count >= 4) return PHOTO_PROGRESS_BENEFITS[4];
  if (count >= 2) return PHOTO_PROGRESS_BENEFITS[2];
  return null;
}

export function nextPhotoMilestone(count: number): number {
  if (count < 2) return 2;
  if (count < 4) return 4;
  if (count < 6) return 6;
  return 6;
}

export function usePhotoProgress(
  profile: DatingProfile,
  options?: { future?: PhotoPsychologyFutureConfig }
) {
  void options?.future;

  const photoCount = useMemo(() => countProfilePhotos(profile), [profile.photos]);
  const photos = useMemo(() => safeArray<string>(profile.photos).filter(Boolean), [profile.photos]);
  const mainPhoto = useMemo(() => resolveProfileMainPhoto(profile), [profile]);

  const slots = useMemo<PhotoSlotState[]>(() => {
    return Array.from({ length: PHOTO_PSYCHOLOGY_SLOT_COUNT }, (_, index) => {
      const url = photos[index] || (index === 0 ? mainPhoto : undefined);
      return {
        index,
        label: PHOTO_SLOT_LABELS[index] ?? `Photo ${index + 1}`,
        filled: Boolean(url),
        url: url || undefined,
        isMain: index === 0
      };
    });
  }, [photos, mainPhoto]);

  const level = useMemo(() => {
    if (photoCount === 0) return null;
    return resolvePhotoProgressLevel(photoCount);
  }, [photoCount]);

  const benefit = useMemo(() => photoProgressBenefit(photoCount), [photoCount]);
  const nextMilestone = useMemo(() => nextPhotoMilestone(photoCount), [photoCount]);
  const progressPercent = useMemo(
    () => Math.min(100, Math.round((photoCount / PHOTO_PSYCHOLOGY_SLOT_COUNT) * 100)),
    [photoCount]
  );

  return {
    photoCount,
    slots,
    level,
    benefit,
    nextMilestone,
    progressPercent,
    isEmpty: photoCount === 0,
    isOutstanding: photoCount >= PHOTO_PSYCHOLOGY_SLOT_COUNT,
    shouldShowHomeCard: photoCount < PHOTO_PSYCHOLOGY_HOME_THRESHOLD
  };
}
